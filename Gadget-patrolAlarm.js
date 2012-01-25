// Patrollers alarm clock

(function() {

var cookiename = 'patrollers_alarmclock',
    distressLimit = window.wgPatrolDistressLimit || 150,
 	frequency = window.wgPatrolDistressRestSeconds || 120,
	keys = {distress: 'inDistress', lastTest: 'lastTestedPatrols', lastVisitRC: 'lastVisitRC'};
 
function tsToDate(rc) {
	dar = rc.timestamp.split(/[^\d]/); // timestamp looks like so: "2011-05-05T18:56:27Z"
	var month = parseInt(dar[1],10) - 1; // "Date" expexts months in the range of 0..11, timestamp is more conventional.
	return new Date(dar[0],month,dar[2],dar[3],dar[4],dar[5]);
}

function sendNonPatrolledEditsQuery() {
	var params = {action: 'query', list: 'recentchanges', rcshow: '!patrolled', rclimit: 100, format: 'json'}
	$.getJSON(mw.util.wikiScript('api'), params, function(data) {
		cookieVal(keys.lastTest, new Date().valueOf());
		if (data && data.query && data.query.recentchanges) {
			var ar = data.query.recentchanges;
			var interval = tsToDate(ar[0]) - tsToDate(ar[99]);
			if (interval < distressLimit * 60 * 1000)
				distress(true);
		}
	});
}

function cookieVal(key, val) {
	var ar = ($.cookie(cookiename) || '').split("\n"),
		cookieContent = {};
	for (var i in ar) {
		var keyval = ar[i].split("\t");
		if (keyval.length == 2)
			cookieContent[keyval[0]] = keyval[1];
	}
	
	if (typeof val == "undefined") // getting
		return cookieContent[key]; // might be undefined
	else { // setting
		cookieContent[key] = val;
		var res = [];
		for (var key in cookieContent)
			res.push(key + "\t" + cookieContent[key]);
		$.cookie(cookiename, res.join("\n"), {path: '/', expires: 1});
	}
}

function clearCookie() {$.cookie(cookiename, null, {path: '/'});}

function distressMessage() {
	var li = $('#n-recentchanges'),
		inDistress = distress();
	if (li.attr('distress') == inDistress)
		return;
	li.attr('distress', inDistress)
	if (inDistress) {
		li
		.css({backgroundColor:'yellow',cursor:'pointer'})
		.attr({title: "מצוקת ניטור חמורה.\n.כל המצילים מתבקשים לחוף גורדון"})
		.click(function(e){
			if (e.button == 0)
				window.location=mw.util.wikiScript() + '?title=מיוחד:שינויים_אחרונים&hidepatrolled=1';
		});
	}
	else
		li
		.css({background: '', cursor: ''})
		.attr({title: ''})
		.undelegate('click');
}

function distress(val) {
	if (typeof val === "boolean") {
		cookieVal(keys.distress, val.toString());
		distressMessage();
	} else 
		return cookieVal(keys.distress) === "true"
}


function patrollersWakeUpPeriodic() {
	//if we've been in recent changes in last 5 minutes, or we tested patrolls in last 5 minutes, do nothing.
	try {
		var ts = parseInt(cookieVal(keys.lastVisitRC)  || "0");
		if (ts && ((new Date() - new Date(ts)) < frequency * 1000)) {
			distress(false);
			return;
		}
	} catch(e) {
		clearCookie();
	}

	if (distress()) {
		distressMessage(true);
		return;
	}

	try {
		ts = parseInt(cookieVal(keys.lastTest)  || "0");
		if (ts && ((new Date() - new Date(ts)) < frequency * 1000))
			return;
	} catch(e) {
		clearCookie();
	}

	sendNonPatrolledEditsQuery();
}

if (wgCanonicalSpecialPageName == 'Recentchanges') {  // mark cookie with last visit and exit.
	cookieVal(keys.lastVisitRC, new Date().valueOf());
	distress(false);
}
else
	setInterval(patrollersWakeUpPeriodic, 1000); // it's ok to call every second - the function will quit if needed.

})();

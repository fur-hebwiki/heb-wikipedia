// Patrollers alarm clock

function pac_sendNonPatrolledEditsQuery() {
	var params = {action: 'query', list: 'recentchanges', rcshow: '!patrolled', rclimit: 100, format: 'json'}
	$.getJSON(wgScriptPath + '/api.php?', params, pac_countNonPatrolledEdits);
}

function pac_countNonPatrolledEdits(data) {
	pac_setCookieVal('lastTestedPatrols', new Date().valueOf());
	if (data && data.query && data.query.recentchanges) {
		var interval = pac_tsToDate(ar[0]) - pac_tsToDate(ar[99]);
		var limit = typeof wgPatrolDistressLimit == "undefined" ? 150 : wgPatrolDistressLimit;
		if (interval < limit * 60 * 1000)
			pac_setDistress(true);
	}
}

function pac_simpleSerialize(obj) {
	var res = [];
	for (var key in obj) 
		res.push(key + "\t" + obj[key]);
	return res.join("\n");
}

function pac_simpleDeserialize(str) {
	ar = str.split("\n");
	var res = {};
	for (var i in ar) {
		var keyval = ar[i].split("\t");
		if (keyval.length == 2)
			res[keyval[0]] = keyval[1];
	}
	return res;
}

function pac_cookieContent() {
	var str = $.cookie('patrollers_alarmclock', { path: '/' }) || '';
	return pac_simpleDeserialize(str);
}

function pac_setCookieVal(key, val) {
	var attr = pac_cookieContent();
	attr[key] = val;
	$.cookie('patrollers_alarmclock', pac_simpleSerialize(attr), { path: '/', expires: 1 });
}

function pac_getCookieVal(key) {
	var attr = pac_cookieContent();
	return attr[key];
}

function pac_clearCookie() {
	$.cookie('patrollers_alarmclock', null, {path: '/'});
}

function pac_distressMessage(distress) {
	var li = document.getElementById("n-recentchanges");
	if (!li)
		return;
	if (distress) {
		$.extend(li.style, {backgroundColor:'yellow',cursor:'pointer'});
		li.title = "מצוקת ניטור חמורה.\n.כל המצילים מתבקשים לחוף גורדון";
		li.onclick = function(){window.location='http://he.wikipedia.org/w/index.php?title=מיוחד:שינויים_אחרונים&hidepatrolled=1';}
	} else {
		li.style.background = li.style.cursor = li.title = '';
		delete li.onclick;
	}
}

function pac_setDistress(distress) {
	pac_setCookieVal("inDistress", distress ? "1" : "0");
	pac_distressMessage(distress);
}

function pac_getDistress() {
	return pac_getCookieVal("inDistress") == "1";
}

function pac_tsToDate(rc) {
	dar = rc.timestamp.split(/[^\d]/); // timestamp looks like so: "2011-05-05T18:56:27Z"
	var month = parseInt(dar[1],10) - 1; // "Date" expexts months in the range of 0..11, timestamp is more conventional.
	return new Date(dar[0],month,dar[2],dar[3],dar[4],dar[5]);
}

function pac_patrollersWakeUpPeriodic() {
	//if we've been in recent changes in last 5 minutes, or we tested patrolls in last 5 minutes, do nothing.
	var numSecs = typeof wgPatrolDistressRestSeconds == "undefined" ? 1 * 120 : wgPatrolDistressRestSeconds;
	try {
		var ts = parseInt(pac_getCookieVal('lastVisitRC')  || "0");
		if (ts && ((new Date() - new Date(ts)) < numSecs * 1000)) {
			pac_setDistress(false);
			return;
		}
	} catch(e) {
		pac_clearCookie();
	}
	
	if (pac_getDistress()) {
		pac_distressMessage(true);
		return;
	}
	
	try {
		ts = parseInt(pac_getCookieVal('lastTestedPatrols')  || "0");
		if (ts && ((new Date() - new Date(ts)) < numSecs * 1000))
			return;	
	} catch(e) {
		pac_clearCookie();
	}

	pac_sendNonPatrolledEditsQuery();
}

function pac_patrollersWakeUp() {
	if (wgCanonicalSpecialPageName == 'Recentchanges') {  // mark cookie with last visit and exit.
		pac_setCookieVal('lastVisitRC', new Date().valueOf());
		pac_setDistress(false);
	}
	else 
		setInterval(pac_patrollersWakeUpPeriodic, 1000); // it's ok to call every second - the function will quit if needed.
}

hookEvent("load", pac_patrollersWakeUp);


wgPatrolDistressRestSeconds = 10;
wgPatrolDistressLimit = 20;


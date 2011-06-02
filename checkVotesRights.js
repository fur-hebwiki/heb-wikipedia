/*
 * סקריפט לבדיקת זכות הצבעה. הסקריפט מוסיף קישור בתיבת הכלים. לחיצה על קישור זה מוסיפה קישורי "±" ליד קישורים לדפי משתמש. לחיצה על קישור זה תבצע את הבדיקה. 
 * נבדק ב-IE8.
 * נכתב על ידי [[משתמש:Yonidebest]]
 *
 */

function updateVoteRightResult(userName, id, result) {
	var span = document.getElementById('votelink' + id);
	if (span)
		span.innerHTML = ' (<font color="' +
			(result == 'עבר' ? 'green' : 'red') + 
			'">' + result + '</font>)';
}

function pad(num, width) {
	width -= num.toString().length;
	return (width > 0 ? new Array(width+1).join('0') : '') + num;
}

function formatDate(date) {
	return date.getFullYear() + 
		pad(date.getMonth(), 2) +
		pad(date.getDate(), 2) +
		pad(date.getHours(), 2) +
		pad(date.getMinutes(), 2) +
		'00';
}

function analyzeContribs
function check100EditsIn90Days(userName, id) {
	var a = sajax_init_object();
	a.open('GET', 'http://he.wikipedia.org/w/api.php?action=query' + 
			'&format=xml' + 
			'&list=usercontribs' + 
			'&ucuser=' + escape(userName) +
			'&ucprop=' + 
			'&ucnamespace=0|6|8|10|12|14|100' + 
			'&uclimit=100' +
			'&ucstart=' + formatDate(myCheckDate) +
			'&ucend=' + formatDate(myCheckDate + 90 * 24 * 60 * 60 * 1000)
			);
	a.onreadystatechange = function() {
		if (this.readyState != 4) 
			return;
		var xml = this.responseXML;
		var contribs = xml.getElementsByTagName('item');
		updateVoteRightResult(userName, id, contribs.length == 100 ? 'עבר' : 'נכשל - אין 100 עריכות ב-90 ימים'); 
	};
	a.send(null);
}

function checkUserSeniority(userName, id) {
	var a = sajax_init_object();
	a.open('GET', 'http://he.wikipedia.org/w/api.php?action=query&list=usercontribs&ucuser=' + userName + '&ucprop=timestamp&format=xml&ucdir=newer&uclimit=1' , true);
	a.onreadystatechange = function() {
		if (this.readyState != 4) 
			return;
		var xml = this.responseXML;
		var contribs = xml.getElementsByTagName('item');
		var pass = contribs.length > 0 &&
			new Date() - new Date(contribs[0].getAttribute("timestamp")) > 30 * 24 * 60 * 60 * 1000;
		if (pass)
			check100EditsIn90Days(userName, id);
		else
			updateVoteRightResult(userName, id, 'נכשל - אין 30 ימי ותק'); // failed - less than 30 days
	};
	a.send(null);
}

var myCheckDate = new Date();

function checkVoteRights(userName, id) {
	var textboxTime = document.getElementById('checkTime');
	var rxTime = new RegExp("[0-2][0-9]:[0-5][0-9]");
	var mTime = rxTime.exec(textboxTime.value);
	if (!mTime) // no time added, use default
	textboxTime.value = '12:00'; 

	var textboxDate = document.getElementById('checkDate');
	if (textboxDate == 'ddmmyyyy') {
		alert("יש להזין את תאריך הבדיקה (בדרך כלל תאריך תחילת ההצבעה) בתיבה המתאימה."); // type check date in the appropriate textbox
		return;
	}
	var rxDate = new RegExp("[0-3][0-9][0-1][0-9]20[0-9][0-9]");
	var mDate = rxDate.exec(textboxDate.value);
	if (!mDate) { // date not inserted correctly
		alert('התאריך שהוזן אינו תקין. יש להזין יום ב-2 ספרות, לאחר מכן חודש ב-2 ספרות ולאחר מכן שנה ב-4 ספרות.'); // incorrect date
		return;
	}

	if (id == "-1") { // checking user from user page - add span
		var link = document.getElementById('checkDateLink');
		var span = document.createElement('span');
		span.id = 'votelink-1';
		span.innerHTML = '<font color="orange">בודק...</font>'; // checking...
		link.parentNode.insertBefore(span, link);
		link.parentNode.removeChild(link);
	}
	else { // get ready-made span
	var span = document.getElementById('votelink' + id);
	span.innerHTML = ' (<font color="orange">בודק...</font>) '; // checking...
	}

	myCheckDate.setFullYear(textboxDate.value.substr(4, 4), eval(textboxDate.value.substr(2, 2)) - 1, textboxDate.value.substr(0, 2)); // year, month, day
	myCheckDate.setHours(textboxTime.value.substr(0, 2), textboxTime.value.substr(3, 2));

	checkUserSeniority(userName, id);
}

function addVoteRightsLinks(type) {
	var textbox1 = document.createElement('input');
	textbox1.size = "10";
	textbox1.id = 'checkDate';
	textbox1.value = 'ddmmyyyy';
	var toolLink = document.getElementById('t-showvoterights');
	toolLink.parentNode.insertBefore(textbox1, toolLink);
	var textbox2 = document.createElement('input');
	textbox2.id = 'checkTime';
	textbox2.size = "10";
	textbox2.value = 'hh:mm';
	toolLink.parentNode.insertBefore(textbox2, toolLink);
	if (type == 1) { // one-user check
		var link = document.createElement('a');
		link.id = 'checkDateLink';
		link.appendChild(document.createTextNode('בצע בדיקה'));
		link.href = 'javascript:checkUserVoteRight()';
		toolLink.innerHTML = "";
		toolLink.appendChild(link);
	} else { // page check
		toolLink.parentNode.removeChild(toolLink);
		var links = document.getElementById('bodyContent').getElementsByTagName('a');
		if (!links || !links[0]) 
			return; // no links in page
		for (var i = 0; i < links.length; i++) {
			var link = links[i];
			if (link.title.indexOf('משתמש:') == -1 || link.title.indexOf('שיחת משתמש') == 0) 
				continue;
			var span = document.createElement('span');
			span.id = 'votelink' + i;
			span.innerHTML = ' (';
			var a = document.createElement('a');
			a.appendChild(document.createTextNode('±'));
			var userName = link.title.substring(6);
			if (userName.indexOf(' (הדף אינו קיים)') != -1)
				userName = userName.substring(0, userName.indexOf(' (הדף אינו קיים)'));
			a.href = 'javascript:checkVoteRights("' + userName + '", ' + i + ')';
			a.title = 'בדוק זכות הצבעה של משתמש זה'; // check this user's voting rights
			span.appendChild(a);
			span.innerHTML += ') ';
			link.parentNode.insertBefore(span, link);
			i++; // because we just added a new link
		}
	}
}

function checkUserVoteRight() {
 var textbox = document.getElementById('checkDate');
 if (textbox == 'ddmmyyyy') {
  alert("יש להזין את תאריך הבדיקה (בדרך כלל תאריך תחילת ההצבעה) בתיבה המתאימה."); // type check date in the appropriate textbox
  return;
 }
 
 var username = (wgTitle.indexOf('/') == -1) ? wgTitle : wgTitle.substr(0, wgTitle.indexOf('/'));
 checkVoteRights(username, '-1');
}

function initCheckVoteRights() {
 if (wgNamespaceNumber % 2 == 1 || wgNamespaceNumber == 4) 
  addPortletLink('p-tb', "javascript:addVoteRightsLinks(0)", 'בדוק זכות הצבעה', 't-showvoterights', 'בדוק זכות הצבעה של משתמשים בדף זה', "", 't-specialpages');
 if (wgNamespaceNumber == 2)
  addPortletLink('p-tb', "javascript:addVoteRightsLinks(1)", 'בדוק זכות הצבעה של משתמש זה', 't-showvoterights', 'בדוק זכות הצבעה של משתמש זה', "", 't-specialpages');
}

addOnloadHook(initCheckVoteRights);
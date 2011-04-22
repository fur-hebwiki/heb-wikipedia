/*
 * סקריפט לבדיקת זכות הצבעה. הסקריפט מוסיף קישור בתיבת הכלים. לחיצה על קישור זה מוסיפה קישורי "±" ליד קישורים לדפי משתמש. לחיצה על קישור זה תבצע את הבדיקה. 
 * נבדק ב-IE8.
 * נכתב על ידי [[משתמש:Yonidebest]]
 *
 */

function updateVoteRightResult(userName, id, result) {
 var span = document.getElementById('votelink' + id);
 var text = '<font color="';
 if (result == 'עבר') // pass
  text += 'green';
 else // failed
  text += 'red';
 text += '">' + result + '</font>';
 span.innerHTML = ' (' + text + ') ';
}

function check100EditsAnd90Days(userName, id) {
 var a = sajax_init_object();
 a.open('GET', 'http://he.wikipedia.org/w/api.php?action=query&format=xml&list=usercontribs&ucuser=' +
                userName +
				'&ucprop=title|timestamp&ucnamespace=0|6|8|10|12|14|100&uclimit=100&ucstart=' +
				myCheckDate.getFullYear() +
				(( (myCheckDate.getMonth() + 1) <= 9 ) ? '0' + (myCheckDate.getMonth() + 1) : (myCheckDate.getMonth() + 1)) +
				(( myCheckDate.getDate() <= 9 ) ? '0' + myCheckDate.getDate() : myCheckDate.getDate()) +
				(( myCheckDate.getHours() <= 9 ) ? '0' + myCheckDate.getHours() : myCheckDate.getHours()) +
				(( myCheckDate.getMinutes() <= 9 ) ? '0' + myCheckDate.getMinutes() : myCheckDate.getMinutes()) +
				'00', true);
 a.onreadystatechange = function() {
   if (a.readyState != 4) return;
   var rx = new RegExp('timestamp="(\\d{4})-(\\d{2})-(\\d{2})T(\\d{2}):(\\d{2})', 'g');
   var m;
   var counter = 1;
   while (counter < 101) {
    m = rx.exec(a.responseText);
	if (!m) { // no 100 edits
	 updateVoteRightResult(userName, id, 'נכשל - אין 100 עריכות'); // failed - no 100 edits
	 return;
	}
	counter++;
   }
   // if reached here, there are 100 edit - check 90 day rule
   var compareDate = new Date();
   compareDate.setFullYear(m[1], eval(m[2]) - 1, m[3]);
   compareDate.setHours(m[4], m[5]);
   if (((myCheckDate - compareDate)/60/60/1000/24) > 91) { // more than 91 days
	updateVoteRightResult(userName, id, 'נכשל - אין 100 עריכות ב-90 ימים'); // failed - more than 90 days
	return;
   }
   // if reached here, passed all tests.
   updateVoteRightResult(userName, id, 'עבר'); // passed
  };
 a.send(null);
}

function checkUserSeniority(userName, id) {
 var a = sajax_init_object();
 a.open('GET', 'http://he.wikipedia.org/w/api.php?action=query&list=usercontribs&ucuser=' + userName + '&ucprop=title|timestamp&format=xml&ucdir=newer&uclimit=1' , true);
 a.onreadystatechange = function() {
   if (a.readyState != 4) return;
   if (a.responseText.indexOf('item userid=') == -1) { // there are no contributions
	updateVoteRightResult(userName, id, 'נכשל - אין תרומות'); // failed - no contributions
	return;
   } else { // there are contributions - check first edit date
    var rx = new RegExp('timestamp="(\\d{4})-(\\d{2})-(\\d{2})T(\\d{2}):(\\d{2})');
	var m = rx.exec(a.responseText);
    if (m && m[0]) {
	 var compareDate = new Date();
	 compareDate.setFullYear(m[1], eval(m[2]) - 1, m[3]);
	 compareDate.setHours(m[4], m[5]);
	 if (((myCheckDate - compareDate)/60/60/1000/24) < 30) { // less than 30 days
	  updateVoteRightResult(userName, id, 'נכשל - אין 30 ימי ותק'); // failed - less than 30 days
	  return;
     } else { // passes seniority - on to next test
	  check100EditsAnd90Days(userName, id);
	 }
	}
   }
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
 }
 else { // page check
 
  toolLink.parentNode.removeChild(toolLink);

  var links = document.getElementById('bodyContent').getElementsByTagName('a');

  if (!links || !links[0]) return; // no links in page
 
  for (var i = 0; i < links.length; i++) {
   if (links[i].title.indexOf('משתמש:') == -1 || links[i].title.indexOf('שיחת משתמש') == 0) continue;
  
   var span = document.createElement('span');
   span.id = 'votelink' + i;
   span.innerHTML = ' (';
   var a = document.createElement('a');
   a.appendChild(document.createTextNode('±'));
   var userName = links[i].title.substring(6);
   if (userName.indexOf(' (הדף אינו קיים)') != -1)
    userName = userName.substring(0, userName.indexOf(' (הדף אינו קיים)'));
   a.href = 'javascript:checkVoteRights("' + userName + '", ' + i + ')';
   a.title = 'בדוק זכות הצבעה של משתמש זה'; // check this user's voting rights
   span.appendChild(a);
   span.innerHTML += ') ';
   links[i].parentNode.insertBefore(span, links[i]);
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
/*** Allows to mark articles as patrolled in the RC page.
* Written by [[UserLYonidebest]]
*
****/

function rcMarkPatrol() {
	var rcspan = this.parentNode;
	rcspan.innerHTML = '<font color="orange">מסמן...</font> ';
	var a = sajax_init_object();
	a.open('GET', 'http://he.wikipedia.org/w/index.php?title=' + this.value + '&action=markpatrolled&rcid=' + this.id, true);
	a.abbr = this.abbr;
	a.onreadystatechange = function() {
		if (a.readyState != 4) 
			return;
		var good = -1 != a.responseText.indexOf('סומן כבדוק');
		rcspan.innerHTML = 
			good ? '<font color="green">סומן כבדוק</font>; '
					: '<font color="red">ארעה שגיאה. לא סומן כבדוק. רענן את הדף ונסה שנית.</font> ';
		if (good)
			this.abbr.style.display = 'none';
 	};
	a.send(null);
}


function checkBoxOfHref(link, abbr) {
	var rx1 = new RegExp('rcid=(\\d+)');
	var rx2 = new RegExp('title=([^&]*)');
	
	// find rcid and page title from the href.
	var title = null, rcid = null; 
	for (var i = 0; i < link.length; i++) 
		if (link[i].href && (rcid = rx1.exec(link[i].href)) && (title = rx2.exec(link[i].href))) 
			break;
	
	// if either is missing - no can do.
	if (! (rcid && title))
		return null;
	

  	var checkbox = document.createElement('input');
	checkbox.type = 'checkbox';
	var cbAtt = { id: rcid[1], value: title[1], title: 'סמן כבדוק', onclick: rcMarkPatrol, abbr:  abbr}; 
	for (key in cbAtt )
		checkbox[key] = cbAtt[key];
	return checkbox;
}
	
function rcPatrolCreateRcSpan(container, checkbox, unpatrolled, toClean) {
	var rcspan = document.createElement('SPAN');
	rcspan.id = 'rcspan';
	rcspan.appendChild(checkbox);
	if (toClean) {
		container.innerHTML = container.innerHTML.replace(/&nbsp;/g, '');
		container.style.textAlign = 'left';	
		container.appendChild(rcspan);
	} else {
		var x;
		for (x = unpatrolled; x.previousSibling && x.previousSibling.nodeName == "ABBR" ;) 
			x = x.previousSibling;
		container.insertBefore(rcspan, x);
	}
}

function rcPatrol()
{
	// let's go over all the 'li' elements: normal state.
	var itemList = document.getElementById('bodyContent').getElementsByTagName('LI');
	for (var i = 0; i < itemList.length; i++) {
		var element = itemList[i];
		var unpatrolled = getElementsByClassName(element, 'ABBR', 'unpatrolled')[0];
	
	  	if (!unpatrolled) 
	  		continue;
	
		var link = itemList[i].getElementsByTagName('A');
		if (!link)
			continue;
		var checkbox = checkBoxOfHref(link, unpatrolled);
		if (checkbox)
			rcPatrolCreateRcSpan(element, checkbox, unpatrolled, false);
	}
	// now let's go over the 'td' elements - this is for "improved list" state.
	itemList = document.getElementById('bodyContent').getElementsByTagName('TD');

	for (var i = 0; i < itemList.length - 1; i++) {
		var unpatrolled = getElementsByClassName(itemList[i], 'ABBR', 'unpatrolled')[0];
		if (!unpatrolled) 
			continue; // patrolled
		// important! note the +1! the link is in the next td after the abbr, unlike the "li" case.
		var link = itemList[i+1].getElementsByTagName('A');
		if (!link || !link[0] || !link[0].href)
			continue;
		var checkbox = checkBoxOfHref(link, unpatrolled);
		if (checkbox)
			rcPatrolCreateRcSpan(itemList[i], checkbox, unpatrolled, true);
	}
}


/* Mark articles as patrolled using ajax - without leaving the page
 *
 * Written by [[User:Yonidebest]]
 *
 */

var patrolAjaxLink;

function markPatrolAjax() {
	var patrolAjaxId = document.getElementById('patrolAjax');
	patrolAjaxId.innerHTML = 'מסמן...';
	patrolAjaxId.onclick = 'return false';
	var a = sajax_init_object();
	a.open('GET', patrolAjaxLink, true);
	a.onreadystatechange = function() {
		if (a.readyState != 4) 
			return;
		var good = -1 != a.responseText.indexOf('סומן כבדוק'); 
		if (good) {
			patrolAjaxId.innerHTML = 'סומן כבדוק';
			patrolAjaxId.href = "";
		} else {
			patrolAjaxId.innerHTML = 'ארעה שגיאה. לא סומן כבדוק. נסה בשנית.';
			patrolAjaxId.onclick = 'return true';
		}
	}
	a.send(null);
}

function markPatrolAjaxInit() {
	var patrollinks = document.getElementsByClassName('span', 'patrollink');
	if (!patrollinks || !patrollinks.length)
			patrollinks = document.getElementsByClassName('div', 'patrollink');
	if (!patrollinks || !patrollinks.length) 
		return;
	
	var aElement = patrollinks[0].getElementsByTagName('A')[0];
	patrolAjaxLink = aElement.href;
	aElement.href = 'javascript:markPatrolAjax();';
	aElement.id = 'patrolAjax';
}

switch (wgCanonicalSpecialPageName) {
	case "Recentchanges":
	case "Watchlist":
	case "Recentchangeslinked":
	  	addOnloadHook(rcPatrol);
		addOnloadHook(markPatrolAjaxInit);
		break;
	default:
}

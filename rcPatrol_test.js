/*** Allows to mark articles as patrolled in the RC page.
   * Written by [[UserLYonidebest]]
   *
****/

 
function rcMarkPatrol_test() {
 var checkbox = this;
 var td = checkbox.parentNode;
 td.innerHTML = '<font color="orange">מסמן...</font> ';
 var a = sajax_init_object();
 a.open('GET', 'http://he.wikipedia.org/w/index.php?title=' + checkbox.value + '&action=markpatrolled&rcid=' + checkbox.id, true);
 a.onreadystatechange = function() {
  if (a.readyState != 4) return;
  if (a.responseText.indexOf('סומן כבדוק') != -1)
   td.innerHTML = '<font color="green">סומן כבדוק</font>; ';
  else
   td.innerHTML = '<font color="red">ארעה שגיאה. לא סומן כבדוק. רענן את הדף ונסה שנית.</font> ';
 }
 a.send(null);
}

function rcPatrol_test()
{
 var itemList = document.getElementById('bodyContent').getElementsByTagName('TD');

 for (var i = 0; i < itemList.length - 1; i++) {
  var unpatrolled = getElementsByClassName(itemList[i], 'ABBR', 'unpatrolled');

  if (!unpatrolled[0]) continue; // patrolled

  var link = itemList[i+1].getElementsByTagName('A');
  if (!link || !link[0] || !link[0].href)
	continue;

  // get rcid page
  var rx1 = new RegExp('rcid=(\\d+)');
  var rx2 = new RegExp('title=([^&]*)');
  var m1 = null, flink = null, m2 = null;
	for (var j = 0; j < link.length; j++) {
		flink = link[j];
		if ((flink.href) && (m1 = rx1.exec(flink.href)) && (m2 = rx2.exec(flink.href))) 
			break;
	}
  if (!m1 || !m2) continue;

  var checkbox = document.createElement('INPUT');
  checkbox.type = 'checkbox';
  checkbox.id = m1[1];
  checkbox.value = m2[1];
  checkbox.title = 'סמן כבדוק';
  checkbox.brother = unpatrolled;
  checkbox.onclick = rcMarkPatrol_test;
	itemList[i].innerHTML = itemList[i].innerHTML.replace(/&nbsp;/g, '');
	itemList[i].appendChild(checkbox, unpatrolled);
	itemList[i].style.textAlign = 'left';
  
 }
}
if ( wgCanonicalSpecialPageName == "Recentchanges" ||
     wgCanonicalSpecialPageName == "Watchlist" ||
     wgCanonicalSpecialPageName == "Recentchangeslinked" ) addOnloadHook(rcPatrol_test);
/* Mark articles as patrolled using ajax - without leaving the page
 *
 * Written by [[User:Yonidebest]]
 *
 */

var patrolAjaxLink_test;

function markPatrolAjax_test() {
 var patrolAjaxId = document.getElementById('patrolAjax');
 patrolAjaxId.innerHTML = 'מסמן...';
 patrolAjaxId.onclick = 'return false';
 var a = sajax_init_object();
 a.open('GET', patrolAjaxLink_test, true);
 a.onreadystatechange = function() {
  if (a.readyState != 4) return;
  if (a.responseText.indexOf('סומן כבדוק') != -1) {
   patrolAjaxId.innerHTML = 'סומן כבדוק';
   patrolAjaxId.href = "";
  } else {
   patrolAjaxId.innerHTML = 'ארעה שגיאה. לא סומן כבדוק. נסה בשנית.';
   patrolAjaxId.onclick = 'return true';
  }
 }
 a.send(null);
}

function markPatrolAjaxInit_test() {
 if (document.location.href.indexOf('diff') == -1 && document.location.href.indexOf('rcid') == -1) return;

 var patrollinks = getElementsByClassName(document, 'SPAN', 'patrollink');
 if (!patrollinks || patrollinks.length==0)
  patrollinks = getElementsByClassName(document, 'DIV', 'patrollink');
 if (!patrollinks || patrollinks.length==0) return;

 var aElement = patrollinks[0].getElementsByTagName('A')[0];
 patrolAjaxLink_test = aElement.href;
 aElement.href = 'javascript:markPatrolAjax_test();';
 aElement.id = 'patrolAjax';
}

addOnloadHook(markPatrolAjaxInit_test);

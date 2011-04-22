/*** Allows to mark articles as patrolled in the RC page.
   * Written by [[User:Yonidebest]]
   *
   */
 
function rcMarkPatrol(id) {
 var checkbox = document.getElementById(id);
 var rcspan = checkbox.parentNode;
 rcspan.innerHTML = '<font color="orange">מסמן...</font> ';
 var a = sajax_init_object();
 a.open('GET', 'http://he.wikipedia.org/w/index.php?title=' + checkbox.value + '&action=markpatrolled&rcid=' + checkbox.id, true);
 a.onreadystatechange = function() {
  if (a.readyState != 4) return;
  if (a.responseText.indexOf('סומן כבדוק') != -1)
   rcspan.innerHTML = '<font color="green">סומן כבדוק</font>; ';
  else
   rcspan.innerHTML = '<font color="red">ארעה שגיאה. לא סומן כבדוק. רענן את הדף ונסה שנית.</font> ';
 }
 a.send(null);
}
 
function rcPatrol()
{
 var itemList;
 var enhancedTables = getElementsByClassName(document, 'table', 'mw-enhanced-rc');
 if (!enhancedTables[0])
  itemList = document.getElementById('bodyContent').getElementsByTagName('LI');
 else
 {
  itemList = [];
  for (var i = 0; i < enhancedTables.length; i++)
  {
   var trs = enhancedTables[i].getElementsByTagName('tr');
   var extended = getElementsByClassName(trs[0], 'span', 'mw-changeslist-expanded');
   if (!extended[0])
    itemList.push(trs[0]);
   else
   {
    var trsSubs = enhancedTables[i+1].getElementsByTagName('tr');
    for (var j = 0; j < trsSubs.length; j++)
     itemList.push(trsSubs[j]);
	i++;
   }
  }
 }

 for (var i = 0; i < itemList.length; i++) {
  var unpatrolled = getElementsByClassName(itemList[i], 'ABBR', 'unpatrolled');
 
  if (!unpatrolled[0]) continue; // patrolled
 
  var checkbox = document.createElement('INPUT');
  checkbox.type = 'checkbox';
 
  var link = itemList[i].getElementsByTagName('A');
 
  // get rcid page
  var rx1 = new RegExp('rcid=(\\d+)');
  var m1 = rx1.exec(link[0].href);
  if (!m1)
   m1 = rx1.exec(link[1].href);
  if (!m1)
   m1 = rx1.exec(link[2].href);
  if (!m1) continue;
  checkbox.id = m1[1];
 
  // get title page
  var rx2 = new RegExp('title=([^&]*)');
  var m2 = rx2.exec(link[0].href);
  if (!m2)
   m2 = rx2.exec(link[1].href);
  if (!m2) continue;
  checkbox.value = m2[1];
 
  checkbox.defaultChecked = false;
  checkbox.title = 'סמן כבדוק';
  checkbox.onclick = function() { rcMarkPatrol(this.id); }
 
  var rcspan = document.createElement('SPAN');
  rcspan.id = 'rcspan';
  rcspan.appendChild(checkbox);
  unpatrolled[0].style.display = "none";
  for ( var x = unpatrolled[0] ; x.previousSibling.nodeName == "ABBR" ; ) x = x.previousSibling;
  if (itemList[i].nodeName == 'LI')
   itemList[i].insertBefore(rcspan, x);
  else
   itemList[i].getElementsByTagName('td')[0].insertBefore(rcspan, x);
 }
}
 
if ( wgCanonicalSpecialPageName == "Recentchanges" ||
     wgCanonicalSpecialPageName == "Watchlist" ||
     wgCanonicalSpecialPageName == "Recentchangeslinked" ) addOnloadHook(rcPatrol);
 
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
 
function markPatrolAjaxInit() {
 if (document.location.href.indexOf('diff') == -1 && document.location.href.indexOf('rcid') == -1) return;
 
 var patrollinks = getElementsByClassName(document, 'SPAN', 'patrollink');
 if (!patrollinks || patrollinks.length==0)
  patrollinks = getElementsByClassName(document, 'DIV', 'patrollink');
 if (!patrollinks || patrollinks.length==0) return;
 
 var aElement = patrollinks[0].getElementsByTagName('A')[0];
 patrolAjaxLink = aElement.href;
 aElement.href = 'javascript:markPatrolAjax();';
 aElement.id = 'patrolAjax';
}
 
addOnloadHook(markPatrolAjaxInit);
/* הסקריפט מוסיף לשוניות "מחיקה", "הגנה" ו"חסימה" על מנת שאפשר יהיה לבקש מחיקת דפים, הגנת דפים וחסימת משתמשים באמצעות דף בקשות ממפעילים. */
if(mw.config.get('wgNamespaceNumber') + 1) // not a special page
$(function(){

function save(title, summary, content, section, next) {
	var param = {action: 'edit', title: title, summary: summary, token: mw.user.tokens.get('editToken'), section: section || '0', appendtext: content, format: 'json'};
	$.post(mw.util.wikiScript('api'), param, function(data) {
		if (data && data.error)
			mw.util.jsMessage('שגיאה בשמירה: ' + data.error['info']);
		else if (data && data.edit && data.edit.result == 'Success' && typeof next == 'function')
			next();
	});
}

function addMenuItem(caption, tooltip, section, message, summary, accessKey, replaceParam) {
	if (replaceParam) {
		var r = /replaceParam/g;
		tooltip = tooltip.replace(r, replaceParam);
		message = message.replace(r, replaceParam);
		summary = summary.replace(r, replaceParam);
	}
	var a = mw.util.addPortletLink('p-cactions','#',caption,'',tooltip,(accessKey||''));
	$(a).click(function() {
		var reason = prompt("הסיבה לבקשת ה" + caption);
		if ($.trim(reason) == '')
			return;
		message += ' - ' + reason + ' ~~' + '~~';
		save('ויקיפדיה:בקשות ממפעילים', summary, '\n\n* ' + message, section, function() { mw.util.jsMessage('בקשתך נשמרה בבקשות מהמפעילים');});
	});
}

var ca = $.inArray(mw.config.get('wgNamespaceNumber'), [6, 14]) + 1 ?  ':' : '';
var pageName = mw.config.get('wgPageName').replace( /_/g, " " );
if ($('#t-contributions').length) {
	var badUser = mw.config.get('wgTitle').split('/')[0];
	addMenuItem('חסימה', 'בקשה לחסום את replaceParam', 2, "{{לחסום|replaceParam}}", '/* בקשות חסימה / הסרת חסימה */ [[משתמש:replaceParam|replaceParam]] ([[שיחת משתמש:replaceParam|ש]]|[[מיוחד:תרומות/replaceParam|ת]]|[[מיוחד:חסימה/replaceParam|ח]])',']', badUser);
}
var pageLink = $('.redirectMsg').length ? '{{הפניה|replaceParam}}' : '[[' + ca + 'replaceParam]]';
addMenuItem('הגנה', 'בקשה להגן על הדף replaceParam', 3, pageLink, '/* בקשות הגנה / הסרת הגנה */ [[replaceParam]]','=', pageName);
addMenuItem('מחיקה', 'בקשה למחוק את הדף replaceParam', 1, pageLink, '/* בקשות מחיקה */ [[replaceParam]]','d', pageName);

if (getParamValue('oldid') && getParamValue('diff'))
	addMenuItem('הסתרת גרסה', 'בקשה להסתיר את הגרסה ' + mw.util.getParamValue('diff') , 5, '{{הבדל|' + mw.config.get('wgPageName') + '|' + mw.util.getParamValue('diff') + '|' + mw.util.getParamValue('oldid') + '|טקסט=גרסה זו}}', '/* בקשות מחיקת גרסאות מסוימות */ הסתרת גרסה','[');
	
}); 
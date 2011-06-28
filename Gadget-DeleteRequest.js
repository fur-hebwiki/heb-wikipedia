/* הסקריפט מוסיף לשוניות "מחיקה", "הגנה" ו"חסימה" על מנת שאפשר יהיה לבקש מחיקת דפים, הגנת דפים וחסימת משתמשים באמצעות דף בקשות ממפעילים. */
function wbm_save_topage(title, summary, content, section, next) {

	function doneSave(data) {
		if (data && data.error) 
			alert('error saving: ' + data.error['info']);
		else if (data && data.edit && data.edit.result == 'Success' && typeof next == 'function')
			next();
	}
	
	function tokenReceived(token) {
		var param = {action: 'edit', title: title, summary: summary, token: token, section: section || '0', appendtext: content, format: 'json'};
		$.post(wgScriptPath + '/api.php?', param, doneSave);
	}

	function doneGetToken(data) {
		for (var page in data.query.pages) {
			tokenReceived(data.query.pages[page].edittoken);
			break;
		}
	}
	
	$.getJSON(wgScriptPath + '/api.php?', {action: 'query', prop: 'info', intoken: 'edit', titles: title, format: 'json'}, doneGetToken);
}

function wbm_add_menus() {
	function add_one(caption, tooltip, section, message, summary) {
		var a = $('<a>', {href: '#', text: caption, title: tooltip});
		a.click(function() {
			var reason = prompt("הסיבה לבקשה");
			if ($.trim(reason) == '')
				return;
			message += ' סיבה: ' + reason + ' ~~' + '~~';
			wbm_save_topage('משתמש:קיפודנחש/ארגח 5', summary, message, section, function() { alert('בקשתך נשמרה ב-וק:במ')});
		});
		$('#ca-history').before($('<li>').append($('<span>').append(a)));
	}
	if ($('#t-contributions').length) {
		var badUser = wgTitle.split('/')[0];
		add_one('חסימה', 'בקשה לחסום משתמש ' + badUser, 2, "\n* {" + "{לחסום|" + badUser + "}}", ' נא לחסום את ' + badUser);
	}
	add_one('הגנה', 'בקשה להגן על דף ' + wgTitle, 3, "\n* [[" + wgTitle + "]]", ' נא להגן על [[' + wgTitle + "]]");
	add_one('מחיקה', 'בקשה למחוק דף ' + wgTitle, 1, "\n* [[" + wgTitle + "]]", ' נא למחוק את [[' + wgTitle + "]]");
}

wbm_add_menus();
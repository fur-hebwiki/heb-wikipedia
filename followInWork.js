//   riwt: Identify Removal of [[תבנית:בעבודה]] and log pages that lost it on [[Special:MyPage/כבר לא בעבודה]]

function riwt_short_date() {
	var date = new Date();
	var min = (date.getUTCMinutes() < 10 ? '0' : '') + date.getUTCMinutes();
	return date.getUTCDate() + '/' + (1+date.getUTCMonth()) + '/' + date.getUTCFullYear() + ' ' + date.getUTCHours() + ':' + min;
}

function riwt_save_topage(title, summary, content, section, next) {

	function doneSave(data) {
		if (data && data.error) 
			alert('error saving: ' + data.error['info']);
		else if (data && data.edit && data.edit.result == 'Success' && typeof next == 'function')
			next();
	}
	
	function tokenReceived(token) {
		var param = {action: 'edit', title: title, summary: summary, token: token, section: section || '0', format: 'json'};
		$.extend(param, content);
		$.post(wgScriptPath + '/api.php?', param, doneSave);
	}

	function doneGetToken(data) {
		for (var page in data.query.pages) {
			tokenReceived(data.query.pages[page].edittoken);
			break;
		}
	}

	riwt_get_json({action: 'query', prop: 'info', intoken: 'edit', titles: title}, doneGetToken);
}

function riwt_get_json(params, func) {
	params.format = 'json';
	$.getJSON(wgScriptPath + '/api.php?', params, func);
}

function riwt_handle_removed(removed, pagesWithTemplate, data, sanitizedRemoved) {
	if (data && data.query && data.query.pages)
		for (var i in data.query.pages) {
			var page = data.query.pages[i], title = page.title;
			if (page.pageid && !pagesWithTemplate[title])
				sanitizedRemoved.push(title);
		}
	if (removed.length)
		riwt_get_json({action: 'query', titles: removed.splice(0,50).join('|'), redirects: ''},
				  function(newdata){riwt_handle_removed(removed, pagesWithTemplate, newdata, sanitizedRemoved);});
	else {
		sanitizedRemoved.sort();
		if (sanitizedRemoved.length)
			riwt_save_topage(riwt_page_name(1), 'עדכון '  + riwt_short_date(),
				{prependtext: '\n====הרצה בתאריך ' + riwt_short_date() + '====\n*[[' + sanitizedRemoved.join(']]\n*[[') + ']]\n'}, 
				1,
				function() {
					alert('הסקריפט סיים לרוץ. ' + sanitizedRemoved.length + ' תבניות "בעבודה" הוסרו.');
				});
		else
			alert('לא נמצאו דפים חדשים מהם הוסרה תבנית "בעבודה"');
	}
}

function riwt_analyze_results(data, pagesWithTemplate) {
	var removed = [];
	if (data && data.parse && data.parse.links)
		for (var i in data.parse.links) {
			var link = data.parse.links[i], title = link['*'];
			if (title && link['exists'] == '' && !pagesWithTemplate[title])
				removed.push(title);
		}
	riwt_handle_removed(removed, pagesWithTemplate, false, []);
	current = [];
	for (var key in pagesWithTemplate)
		current.push(key);
	current.sort();
	riwt_save_topage(riwt_page_name(0), 'עדכון '  + riwt_short_date(), {text: '#[[' + current.join(']]\n#[[') + ']]'});
}

function riwt_get_current_list(data, pagesWithTemplate) {
	if (data && data.query && data.query.embeddedin) 
		for (var i in data.query.embeddedin)
			pagesWithTemplate[data.query.embeddedin[i].title] = 1;
	if (!data || data['query-continue']) {
		var params = {action: 'query', list: 'embeddedin', eititle: 'תבנית:בעבודה', eilimit: 500, einamespace: 0};
		if (data['query-continue'])
			params.eicontinue = data['query-continue'];
		riwt_get_json(params, function(data) {riwt_get_current_list(data, pagesWithTemplate);});
	} else 
		riwt_get_json({action: 'parse', page: riwt_page_name(0)}, function(data){riwt_analyze_results(data, pagesWithTemplate);});
}


function riwt_page_name(type, full) {	
	return (full ? wgServer + '/w/index.php?title=' : '') + 
		'ויקיפדיה:ערכים מהם הוסרה תבנית בעבודה' + 
	(type == 0 ?
	'/דפים עם התבנית' 
	: '');
}

addPortletLink('p-tb', 'javascript:riwt_get_current_list(false, {})', 'סקריפט "איבדו בעבודה"');
addPortletLink('p-tb', 'javascript:window.location=riwt_page_name(1, true);', 'דפים שאיבדו "בעבודה"');

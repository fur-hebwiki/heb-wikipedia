// riwt: Identify Removal of [[תבנית:בעבודה]] and log pages that lost it on [[Special:MyPage/כבר לא בעבודה]]

function riwt_short_date() {
	var date = new Date();
	var min = (date.getUTCMinutes() < 10 ? '0' : '') + date.getUTCMinutes();
	return date.getUTCDate() + '/' + date.getUTCMonth() + '/' + date.getUTCFullYear() + ' ' + date.getUTCHours() + ':' + min;
}

function riwt_save_topage(title, summary, content, next) {

	function doneSave(data) {
		if (data && data.edit && data.edit['result'] == 'Success' && typeof next == 'function')
			next();
	}

	function tokenReceived(token) {
		var param = {action: 'edit', title: title, summary: summary, token: token, format: 'json'};
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

function riwt_handle_nomore(nomore, currentwork, data) {
	if (!nomore.length)
		return;
	if (data) {
		var goodpages = [];
		if (data && data.query && data.query.pages)
			for (var i in data.query.pages) {
				var page = data.query.pages[i], title = page.title;
				if (typeof page.missing != 'string' && !currentwork[title]) // this is possible in case of redirection
					goodpages.push(title);
			}
		if (goodpages.length)
			riwt_save_topage(riwt_page_name(1), 'עדכון '  + riwt_short_date(),
				{prependtext: '\n<!-- הרצה בתאריך ' + riwt_short_date() + '-->\n*[[' + nomore.join(']]\n*[[') + ']]\n'});
	}
	riwt_get_json({action: 'query', prop: 'info', titles: nomore.splice(0,10).join('|'), redirects: ''},
				  function(newdata){riwt_handle_nomore(nomore, currentwork, newdata);});
}

function riwt_analyze_results(data, currentwork) {
	var nomore = [];
	if (data && data.parse && data.parse.links)
		for (var i in data.parse.links) {
			var title = data.parse.links[i]['*'];
			if (title && !currentwork[title])
				nomore.push(title);
		}
	riwt_handle_nomore(nomore, currentwork, false);
	current = [];
	for (var key in currentwork)
		current.push(key);
	current.sort();
	riwt_save_topage(riwt_page_name(0), 'עדכון '  + riwt_short_date(), {text: '#[[' + current.join(']]\n#[[') + ']]'},
		function(){alert('הסקריפט סיים לרוץ. ' + total + ' תבניות "בעבודה" הוסרו.')});
}

function riiwt_received_current_list(data, currentwork) {
	var responses = data.query.embeddedin;
	for (var i in responses)
		currentwork[responses[i].title] = 1;
	if (data['query-continue'])
		riwt_get_current_list(currentwork, data['query-continue'].embeddedin.eicontinue);
	else
		riwt_get_json({action: 'parse', page: riwt_page_name(0)},
			function(data){riwt_analyze_results(data, currentwork);});
}

function riwt_get_current_list(currentwork, continuation) {
	var params = {action: 'query', list: 'embeddedin', eititle: 'תבנית:בעבודה', eilimit: 500, einamespace: 0};
	if (continuation)
		params.eicontinue = continuation;
	riwt_get_json(params, function(data) {riiwt_received_current_list(data, currentwork);});
}

function riwt_page_name(type, full) {
	return (full ? wgServer + '/w/index.php?title=' : '') + 'משתמש:' + wgUserName + '/' +  ['בעבודה', 'כבר לא בעבודה'][type];
}

addPortletLink('p-tb', 'javascript:riwt_get_current_list({}, null)', 'סקריפט "איבדו בעבודה"');
addPortletLink('p-tb', 'javascript:window.location=riwt_page_name(1, true);', 'דפים שאיבדו "בעבודה"');

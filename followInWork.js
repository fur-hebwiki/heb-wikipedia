// riwt: Removed In-Work Templates. log removals in page [[Special:MyPage/כבר לא בעבודה]]

function riwt_short_date() {
	var date = new Date();
	var min = '' + date.getMinutes();
	if (min.length < 2) min = '0' + min;
	return date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + min;
}

function riwt_save_topage(title, summary, type, text, next) {

	function doneSave(data) {
		if (data && data.edit && data.edit.result == 'Success' && typeof next == 'function')
			next();
	}
	
	function tokenReceived(token) {
		var param = {action: 'edit', title: title, summary: summary, token: token, format: 'json'};
		param[type] = text;
		$.post(wgScriptPath + '/api.php?', param, doneSave);
	}
	
	function doneGetToken(data) {
		if ( data.query.pages && data.query.pageids ) {
			var pageid = data.query.pageids[0];
			token = data.query.pages[pageid].edittoken;
			tokenReceived(token);
		}
	}
	
	var params = {action: 'query', prop: 'info', intoken: 'edit', titles: title, indexpageids: '', format: 'json'};
	riwt_get_json(params, doneGetToken);
}
 
function riwt_get_json(params, func) {
	$.getJSON(wgScriptPath + '/api.php?', params, func);
}

function riwt_received_oldlist(data, currentwork) {
	var nomore = [];
	for (var i in data.parse.links) 
		if (!currentwork[data.parse.links[i]['*']])
			nomore.push(data.parse.links[i]['*']);
	var summary = 'עדכון '  + riwt_short_date();
	var text;
	if (nomore.length > 0) {
		text = '\n<!-- הרצה בתאריך ' + riwt_short_date() + '-->\n*[[' + nomore.join(']]\n*[[') + ']]\n';
		riwt_save_topage(riwt_page_name(1), summary, 'prependtext', text);
	}
	current = [];
	for (var key in currentwork)
		current.push(key);
	current.sort();
	text = '#[[' + current.join(']]\n#[[') + ']]';
	riwt_save_topage(riwt_page_name(0), summary, 'text', text, 
		function(){alert('הסקריפט סיים לרוץ. ' + nomore.length + ' תבניות "בעבודה" הוסרו.')}
	);
}
 
function riiwt_received_current_list(data, currentwork) {
	var responses = data.query.embeddedin;
	for (var i in responses)
		currentwork[responses[i].title] = 1;
	if (data['query-continue'])
		riwt_get_current_list(currentwork, data['query-continue'].embeddedin.eicontinue);
	else {
		var params = {action: 'parse', page: riwt_page_name(0), format: 'json'};
		riwt_get_json(params, function(data) {riwt_received_oldlist(data, currentwork);});
	}
}

function riwt_get_current_list(currentwork, continuation) {
	var params = {
		action: 'query', 
		list: 'embeddedin',
		eititle: 'תבנית:בעבודה',
		eilimit: 500,
		einamespace: 0,		
		format: 'json'};
	if (continuation)
		params.eicontinue = continuation;
	riwt_get_json(params, function(data) {riiwt_received_current_list(data, currentwork);});
} 

function riwt_page_name(type) {return 'משתמש:' + wgUserName + '/' +  ['בעבודה', 'כבר לא בעבודה'][type];}

addPortletLink('p-tb', 'javascript:riwt_get_current_list({}, null)', 'תבניות בעבודה שהוסרו');
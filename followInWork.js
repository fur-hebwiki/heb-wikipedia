// riwt: Removed In-Work Templates. log removals in page [[Special:MyPage/כבר לא בעבודה]]

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
		if ( data.query.pages && data.query.pageids ) {
			var pageid = data.query.pageids[0];
			token = data.query.pages[pageid].edittoken;
			tokenReceived(token);
		}
	}
	
	var params = {action: 'query', prop: 'info', intoken: 'edit', titles: title, indexpageids: ''};
	riwt_get_json(params, doneGetToken);
}
 
function riwt_get_json(params, func) {
	params.format = 'json';
	$.getJSON(wgScriptPath + '/api.php?', params, func);
}

function riwt_receive_removed_query(data, currentwork) {
	var nomore = [];
	if (data && data.query && data.query.pages)
		for (var i in data.query.pages) {
			var page = data.query.pages[i];
			if (typeof page.missing != 'string' && !currentwork[page.title]) // this is possible in case of redirection
				nomore.push(page.title);
		}
	if (nomore.length) {
		var summary = 'עדכון '  + riwt_short_date();
		var text = '\n<!-- הרצה בתאריך ' + riwt_short_date() + '-->\n*[[' + nomore.join(']]\n*[[') + ']]\n';
		riwt_save_topage(riwt_page_name(1), summary, {prependtext: text});
	}
}

function riwt_received_oldlist(data, currentwork) {
	var nomore = [];
	if (data && data.parse && data.parse.links)
		for (var i in data.parse.links) 
			if (!currentwork[data.parse.links[i]['*']])
				nomore.push(data.parse.links[i]['*']);
	var total = nomore.length;
	while (nomore.length) //query is limited to 50 (for non-bots)
		riwt_get_json({action: 'query', prop: 'info', titles: nomore.splice(0,50).join('|'), redirects: ''},
					  function(data){riwt_receive_removed_query(data, currentwork);});
	var summary = 'עדכון '  + riwt_short_date();
	var text;
	current = [];
	for (var key in currentwork)
		current.push(key);
	current.sort();
	text = '#[[' + current.join(']]\n#[[') + ']]';
	riwt_save_topage(riwt_page_name(0), summary, {text: text}, 
		function(){alert('הסקריפט סיים לרוץ. ' + total + ' תבניות "בעבודה" הוסרו.')}
	);
}
 
function riiwt_received_current_list(data, currentwork) {
	var responses = data.query.embeddedin;
	for (var i in responses)
		currentwork[responses[i].title] = 1;
	if (data['query-continue'])
		riwt_get_current_list(currentwork, data['query-continue'].embeddedin.eicontinue);
	else {
		var params = {action: 'parse', page: riwt_page_name(0)};
		riwt_get_json(params, function(data) {riwt_received_oldlist(data, currentwork);});
	}
}

function riwt_get_current_list(currentwork, continuation) {
	var params = {
		action: 'query', 
		list: 'embeddedin',
		eititle: 'תבנית:בעבודה',
		eilimit: 500,
		einamespace: 0};
	if (continuation)
		params.eicontinue = continuation;
	riwt_get_json(params, function(data) {riiwt_received_current_list(data, currentwork);});
} 

function riwt_page_name(type) {return 'משתמש:' + wgUserName + '/' +  ['בעבודה', 'כבר לא בעבודה'][type];}

addPortletLink('p-tb', 'javascript:riwt_get_current_list({}, null)', 'סקריפט "איבדו בעבודה"');
addPortletLink('p-tb', 'javascript:window.location=riwt_page_name(1);', 'דפים שאיבדו "בעבודה"');
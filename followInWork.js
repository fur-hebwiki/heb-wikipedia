// follow the use of "in work" template. 

function riwt_short_date() {
	var date = new Date();
	return date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear();
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

function riwt_readmypage_return(data, currentwork) {
	var nomore = [];
	for (var i in data.parse.links) 
		if (!currentwork[data.parse.links[i]['*']])
			nomore.push(data.parse.links[i]['*']);
	var summary = 'עדכון '  + riwt_short_date();
	var text;
	if (nomore.length > 0) {
		text = '\n<!-- הרצה בתאריך ' + riwt_short_date() + '-->\n*[[' + nomore.join(']]\n*[[') + ']]\n';
		riwt_save_topage(riwt_special_page(1), summary, 'prependtext', text);
	}
	current = [];
	for (var key in currentwork)
		current.push(key);
	current.sort();
	text = '#[[' + current.join(']]\n#[[') + ']]';
	riwt_save_topage(riwt_special_page(0), summary, 'text', text, 
		function(){alert('הסקריפט סיים לרוץ. ' + nomore.length + ' תבניות "בעבודה" הוסרו.')}
	);
}
 
function riwt_embedded_return(data) {
	var responses = data.query.embeddedin;
	var currentwork = {};
	for (var i in responses)
		currentwork[$('<div/>').text(responses[i].title).html()] = 1;
	var params = {action: 'parse', page: riwt_special_page(0), format: 'json'};
	riwt_get_json(params, function(data) {riwt_readmypage_return(data, currentwork);});
}

function riwt_obtain_list() {
	var params = {
		action: 'query', 
		list: 'embeddedin',
		eititle: 'תבנית:בעבודה',
		eilimit: 500,
		einamespace: 0,		
		format: 'json'};
	riwt_get_json(params, riwt_embedded_return);
} 

function riwt_special_page(type) {
	var titles = ['בעבודה', 'כבר לא בעבודה'];
	return 'משתמש:' + wgUserName + '/' + titles[type];
}

addPortletLink('p-tb', 'javascript:riwt_obtain_list()', 'תבניות בעבודה שהוסרו');
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
    $.getJSON(wgScriptPath + '/api.php?', params, doneGetToken);
}
 
function riwt_readmypage_return() {
	if (this.readyState != 4) // this is some ajax incantation - ony "4" is good.
		return;
	var nomore = [];
	var frags = this.responseText.split(/<li>/);
	for (var i = 1; i < frags.length; i++) {
		var match = frags[i].match(/>([^<]*)</);
		if (match) {
			var oldwork = match[1];
			if (!this.currentwork[oldwork])
				nomore.push(oldwork);
		}
	}
	
	var summary = 'עדכון '  + riwt_short_date();
	var text;
	if (nomore.length > 0) {
		text = '\n<!-- הרצה בתאריך ' + riwt_short_date() + '-->\n*[[' + nomore.join(']]\n*[[') + ']]\n';
		riwt_save_topage(riwt_special_page(1), summary, 'prependtext', text);
	}
	current = [];
	for (var key in this.currentwork)
		current.push(key);
	current.sort();
	riwt_save_topage(riwt_special_page(0), summary, 'text', '#[[' + current.join(']]\n#[[') + ']]');
}
 
function riwt_embedded_return() {
	if (this.readyState != 4) // this is some ajax incantation - ony "4" is good.
		return;
	xml = this.responseXML;
	var responses = xml.getElementsByTagName('ei');
	this.currentwork = {};
	for (var i = 0; i < responses.length; i++)
		this.currentwork[$('<div/>').text(responses[i].getAttribute('title'))] = 1;
	this.onreadystatechange = riwt_readmypage_return;
	this.open('GET', riwt_special_page(0, wgServer + '/w/index.php?title='));
	this.send(null);
}

function riwt_obtain_list() {
	var aj = sajax_init_object();
	aj.onreadystatechange = riwt_embedded_return;
	aj.open('GET', 'http://he.wikipedia.org/w/api.php?action=query&format=xml&list=embeddedin&eititle=תבנית:בעבודה&eilimit=500&einamespace=0');
	aj.send(null);
} 

function riwt_special_page(type, prefix) {
	var titles = [
		'בעבודה',
		'כבר לא בעבודה'
	];
	return ((prefix || '') + 'משתמש:' + wgUserName + '/' + titles[type]).replace(/ /g, '_');
}

function riwt_add_menu_item() {
	addPortletLink('p-tb', 'javascript:riwt_obtain_list()', 'תבניות בעבודה שהוסרו');
}
 
addOnloadHook(riwt_add_menu_item);
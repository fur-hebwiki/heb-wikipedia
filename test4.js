// follow the use of "in work" template. 
// one menu item to record all pages in ns=0 containing the template, 
// a second menu item compares recorded list with current list, recording the diff.

 function riwt_save() {
	document.editform.wpSave.click();
}
 
function riwt_readmypage_return() {
	if (this.readyState != 4) // this is some ajax incantation - ony "4" is good.
		return;
	var nomore = [];
	var frags = this.responseText.split(/<li>/);
	for (var i = 1; i < frags.length; i++) {
		var match = frags[i].match(/(.*)<\/li>/);
		if (match) {
			var oldwork = match[1];
			if (!this.currentwork[oldwork])
				nomore.push(oldwork);
		}
	}
	if (nomore.length > 0) {
		document.editform.wpTextbox1.value = '\n<!-- הרצה בתאריך' + new Date().toString() + '-->\n*[[' + 
			nomore.join(']]\n*[[') + ']]\n' + document.editform.wpTextbox1.value;
		document.editform.wpSummary.value = 'עדכון '  + new Date().toString();
		riwt_save();
		return;
	}
}
 
function riwt_embedded_return() {
	if (this.readyState != 4) // this is some ajax incantation - ony "4" is good.
		return;
	xml = this.responseXML;
	var responses = xml.getElementsByTagName('ei');
	var titles = []
	for (var i = 0; i < responses.length; i++)
		titles.push(responses[i].getAttribute('title'));
	if (this.whatnext == 'record_it') {
		titles.sort();
		document.editform.wpTextbox1.value = '#' + titles.join('\n#');
		document.editform.wpSummary.value = 'איסוף '  + new Date().toString();
		riwt_save();
		return;
	}
	var aj = sajax_init_object();
	aj.currentwork = {};
	for (i in titles)
		aj.currentwork[$('<div/>').text(titles[i]).html()] = 1;
	aj.onreadystatechange = riwt_readmypage_return;
	aj.open('GET', riwt_special_page(true, true));
	aj.send(null);
}

function riwt_obtain_list(whatnext) {
	var aj = sajax_init_object();
	aj.onreadystatechange = riwt_embedded_return;
	aj.whatnext = whatnext;
	aj.open('GET', 'http://he.wikipedia.org/w/api.php?action=query&format=xml&list=embeddedin&eititle=תבנית:בעבודה&eilimit=500&einamespace=0');
	aj.send(null);
} 

function riwt_record(removals) {
	if (removals)
		document.location = riwt_special_page(false, true) + '&action=edit&dothis=recordremovals';
	else
		document.location = riwt_special_page(true, true) + '&action=edit&dothis=obtainlist';
}

function riwt_special_page(allwork, fullname) {
	var page = 'משתמש:' + wgUserName + '/' + (allwork ? 'כל הדפים עם תבנית עבודה' : 'דפים שאיבדו את התבנית');
	if (fullname)
		page = wgServer + '/w/index.php?title=' + page;
	return page.replace(/ /g, '_');
}

function riwt_do_the_work() {
	addPortletLink('p-tb', 'javascript:riwt_record(false)', 'תבניות בעבודה - רישום');
	addPortletLink('p-tb', 'javascript:riwt_record(true)', 'תבניות בעבודה שהוסרו');
	if (wgPageName.match(new RegExp(riwt_special_page(true, false))) && getParamValue('dothis') == 'obtainlist')
		riwt_obtain_list('record_it');
	else if (wgPageName.match(new RegExp(riwt_special_page(false, false))) && getParamValue('dothis') == 'recordremovals')
		riwt_obtain_list('diffs');
}
 
addOnloadHook(riwt_do_the_work);
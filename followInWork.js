<<<<<<< HEAD
// riwt: Identify Removal of [[תבנית:בעבודה]] and log pages that lost it on [[ויקיפדיה:ערכים מהם הוסרה תבנית בעבודה]]

function riwt_short_date() {
    var date = new Date();
=======
﻿// riwt: Identify Removal of [[תבנית:בעבודה]] and log pages that lost it on [[Special:MyPage/כבר לא בעבודה]]

function riwt_short_date() {
	var date = new Date();
>>>>>>> 9f0cc8c966644cf9a2ec7c30f4cc2c31e9ed0c5d
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

<<<<<<< HEAD
function riwt_handle_removed(current, removed, pagesWithTemplate, data, sanitizedRemoved, progress) {
	message = 'מנקה את רשימת הדפים מהם הוסרה התבנית';
	progress.lastLine(message + ' ' + removed.length, 1);
=======
function riwt_handle_removed(removed, pagesWithTemplate, data, sanitizedRemoved) {
>>>>>>> 9f0cc8c966644cf9a2ec7c30f4cc2c31e9ed0c5d
	if (data && data.query && data.query.pages)
		for (var i in data.query.pages) {
			var page = data.query.pages[i], title = page.title;
			if (page.pageid && !pagesWithTemplate[title])
				sanitizedRemoved.push(title);
		}
	if (removed.length)
		riwt_get_json({action: 'query', titles: removed.splice(0,50).join('|'), redirects: ''},
<<<<<<< HEAD
				  function(newdata){current, riwt_handle_removed(current, removed, pagesWithTemplate, newdata, sanitizedRemoved, progress);});
	else {
		sanitizedRemoved.sort();
		riwt_process_current(current, sanitizedRemoved, progress);
	}
}

function riwt_process_current(current, sanitizedRemoved, progress) {
	var stale = {}, work = current.slice(), threshold = new Date() - 1000 * 60 * 60 * 24 * 21; //three weeks
	progress.lastLine(progress.lastLine() + ' - בוצע');
	progress.lastLine('', 1);
	nextSlice(work.splice(0, 50));

	function report() {
		var message = 'כותב את רשימת הדפים עם התבנית ', todo = current.length, done = todo - work.length;
		progress.lastLine(message + done + '/' + todo);
	}
=======
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

function riwt_store_current(current) {
	var stale = {}, work = current.slice(), threshold = new Date() - 1000 * 60 * 60 * 24 * 21; //three weeks
>>>>>>> 9f0cc8c966644cf9a2ec7c30f4cc2c31e9ed0c5d
	
	function isold(ts) {
		dar = ts.split(/[^\d]/); // timestamp looks like so: "2011-05-05T18:56:27Z"
		var month = parseInt(dar[1],10) - 1; // "Date" expexts months in the range of 0..11, timestamp is more conventional.
		return new Date(dar[0],month,dar[2],dar[3],dar[4],dar[5]) < threshold;
	}
	
<<<<<<< HEAD
	function storeCurrent() {
		riwt_save_topage(riwt_page_name(0), 'עדכון '  + riwt_short_date(), {text: '#' + current.join('\n#')}, 0,
			function() {
				progress.lastLine('הסקריפט סיים לרוץ. התבנית הוסרה מ-' + sanitizedRemoved.length + ' דפים ', 1);
				progress.closeIt();
			}
		);
	}
	
	function nextSlice(slice) {
		report();
=======
	nextSlice(work.splice(0, 50));
	function nextSlice(slice) {
>>>>>>> 9f0cc8c966644cf9a2ec7c30f4cc2c31e9ed0c5d
		riwt_get_json({action: 'query', prop: 'revisions', rvprop: 'timestamp', titles: slice.join('|').replace(/&/g, '%26')}, function(data) {
			if (data.query && data.query.pages)
				for (var pageid in data.query.pages) {
					var page = data.query.pages[pageid];
					stale[page.title] = isold(page.revisions[0].timestamp);
				}
			if (work.length)
				nextSlice(work.splice(0, 50));
			else {
				for (var i in current) {
					var bold = stale[current[i]] ? "'''" : "";
					current[i] = bold + '[[' + current[i] + ']]' + bold;
				}
<<<<<<< HEAD
				if (sanitizedRemoved.length > 0)
					riwt_save_topage(riwt_page_name(1), 'עדכון '  + riwt_short_date(),
						{prependtext: '\n====הרצה בתאריך ' + riwt_short_date() + '====\n*[[' + sanitizedRemoved.join(']]\n*[[') + ']]\n'}, 
						1,
						function() {
							progress.lastLine('כותב את רשימת הדפים מהם הוסרה התבנית', 1);
							storeCurrent();
						});
				else
					storeCurrent();
=======
				riwt_save_topage(riwt_page_name(0), 'עדכון '  + riwt_short_date(), {text: '#' + current.join('\n#')});
>>>>>>> 9f0cc8c966644cf9a2ec7c30f4cc2c31e9ed0c5d
			}
		})
	}
}

<<<<<<< HEAD
function riwt_analyze_results(data, pagesWithTemplate, progress) {
	progress.lastLine(progress.lastLine() + ' - בוצע');
=======
function riwt_analyze_results(data, pagesWithTemplate) {
>>>>>>> 9f0cc8c966644cf9a2ec7c30f4cc2c31e9ed0c5d
	var removed = [];
	if (data && data.parse && data.parse.links)
		for (var i in data.parse.links) {
			var link = data.parse.links[i], title = link['*'];
			if (title && link['exists'] == '' && !pagesWithTemplate[title])
				removed.push(title);
		}
<<<<<<< HEAD
=======
	riwt_handle_removed(removed, pagesWithTemplate, false, []);
>>>>>>> 9f0cc8c966644cf9a2ec7c30f4cc2c31e9ed0c5d
	current = [];
	for (var key in pagesWithTemplate)
		current.push(key);
	current.sort();
<<<<<<< HEAD
	riwt_handle_removed(current, removed, pagesWithTemplate, false, [], progress);
}

function riwt_get_current_list(data, pagesWithTemplate, progress) {
	var message = 'קורא את רשימת הדפים עם התבנית:';
	progress.lastLine(message);
	var sofar = 0;
	if (data && data.query && data.query.embeddedin) {
		for (var i in data.query.embeddedin) {
			pagesWithTemplate[data.query.embeddedin[i].title] = 1;
			sofar++;
		}
		progress.lastLine(message + ' ' + sofar);
	}
=======
	riwt_store_current(current);
}

function riwt_get_current_list(data, pagesWithTemplate) {
	if (data && data.query && data.query.embeddedin) 
		for (var i in data.query.embeddedin)
			pagesWithTemplate[data.query.embeddedin[i].title] = 1;
>>>>>>> 9f0cc8c966644cf9a2ec7c30f4cc2c31e9ed0c5d
	if (!data || data['query-continue']) {
		var params = {action: 'query', list: 'embeddedin', eititle: 'תבנית:בעבודה', eilimit: 500, einamespace: 0};
		if (data['query-continue'])
			params.eicontinue = data['query-continue'];
<<<<<<< HEAD
		riwt_get_json(params, function(data) {riwt_get_current_list(data, pagesWithTemplate, progress);});
	} else {
		progress.lastLine(progress.lastLine() + ' - בוצע');
		progress.lastLine('קורא את הדף הקודם', 1);
		riwt_get_json({action: 'parse', page: riwt_page_name(0)}, function(data){riwt_analyze_results(data, pagesWithTemplate, progress);});
	}
=======
		riwt_get_json(params, function(data) {riwt_get_current_list(data, pagesWithTemplate);});
	} else 
		riwt_get_json({action: 'parse', page: riwt_page_name(0)}, function(data){riwt_analyze_results(data, pagesWithTemplate);});
>>>>>>> 9f0cc8c966644cf9a2ec7c30f4cc2c31e9ed0c5d
}


function riwt_page_name(type, full) {	
	return (full ? wgServer + '/w/index.php?title=' : '') + 
<<<<<<< HEAD
		'ויקיפדיה:ערכים מהם הוסרה תבנית בעבודה' +
=======
		'ויקיפדיה:ערכים מהם הוסרה תבנית בעבודה' + 
>>>>>>> 9f0cc8c966644cf9a2ec7c30f4cc2c31e9ed0c5d
	(type == 0 ?
	'/דפים עם התבנית' 
	: '');
}

<<<<<<< HEAD
function riwt_doit() {
	mediaWiki.loader.using('jquery.ui.dialog', function () {
		$(document).ready(function () {
			var progress = {
				init: function() {
					document.body.style.cursor = 'wait';
					this.dialog = $('<div style="font-size:2em;"></div>')
					.html(this.lines.join('<br/>') + '</div> ')
					.dialog({
						id: 'riwt_dialog',
						width: 800,
						height: 'auto',
						minHeight: 90,
						modal: true,
						resizable: false,
						draggable: false,
						closeOnEscape: false,
					});
					$('.ui-dialog-titlebar').hide();
				},
				lastLine: function(content, push) {
					if (content) {
						this.lines[this.lines.length - 1 + (push || 0)] = content;
						this.dialog.html(this.lines.join('<br />' + '</div>'));
					}
					else return this.lines[this.lines.length - 1];
				},
				closeIt: function() {
					var d = this.dialog;
					d.append($('<p>').append($('<input>', {type: 'button', value: 'סגור'}).click(function() { 
						$(d).dialog('close');
						document.body.style.cursor = '';
					})));
				},
				lines: ['<div id="riwt_dialog" style="font-size:2em;">'],
			};
			
			progress.init();
			progress.lastLine(' ');
			riwt_get_current_list(false, {}, progress);
		});
	});
}

addPortletLink('p-tb', 'javascript:riwt_doit()', 'סקריפט "איבדו בעבודה"');
=======
addPortletLink('p-tb', 'javascript:riwt_get_current_list(false, {})', 'סקריפט "איבדו בעבודה"');
>>>>>>> 9f0cc8c966644cf9a2ec7c30f4cc2c31e9ed0c5d
addPortletLink('p-tb', 'javascript:window.location=riwt_page_name(1, true);', 'דפים שאיבדו "בעבודה"');

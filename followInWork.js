// riwt: Identify Removal of [[תבנית:בעבודה]] and log pages that lost it on [[ויקיפדיה:ערכים מהם הוסרה תבנית בעבודה]]

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
		var param = {action: 'edit', title: title, summary: summary, token: token, format: 'json'};
		if (typeof section == 'number')
			param.section = section;
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

function riwt_handle_removed(current, removed, pagesWithTemplate, data, sanitizedRemoved, progress) {
	message = 'מנקה את רשימת הדפים מהם הוסרה התבנית';
	progress.lastLine(message + ' ' + removed.length, 1);
	if (data && data.query && data.query.pages)
		for (var i in data.query.pages) {
			var page = data.query.pages[i], title = page.title;
			if (page.pageid && !pagesWithTemplate[title])
				sanitizedRemoved.push(title);
		}
	if (removed.length)
		riwt_get_json({action: 'query', titles: removed.splice(0, 20).join('|'), redirects: ''},
				  function(newdata){current, riwt_handle_removed(current, removed, pagesWithTemplate, newdata, sanitizedRemoved, progress);});
	else {
		sanitizedRemoved.sort();
		riwt_process_current(current, sanitizedRemoved, progress);
	}
}

function riwt_process_current(current, sanitizedRemoved, progress) {
	var dateLastEdit = {}, work = current.slice(), threshold = new Date() - 1000 * 60 * 60 * 24 * 21; //three weeks
	progress.lastLine(progress.lastLine() + ' - בוצע');
	progress.lastLine('', 1);
	nextSlice(work.splice(0, 20));

	function report() {
		var message = 'כותב את רשימת הדפים עם התבנית ', todo = current.length, done = todo - work.length;
		progress.lastLine(message + done + '/' + todo);
	}

	function getDate(ts) {
		dar = ts.split(/[^\d]/); // timestamp looks like so: "2011-05-05T18:56:27Z"
		var month = parseInt(dar[1],10) - 1; // "Date" expexts months in the range of 0..11, timestamp is more conventional.
		return new Date(dar[0],month,dar[2],dar[3],dar[4],dar[5]);
	}

	function storeCurrent() {

		function daysStale(article) {
			var now = new Date();
			var diff = now - dateLastEdit[article].ts;
			return Math.round(diff / 1000 / 3600 / 24);
		}

		current.sort(function(a, b) {return dateLastEdit[a].ts - dateLastEdit[b].ts;});
		var text = '==ערכים עם תבנית {{תב|בעבודה}} (מספר הימים מעריכה אחרונה, העורך האחרון)==\n\n';
		text += '(שימו לב: השם בסוגריים הוא העורך האחרון שערך את הערך, ולאו דווקא העורך שהניח את התבנית)\n\n';
		for (var i in current) {
			article = current[i];
			text += '#[[' + article + ']] {{כ}} (' + daysStale(article) + ', [[משתמש:' + dateLastEdit[article].user + ']])\n';
		}

		riwt_save_topage(riwt_page_name(0), 'עדכון '  + riwt_short_date(), {text: text}, '',
			function() {
				progress.lastLine('הסקריפט סיים לרוץ. התבנית הוסרה מ-' + sanitizedRemoved.length + ' דפים ', 1);
				progress.closeIt();
			}
		);
	}

	function nextSlice(slice) {
		report();
		riwt_get_json({action: 'query', prop: 'revisions', rvprop: 'timestamp|user', titles: slice.join('|').replace(/&/g, '%26')}, function(data) {
			if (data.query && data.query.pages)
				for (var pageid in data.query.pages) {
					if (pageid < 0)
						continue;
					var page = data.query.pages[pageid];
					dateLastEdit[page.title] = {ts: getDate(page.revisions[0].timestamp), user: page.revisions[0].user};
				}
			if (work.length)
				nextSlice(work.splice(0, 20));
			else {
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
			}
		})
	}
}

function riwt_analyze_results(data, pagesWithTemplate, progress) {
	progress.lastLine(progress.lastLine() + ' - בוצע');
	var removed = [];
	if (data && data.parse && data.parse.links)
		for (var i in data.parse.links) {
			var link = data.parse.links[i], title = link['*'];
			if (title && ! /(משתמש:|תבנית:)/.test(title) && link['exists'] == '' && !pagesWithTemplate[title])
				removed.push(title);
		}
	current = [];
	for (var key in pagesWithTemplate)
		current.push(key);
	current.sort();
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
	if (!data || data['query-continue']) {
		var params = {action: 'query', list: 'embeddedin', eititle: 'תבנית:בעבודה', eilimit: 500, einamespace: 0};
		if (data['query-continue'])
			params.eicontinue = data['query-continue'];
		riwt_get_json(params, function(data) {riwt_get_current_list(data, pagesWithTemplate, progress);});
	} else {
		progress.lastLine(progress.lastLine() + ' - בוצע');
		progress.lastLine('קורא את הדף הקודם', 1);
		riwt_get_json({action: 'parse', page: riwt_page_name(0)}, function(data){riwt_analyze_results(data, pagesWithTemplate, progress);});
	}
}


function riwt_page_name(type, full) {
	return (full ? wgServer + '/w/index.php?title=' : '') +
		'ויקיפדיה:ערכים מהם הוסרה תבנית בעבודה' +
	(type == 0 ?
	'/דפים עם התבנית'
	: '');
}

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
						closeOnEscape: false
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
				lines: ['<div id="riwt_dialog" style="font-size:2em;">']
			};

			progress.init();
			progress.lastLine(' ');
			riwt_get_current_list(false, {}, progress);
		});
	});
}

addPortletLink('p-tb', 'javascript:riwt_doit()', 'סקריפט "איבדו בעבודה" 2');
addPortletLink('p-tb', 'javascript:window.location=riwt_page_name(1, true);', 'דפים שאיבדו "בעבודה"');
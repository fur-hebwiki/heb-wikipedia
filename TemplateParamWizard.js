//Adds wizard for using templates for external links
//Written by [[User:קיפודנחש]]
/*
Autocomplete for links and templates
Written by [[משתמש:ערן]]
*/
if($.inArray(mw.config.get('wgAction'), ['edit', 'submit'])+1)
$(document).ready(function() {	
mw.loader.using(['jquery.ui.widget','jquery.ui.autocomplete','jquery.textSelection', 'jquery.ui.dialog'], function() {

	// template parameter is an object with the following fields:
	// desc: desciption string
	// select: array of possible values (optional)
	// defVal: default value (optional)
	// options: object with 3 possible fields:
	//// multiline (boolean)
	//// depends (string - another field's name)
	//// required (boolean)
	// templateParams is keyed by paramName.
	var templateParams,
	// which template are we working on
		template,
	// array of pairs - [paramName, inputField]
		dialogFields,
	// table rows keyed by paramName
		rowsBypName,
	// the fields, keyed by paramName
		fieldsBypName;
	
	function paramsFromSelection() {
		var selection = $("#wpTextbox1").textSelection('getSelection');
		selection = selection.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '[[$1{{!}}$2]]');
		var params = selection.split('|');
		for (var i in params) {
			var param = params[i].split(/\s*=\s*/);
			var name = param.shift();
			if (param.length)
				templateParams[name] = $.extend(templateParams[name] || {}, {defVal: param.join('=').replace(/\}\}$/, '')});
		}
	}
	
	function buildParams(data) {
		var lines = data.split("\n");
		while (lines && lines.length) {
			var line = lines.shift();
				if (!(/^\|-/.test(line))) // look for |- this is wikitext for table row.
					continue;
			var required = /required/g.test(line);
			
			line = lines.shift();
			if (! line || ! (/^\|/.test(line))) //wikitext for column
				continue;
			line = line.substr(1); // get rid of the leading |
			var fields = line.split('||');
			if (fields.length < 2)
				continue;
			var name = $.trim(fields[0]);
			if (! name)
				continue;
			var desc = $.trim(fields[1]);
			var pAttribs = {desc: desc};
			if (required)
				pAttribs.required = true;
			if (fields.length > 2) {
				var val = $.trim(fields[2]);
				if (/,/.test(val)) 
					pAttribs.select = val.split(",");
				else pAttribs.defVal = val;
			}
			if (fields.length > 3) 
				pAttribs.options = analyzeOptions($.trim(fields[3]));
				
			templateParams[name] = pAttribs;
		}
	}
	
	function analyzeOptions(str) {
		var res = {},
			avail = ['multiline', 'required', 'depends'], // maybe we'll have more in the future
			tavail = $.map(avail, i18n),
			options = str.split(',');
		for (var i in options) {
			var option = options[i].split('=');
			var ind = $.inArray(option[0], tavail);
			if (ind + 1)
				res[avail[ind]] = option.length > 1 ? option[1] : true;
		}
		return res;
	}
	
	function createWikiCode() {
		var par = [template];
		for (var i in dialogFields) {
			var 
				field = dialogFields[i],
				name = $.trim(field[0]),
				hidden = field[1].parents('.tpw_hidden').length,
				val = $.trim(field[1].val()).replace(/\|/g, '{{!}}');
			if (! hidden && val.length)
				par.push(name + '=' + val);
		}
		return "{{" + par.join("\n|") + "\n}}";
	}

	function showPreview() {
		var temp = createWikiCode();
		$.post(mw.util.wikiScript('api'), {action: 'parse', title: mw.config.get('wgPageName'), prop: 'text', text: temp, format: 'json'}, function(data) {
			if (data && data.parse && data.parse.text) {
				var buttons = {},
					div = $('<div>')
						.html(data.parse.text['*']);
				buttons[i18n('close')] = function() {$(this).dialog('close');};
				div.find('a').attr('target', '_blank'); // we don't want people to click on links in preview - they'll lose their work.
				$('<div>')
					.dialog(
						{title: i18n('preview'), 
						width: 'auto', 
						height: 'auto', 
						overflow: 'auto', 
						position: [60, 60],
						buttons: buttons})
					.append(div);
			}
		});			
	}
	
	function i18n(key) {
		if (key == 'templates namespace')
			return mw.config.get('wgFormattedNamespaces')[10];
		switch (mw.config.get('wgContentLanguage')) {
			case 'he':
				switch (key) {
					case 'explainOptional': return 'השדות המסומנים באדום הם חובה, השאר אופציונליים';
					case 'ok': return 'אישור';
					case 'cancel': return 'ביטול'
					case 'params subpage': return 'פרמטרים';
					case 'preview': return 'תצוגה מקדימה';
					case 'options select': return 'בחרו ערך מהרשימה';
					case 'multiline': return 'מספר שורות';
					case 'close': return 'סגור';
					case 'required': return 'שדה חובה';
					case 'depends': return 'תלוי';
				}
		}
	}
	
	function paramPage() {
		return i18n('templates namespace') + ':' + $.trim(template) + '/' + i18n('params subpage');
	}
	
	var brainDamage = $.browser.msie && $.browser.version < 8;


	function updateRawPreview(){
		$('#tpw_preview').html(createWikiCode());
		var canOK = 'enable';
		for (var i in dialogFields) {
			var df = dialogFields[i][1];
			var opts = df.data('options');
			if (opts && opts.required && $.trim(df.val()).length == 0)
				canOK = 'disable';
			if (opts && opts.depends) {
				var dep = fieldsBypName[opts.depends];
				var depEmpty = (dep && dep.val() && $.trim(dep.val())) ? false : true; 
				var row = rowsBypName[df.data('paramName')];
				if (row)
					row.toggleClass('tpw_hidden', depEmpty);
			}
		}
		$(".ui-dialog-buttonpane button:contains('אישור')").button(canOK);
	}
	
	
	function toggleDesc() {$(this).next('span').toggleClass('tpw_hidden');}
	
	function createInputField(paramName) {
		var templateParam = templateParams[paramName],
			select = templateParam.select,
			inputField;
			
		if (select) {
			inputField = $('<select>').append($('<option>', {text: i18n('options select'), value: ''}));
			for (var i in select)
				inputField.append($('<option>', {text: select[i], value: select[i]}));
		}
		else if (templateParam.options && templateParam.options.multiline) {
			var rows = templateParam.options.multiline;
			inputField = $('<textarea>', {rows: isNaN(parseInt(rows)) ? 3 : rows});
		}
		else
			inputField = $('<input>', {type: 'text'});
		inputField.css({width: '28em'})
			.data({paramName: paramName, options: templateParam.options})
			.bind('paste cut drop input change', updateRawPreview);
			
		if (templateParam.defVal)
			inputField.val(templateParam.defVal);
		if (templateParam.options && templateParam.options.required)
			inputField.addClass('tpw_required').css({border: '1px red solid'});
		return inputField;
	}
	
	function addRow(paramName, table) {
		var inputField = createInputField(paramName);
		var tr = $('<tr>')
			.append($('<td>', {width: '160'})
				.append($('<span>')
					.text(paramName)
					.click(toggleDesc)
					.css({maxWidth: '20em', cursor: 'pointer', color: 'blue', title: paramName})
				)
				.append($('<span>', {'class': 'tpw_hidden'})
					.css({backgroundColor: 'yellow'})
					.html('<br />' + (templateParams[paramName].desc || ''))
				)
			)
			.append($('<td>').css({width: '30em'}).append(inputField));
		dialogFields.push([paramName, inputField]);
		table.append(tr);
		rowsBypName[paramName] = tr;
		fieldsBypName[paramName] = inputField;
	}
	
	function injectResults() {
		$("#wpTextbox1").textSelection('encapsulateSelection', {replace: true, peri: createWikiCode()});
	}
	
	function buildDialog(data) {
		$('.tpw_disposable').remove();
		buildParams(data);
		paramsFromSelection();
		var	table = $('<table>');
		var dialog = $('<div>', {'class': 'tpw_disposable'})
			.dialog({height: 'auto',
					width: 'auto',
					overflow: 'auto',
					position: [$('body').width() * 0.2, $('body').height() * 0.1],
					open: function() {$(this).css({'max-height': Math.round($('body').height() * 0.7)});},
			})
			.append($('<p>').text(i18n('explainOptional')))
			.append(table)
			.append($('<p>').css({height: '2em'}))
			.append($('<pre>', {id: 'tpw_preview', 'class': 'tpw_disposable'})
				.css({backgroundColor: "lightGreen", maxWidth: '40em', maxHeight: '8em', overflow: 'auto'}));

		for (var paramName in templateParams)
			addRow(paramName, table);
		
		var buttons = {}; // we need to do it this way, because with literal object, the keys must be literal.
		buttons[i18n('ok')] = function() {injectResults(); dialog.dialog('close'); };
		buttons[i18n('cancel')] = function() {dialog.dialog('close');}
		buttons[i18n('preview')] = showPreview;
		dialog.dialog('option', 'buttons', buttons);
		$('.ui-dialog-buttonpane').css({backgroundColor: '#E0E0E0'});
		$('.ui-dialog-buttonpane').css({direction: 'ltr'});
		$('.ui-dialog-buttonpane > button').css({float: 'right'}); // jQuery has problems with rtl dialogs + ie is braindamaged.
		updateRawPreview();
	}

	function init() {
		template = null;
		templateParams = {};
		dialogFields = [];
		rowsBypName = {};
		fieldsBypName = {};		
	}
	
	function fireDialog() {
		init();
		var match = $("#wpTextbox1").textSelection('getSelection').match(/^\{\{([^|}]*)/);
		template = match ? $.trim(match[1]) : null;
		if (! template)
			return;
		
		$.ajax({
			url: mw.util.wikiScript('index'),
			data: {title: paramPage(), action: 'raw', ctype: 'text/x-wiki'},
			success: buildDialog
		});
	}

	$("<style type='text/css'> \n" +
		".tpw_hidden{display:none;} \n" +
		"</style> "
	).appendTo("head");

	setTimeout(function() {
		var buttonImage = '//upload.wikimedia.org/wikipedia/he/math/b/e/f/bef83e1ceb68569ed581318e6108e8a2.png';
		if (typeof $.wikiEditor != 'undefined')
			$('#wpTextbox1').wikiEditor('addToToolbar', {
				section: 'advanced',
				group: 'more',
				tools: {
					'linkTemplatewizard': {
						label: 'תבנית קישור',
						type: 'button',
						icon: buttonImage,
						action: {type: 'callback', execute: fireDialog}
					}
				}
			});
		else
			$('div #toolbar').append( // "old style"
				$('<img>', {src: buttonImage, title: 'תבנית קישור', 'class': 'mw-toolbar-editbutton'})
				.css({cursor: 'pointer'})
				.click(fireDialog)
			);
			
	}, 120);

});
});

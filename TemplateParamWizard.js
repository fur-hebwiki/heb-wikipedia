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
	// value
	// description
	// attribs: bool optional, 
	// options: array of possible values - undefined if it's a free text param
	// templateParams is keyed by param name.
	var templateParams,
	// which template are we working on
		template,
	// the input fileds. each field has some data also, e.g., the param name.
		dialogFields;
	
	function paramsFromSelection() {
	}
	
	function buildParams(data) {
		templateParams = {};
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
			if (fields.length > 2)
				pAttribs.defVal = $.trim(fields[2]);
			if (fields.length > 3)
				pAttribs.options = fileds[3].split(",");
			templateParams[name] = pAttribs;
		}
	}
	
	function createWikiCode() {
		var par = [template];
		for (var i in dialogFields) {
			var 
				field = dialogFields[i],
				name = $.trim(field[0]),
				val = $.trim(field[1].val()).replace(/\|/g, '{{!}}');
			if (val.length)
				par.push(name + '=' + val);
		}
		return "{{" + par.join("\n|") + "\n}}";
	}

	function showPreview() {
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
					case '': return '';
					case '': return '';
					case '': return '';
				}
		}
	}
	
	function paramPage() {
		return i18n('templates namespace') + ':' + $.trim(template) + '/' + i18n('params subpage');
	}
	
	var brainDamage = $.browser.msie && $.browser.version < 8;


	function updateRawPreview(){
	}
	
	function toggleDesc() {$(this).next('span').toggleClass('hiddenDesc');}
	
	function addRow(paramName, table) {
		var templateParam = templateParams[paramName];
		var options = templateParam.options;
		var inputField = options 
			? $('<select>').append($('<option>', {text: i18n('options select')}))
			: $('<input>', {type: 'text', width: 600});
		inputField.attr({id: 'tpw_inputfield_' + paramName})
			.css({width: '28em'})
			.data('paramName', paramName)
			.bind('paste cut drop input change', updateRawPreview);
			
		if (options) 
			for (var i in options)
				inputField.append($('<option>', {text: options[i], value: optiosn[i]}));

		if (templateParam.defVal)
			inputField.val(templateParam.defVal);
		if (templateParam.required)
			inputField.addClass('tpw_required').css({border: '1px red solid'});
		var tr = $('<tr>')
			.append($('<td>')
				.append($('<span>')
					.text(paramName)
					.click(toggleDesc)
					.css({maxWidth: '20em', cursor: 'pointer', color: 'blue', title: paramName})
				)
				.append($('<span>', {'class': 'hiddenDesc'})
					.text('<br />' + templateParam.desc)
				)
			)
			.append($('<td>').css({width: '30em'}).append(inputField));
		dialogFields.push([paramName, inputField]);
		table.append(tr);
	}
	
	function injectResults() {
		$("#wpTextbox1").textSelection('encapsulateSelection', {replace: true, peri: createWikiCode()});
	}
	
	function buildDialog(data) {
		buildParams(data);
		var	table = $('<table>');
		var dialog = $('<div>', {'class': 'tpw_disposable'}).dialog()
			.append($('<p>').text(i18n('explainOptional')))
			.append(table)
			.append($('<p>').css({height: '2em'}))
			.append($('<div>', {id: 'tpw_preview'})
				.css({backgroundColor: "lightGreen", maxWidth: '40em', maxHeight: '8em', overflow: 'auto'}));

		dialogFields = [];
		for (var paramName in templateParams)
			addRow(paramName, table);
		
		var buttons = {}; // we need to do it this way, because with literal object, the keys must be literal.
		buttons[i18n('ok')] = function() {injectResults(); dialog.dialog('close'); };
		buttons[i18n('cancel')] = function() {dialog.dialog('close');}
		buttons[i18n('preview')] = showPreview;
		dialog.dialog('option', 'buttons', buttons);
		$('.ui-dialog-buttonpane').css({backgroundColor: '#E0E0E0'});
		dialog.dialog('option', {
			height: 'auto',
			width: 'auto',
			position: [(window.width - dialog.width()) / 2, (window.height - dialog.height()) / 2]
		});
		$('.ui-dialog-buttonpane').css({direction: 'ltr'});
		$('.ui-dialog-buttonpane > button').css({float: 'right'}); // jQuery has problems with rtl dialogs + ie is braindamaged.
		updateRawPreview();
	}

	function fireDialog() {
		if (!template) {
			var match = $("#wpTextbox1").textSelection('getSelection').match(/^\{\{([^|}]*)/);
			if (match)
				template = $.trim(match[1]);
		}
		if (! template)
			return;
		
		$.ajax({
			url: mw.util.wikiScript('index'),
			data: {title: paramPage(), action: 'raw', ctype: 'text/x-wiki'},
			success: buildDialog
		});
	}

	$("<style type='text/css'> \n" +
		".hiddenDesc{display:none;} \n" +
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

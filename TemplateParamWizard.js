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
		var selection = $("#wpTextbox1").textSelection('getSelection');
		var params = selection.split('|');
		for (var i in params) {
			var param = params[i].split(/\s*=\s*/);
			var name = param.shift();
			if (param.length)
				templateParams[name] = $.extend(templateParams[name] || {}, {defVal: param.join('=').replace(/\}\}$/, '')});
		}
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
		var options = {};
		var opts = ['multiline', 'required']; // maybe we'll have more in the future
		for (var i in opts) 
			if (str.indexOf(i18n(opts[i])) + 1)
				options[opts[i]] = true;
		return options;
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
		var temp = createWikiCode();
		$.post(mw.util.wikiScript('api'), {action: 'parse', text: temp, prop: 'text', format: 'json'}, function(data) {
			if (data && data.parse && data.parse.text) {
				var buttons = {},
					div = $('<div>')
						.css({width: '100%', height: '100%', overflow: 'auto'})
						.html(data.parse.text['*']);
				buttons[i18n('close')] = function() {$(this).dialog('close');};
				div.find('a').attr('target', '_blank'); // we don't want people to click on links in preview - they'll lose their work.
				$('<div>')
					.dialog({title: i18n('preview'), width: $('body').width() / 2, height: $('body').height() / 2, buttons: buttons})
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
		for (var i in dialogFields)
			if (dialogFields[i][1].hasClass('tpw_required') && $.trim(dialogFields[i][1].val()).length == 0)
				canOK = 'disable';
		$(".ui-dialog-buttonpane button:contains('אישור')").button(canOK);
	}
	
	
	function toggleDesc() {$(this).next('span').toggleClass('hiddenDesc');}
	
	function createInputField(paramName) {
		var templateParam = templateParams[paramName],
			select = templateParam.select,
			inputField;
			
		if (select) {
			inputField = $('<select>').append($('<option>', {text: i18n('options select'), value: ''}));
			for (var i in select)
				inputField.append($('<option>', {text: select[i], value: select[i]}));
		}
		else if (templateParam.options && templateParam.options.multiline)
			inputField = $('<textarea>').css({height: '3em', width: '400px', overflow: 'auto'});
		else
			inputField = $('<input>', {type: 'text', width: 600});
		inputField.attr({id: 'tpw_inputfield_' + paramName})
			.css({width: '28em'})
			.data('paramName', paramName)
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
			.append($('<td>')
				.append($('<span>')
					.text(paramName)
					.click(toggleDesc)
					.css({maxWidth: '20em', cursor: 'pointer', color: 'blue', title: paramName})
				)
				.append($('<span>', {'class': 'hiddenDesc'})
					.css({backgroundColor: 'yellow', border: 'solid black 1px'})
					.html('<br />' + (templateParams[paramName].desc || ''))
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
		paramsFromSelection();
		var	table = $('<table>');
		var dialog = $('<div>', {'class': 'tpw_disposable'}).dialog()
			.append($('<p>').text(i18n('explainOptional')))
			.append(table)
			.append($('<p>').css({height: '2em'}))
			.append($('<pre>', {id: 'tpw_preview'})
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

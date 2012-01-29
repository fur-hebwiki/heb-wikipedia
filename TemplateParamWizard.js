//Adds wizard for using templates for external links
//Written by [[User:קיפודנחש]]
if($.inArray(mw.config.get('wgAction'), ['edit', 'submit'])+1)
$(document).ready(function() {    
mw.loader.using(['jquery.ui.widget','jquery.ui.autocomplete','jquery.textSelection', 'jquery.ui.dialog'], function() {

	// template parameter is an object with the following fields:
	// desc: desciption string
	// select: array of possible values (optional)
	// defval: default value (optional)
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
		fieldsBypName,
		rtl = $('body').css('direction') == 'rtl';
	
	function paramsFromSelection() {
		var selection = $("#wpTextbox1").textSelection('getSelection').replace(/(^\{\{|\}\}$)/g, ''); //scrap the first {{ and last }}
		var specials = []; 
		while (true) { //extract inner links, inner templates and inner params - we don't want to sptit those.
			var match = selection.match(/(\{\{[^{}\]\[]*\}\}|\[\[[^{}\]\[]*\]\]|\[[^{}\]\[]*\](?:[^\]]))/);
			if (! match || ! match.length)
				break;
			specials.push(match[0]);
			selection = selection.replace(match[0], "\0" + specials.length + "\0");
		}
		var params = selection.split(/\s*\|\s*/);
		for (var i in params) {
			var param = params[i];
			while (true) {
				var match = param.match(/\0(\d+)\0/);
				if (! match || ! match.length)
					break;
				param = param.replace(match[0], specials[parseInt(match[1], 10)-1]);
			}
			var paramPair = param.split("=");
			var name = $.trim(paramPair.shift());
			if (name && paramPair.length) {
				templateParams[name] = templateParams[name] || {};
				templateParams[name].options = $.extend(templateParams[name].options || {}, {'defval': paramPair.join('=')});
			}
		}
	}
	
	function buildParams(data) {
		var lines = data.split("\n");
		while (lines && lines.length) {
			var line = lines.shift();
				if (!(/^\|-/.test(line))) // look for |- this is wikitext for table row.
					continue;
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
			if (fields.length > 2) 
				pAttribs.options = analyzeOptions($.trim(fields[2]));
				
			templateParams[name] = pAttribs;
		}
	}
	
	function analyzeOptions(str) {
		var res = {},
			avail = ['multiline', 'required', 'depends', 'defval', 'choices'], // maybe we'll have more in the future
			tavail = $.map(avail, i18n),
			options = str.split(/\s*;\s*/);
		for (var i in options) {
			var option = options[i].split(/\s*=\s*/);
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
				f = field[1],
				hidden = f.parents('.tpw_hidden').length,
				val = $.trim(f.val());
			if (f.attr('type') == 'checkbox' && ! f.prop('checked'))
				val = "";
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
				$('a', div).attr('target', '_blank'); // we don't want people to click on links in preview - they'll lose their work.
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
					case 'explain': return  'השדות המסומנים באדום הם חובה, השאר אופציונליים.' +
						 '<br />' + 'הקישו על שם הפרמטר לקבלת הסבר עליו, הקישו שוב להסתיר את ההסבר.';
					case 'ok': return 'אישור';
					case 'cancel': return 'ביטול'
					case 'params subpage': return 'פרמטרים';
					case 'preview': return 'תצוגה מקדימה';
					case 'options select': return 'בחרו ערך מהרשימה';
					case 'multiline': return 'מספר שורות';
					case 'close': return 'סגור';
					case 'required': return 'שדה חובה';
					case 'depends': return 'תלוי';
					case 'defval': return 'ברירת מחדל';
					case 'choices': return 'אפשרויות';
					case 'button hint': return 'אשף מילוי תבניות';
					
				}
			default:
				switch (key) {
					case 'explain': return 'fields with red border are required, the rest are optional';
					case 'ok': return 'OK';
					case 'cancel': return 'Cancel'
					case 'params subpage': return 'Parameters';
					case 'preview': return 'Preview';
					case 'options select': return 'Select one:';
					case 'multiline': return 'Multiline';
					case 'close': return 'Close';
					case 'required': return 'Required';
					case 'depends': return 'Depends on';
					case 'defval': return 'Default';
					case 'choices': return 'Choices';
					case 'button hint': return 'Template parameters wizard';

					
				}
		}
		return key;
	}
	
	function paramPage() {
		return i18n('templates namespace') + ':' + $.trim(template) + '/' + i18n('params subpage');
	}
	
	function updateRawPreview(){
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
		$('#tpw_preview').html(createWikiCode());
	}
	
	function toggleDesc() {$(this).next('p').toggleClass('tpw_hidden');}
	
	function createInputField(paramName) {
		var options = templateParams[paramName].options || {},
			f,
			checkbox = false;
			
		if (options.choices) {
			var choices = options.choices.split(/\s*,\s*/);
			if (choices.length > 1) {
				f = $('<select>').append($('<option>', {text: i18n('options select'), value: ''}));
				for (var i in choices)
					f.append($('<option>', {text: choices[i], value: choices[i]}));
			}
			else {
				checkbox = true;
				f = $('<input>', {type: 'checkbox', value: choices[0]})
					.css({float: rtl ? 'right' : 'left'})
				f.prop('checked', options.defval && options.defval == choices[0]);
			}
		}
		else if (options.multiline) {
			var rows = options.multiline;
			f = $('<textarea>', {rows: isNaN(parseInt(rows)) ? 3 : rows});
		}
		else
			f = $('<input>', {type: 'text'});
		
		f.css({width: checkbox ? '1em' : '28em'})
			.data({paramName: paramName, options: options})
			.bind('paste cut drop input change', updateRawPreview);
			
		if (options.defval) 
			f.val(options.defval);
		
		if (options.required)
			f.addClass('tpw_required').css({border: '1px red solid'});
		return f;
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
				.append($('<p>', {'class': 'tpw_hidden'})
					.css({backgroundColor: 'yellow', width: '160px', overflow:'hidden'})
					.text((templateParams[paramName].desc || ''))
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
					open: function() {$(this).css({'max-height': Math.round($('body').height() * 0.7)});}
			})
			.append($('<p>').html(i18n('explain')))
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
	
	function reportError(a,b,error) {
		if (error == "Not Found")
			error = 'לתבנית "' + template + '" אין דף דף פרמטרים - האשף לא יכול לפעול ללא דף כזה';
		if (console) {
			for (key in a)
				if (typeof a[key] != 'function')
					console.log(key + '=>' + a[key]);
			console.log(b);
			console.log(error);
		}
		alert('טעות בהפעלת האשף.' + '\n' + error);
	}
	
	function fireDialog() {
		init();
		var match = $("#wpTextbox1").textSelection('getSelection').match(/^\{\{([^|}]*)/);
		template = match ? $.trim(match[1]) : null;
		if (! template) {
			reportError(null, null, 'כדי להשתמש באשף התבניות יש לסמן בתיבת העריכה את התבנית.');
			return;
		}
		$.ajax({
			url: mw.util.wikiScript('index'),
			data: {title: paramPage(), action: 'raw', ctype: 'text/x-wiki'},
			success: buildDialog,
			error: reportError
		});
	}

	$("<style type='text/css'> \n" +
		".tpw_hidden{display:none;} \n" +
		"</style> "
	).appendTo("head");

	setTimeout(function() {
		var buttonImage = '//upload.wikimedia.org/wikipedia/commons/e/eb/Button_plantilla.png';
		if (typeof $.wikiEditor != 'undefined')
			$('#wpTextbox1').wikiEditor('addToToolbar', {
				section: 'advanced',
				group: 'more',
				tools: {
					'linkTemplatewizard': {
						label: i18n('button hint'),
						type: 'button',
						icon: buttonImage,
						action: {type: 'callback', execute: fireDialog}
					}
				}
			});
		else
			$('div #toolbar').append( // "old style"
				$('<img>', {src: buttonImage, title: i18n('button hint'), 'class': 'mw-toolbar-editbutton'})
				.css({cursor: 'pointer'})
				.click(fireDialog)
			);
			
	}, 120);

});
});

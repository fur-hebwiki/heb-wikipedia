//Template parameters wizard
//Written by [[User:קיפודנחש]]
if($.inArray(mw.config.get('wgAction'), ['edit', 'submit'])+1)
mw.loader.using(['jquery.ui.widget','jquery.tipsy','jquery.textSelection', 'jquery.ui.autocomplete', 'jquery.ui.dialog'], function() {
$(function() {
	// template parameter is an object with the following fields:
	// desc: desciption string
	// defval: default value (optional)
	// options: object with optional fields:
	//// multiline: number of lines
	//// depends: another field's name
	//// required: boolean
	//// choices: array of legal values for the field
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
	// boolean, indicating we did not find "Parameters" page, so the parameters are extracted from template page itself.
		rawTemplate,
		rtl = $('body').is('.rtl'),
	// test to see if a string contains wikiCode and hence needs parsing, or cen be used as is.
		wikiCodeFinder = /[\[\]\{\}\<\>]/,
		globalExplanation = '';

	function paramsFromSelection() {
		var selection = $("#wpTextbox1").textSelection('getSelection').replace(/^\s*\{\{|\}\}\s*$/g, ''); //scrap the first {{ and last }}
		var specials = [];
		while (true) { //extract inner links, inner templates and inner params - we don't want to sptit those.
			var match = selection.match(/(\{\{[^\{\}\]\[]*\}\}|\[\[[^\{\}\]\[]*\]\]|\[[^\{\}\]\[]*\])/);
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
				templateParams[name] = templateParams[name] || {options: {notInParamPage: 1}};
				$.extend(templateParams[name].options, {'defval': paramPair.join('=')});
			}
		}
	}

	function buildParamsRaw(data) {
		var
			paramExtractor = /{{3,}(.*?)[\|}]/mg,
			m;
		while (m = paramExtractor.exec(data))
			templateParams[m[1]] = {desc: '', options: {multiline: 5}};
	}

	function buildParams(data) {
		var
			lines = data.split("\n"),
			line;

		function extractGlobalExplanation() {
			line = line.replace(/[!\|][^\|]*\|/, '');
			if (wikiCodeFinder.test(line))
				$.post(
					mw.util.wikiScript('api'),
					{action: 'parse', text: line, disablepp: 1, format: 'json'},
					function(data) {
						var html = data.parse.text['*'];
						globalExplanation = html;
						$('#tpw_globalExplanation').html(html).find('a').attr({target: '_blank'});
					}
				);
			else
				globalExplanation = line;
		}

		while (lines && lines.length) {
			line = lines.shift();
				if (!(/^\|-/.test(line))) // look for |- this is wikitext for table row.
					continue;
			line = lines.shift();
			if (line.indexOf('globalExplanation') + 1) {
				extractGlobalExplanation()
				continue;
			}
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
			par.push(name + '=' + val);
		}
		return "{{" + par.join("\n|") + "\n}}";
	}

	function showPreview() {
		var temp = createWikiCode();
		$.post(mw.util.wikiScript('api'),
			{action: 'parse',
				title: mw.config.get('wgPageName'),
				prop: 'text',
				text: temp,
				format: 'json'
			},
			function(data) {
				if (data && data.parse && data.parse.text) {
					var buttons = [{text: i18n('close'), click: function() {$(this).dialog('close');}}],
						div = $('<div>').html(data.parse.text['*']);
					$('a', div).attr('target', '_blank'); // we don't want people to click on links in preview - they'll lose their work.
					$('<div>')
						.dialog(
							{title: i18n('preview'),
							modal: true,
							position: [60, 60],
							buttons: buttons})
						.append(div);
					circumventRtlBug();
				}
			});
	}

	function circumventRtlBug() {
		if (rtl)
			$('.ui-dialog-buttonpane button').css({float: 'right'}); // jQuery has problems with rtl dialogs + ie is braindamaged.
	}

	function i18n(key, param) {
		switch (mw.config.get('wgContentLanguage')) {
			case 'he':
				switch (key) {
					case 'explain': return rawTemplate
						? 'לתבנית "' + template + '" אין דף פרמטרים, ולכן לשדות אין תיאור.'
						: 'השדות המסומנים באדום הם חובה, השאר אופציונליים.';
					case 'wizard dialog title': return 'מילוי הפרמטרים עבור ' + '<a href="' + mw.util.wikiGetlink('תבנית:' + template) + '" target="_blank">' + 'תבנית:' + template + '</a>';
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
					case 'able templates category name': return 'תבניות הנתמכות על ידי אשף התבניות';
					case 'template selector title': return 'אנא בחרו תבנית מהרשימה:';
					case 'notInParamPage': return 'השדה "' + param + '" לא מופיע ברשימת הפרמטרים של התבנית';
					case 'editParamPage': return 'לעריכת דף הפרמטרים';
					case 'unknown error': return 'טעות בהפעלת האשף.\n' + param;
					case 'please select template': return 'בחרו תבנית מהרשימה';
				}
			default:
				switch (key) {
					case 'explain': return 'fields with red border are required, the rest are optional';
					case 'wizard dialog title': return 'Set up parameters for template: ' + template;
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
					case 'able templates category name': throw('Must define category name for wizard-capable templates');
					case 'template selector title': return 'Please select a template from this list';
					case 'notInParamPage': return 'field "' + param + '" does not appear in the template\'s parameters list';
					case 'editParamPage': return 'Edit paramters page';
					case 'unknown error': return 'Error occured: \n' + param;
					case 'please select template': return 'select a template from the list';

				}
		}
		return key;
	}

	function paramPage() {return mw.config.get('wgFormattedNamespaces')[10] + ':' + $.trim(template) + '/' + i18n('params subpage');}

	function templatePage() {return mw.config.get('wgFormattedNamespaces')[10] + ':' + $.trim(template);}

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
		$(".ui-dialog-buttonpane button:contains('" + i18n('ok') + "')").button(canOK);
		$('#tpw_preview').text(createWikiCode());
	}

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
			f = $('<textarea>', {rows: 1})
				.data({dispRows: isNaN(parseInt(rows)) ? 5 : rows})
				.focus(function(){this.rows = $(this).data('dispRows');})
				.blur(function(){this.rows = 1});
		}
		else
			f = $('<input>', {type: 'text'});

		if (!checkbox && f.autoCompleteWikiText) // teach the controls to autocomplete.
			f.autoCompleteWikiText({positionMy: rtl ? "left top" : "right top"});

		f.css({width: checkbox ? '1em' : '28em'})
			.data({paramName: paramName, options: options})
			.bind('paste cut drop input change', updateRawPreview);

		if (options.defval)
			f.val(options.defval);

		if (options.required)
			f.addClass('tpw_required').css({border: '1px red solid'});
		return f;
	}

	var
		timer = null,
		lastVisited = $('<a>');

	function enterTipsy() {
		clearTimeout(timer);
		$(this).attr('inside', 1);
	}

	function leaveTipsy() {
		var $this = $(this);
		if ($this.attr('master') || $this.attr('inside')) {
			$this.attr('inside', '');
			timer = setTimeout(function(){lastVisited.tipsy('hide');}, 500);
		}
	}

	function tipsyContent() {
		var
			paramName = $(this).text(),
			def = templateParams[paramName],
			desc = def.desc || '';
		if (def.htmlDesc)
			return def.htmlDesc;
		if (def.options.notInParamPage)
			return $('<div>')
				.append(i18n('notInParamPage', paramName) + '<br />')
				.append($('<a>', {href: mw.util.wikiGetlink(paramPage()) + '?action=edit', target: '_blank', text: i18n('editParamPage')}))
				.html();
		if (wikiCodeFinder.test(desc)) // does it need parsing?
			$.ajax({
				url: mw.util.wikiScript('api'),
				async: false,
				type: 'post',
				data: {action: 'parse', text: desc, disablepp: 1, format: 'json'}, // parse it.
				success: function(data) {
					var div = $('<div>').html(data.parse.text['*']);
					$('a', div).attr({target: '_blank'});
					def.htmlDesc = div.html();
				}
			});
		else
			def.htmlDesc = desc;
		return def.htmlDesc;
	}

	function addRow(paramName, table) {
		var
			def = templateParams[paramName],
			inputField = createInputField(paramName),
			nameColor = def.desc ? 'blue' : (def.options.notInParamPage ? 'red' : 'black'),
			tr = $('<tr>')
				.append(
					$('<td>', {width: 120})
					.css({fontWeight: 'bold', color: nameColor})
					.text(paramName)
					.tipsy({html: true, trigger: 'manual', title: tipsyContent})
					.mouseenter(function() {
						clearTimeout(timer);
						$('.tipsy').remove();
						lastVisited = $(this);
						lastVisited.tipsy('show');
					})
					.mouseleave(leaveTipsy)
					.attr('master', 'true')
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
		if (rawTemplate)
			buildParamsRaw(data)
		else
			buildParams(data);
		paramsFromSelection();
		var	table = $('<table>');
		var dialog = $('<div>', {'class': 'tpw_disposable'})
			.dialog({height: 'auto',
					title: i18n('wizard dialog title', template),
					width: 'auto',
					overflow: 'auto',
					position: [$('body').width() * 0.2, $('body').height() * 0.1],
					open: function() {$(this).css({'max-height': Math.round($('body').height() * 0.7)});}
			})
			.append($('<div>', {id: 'tpw_globalExplanation'}).html(globalExplanation))
			.append($('<p>').html(i18n('explain')))
			.append(table)
			.append($('<p>').css({height: '2em'}))
			.append($('<pre>', {id: 'tpw_preview'})
				.css({backgroundColor: "lightGreen", maxWidth: '40em', maxHeight: '8em', overflow: 'auto'}));

		for (var paramName in templateParams)
			addRow(paramName, table);

		var buttons = {}; // we need to do it this way, because with literal object, the keys must be literal.
		buttons[i18n('ok')] = function() {injectResults(); dialog.dialog('close'); };
		buttons[i18n('cancel')] = function() {dialog.dialog('close');}
		buttons[i18n('preview')] = showPreview;
		dialog.dialog('option', 'buttons', buttons);
		circumventRtlBug();
		updateRawPreview();
		$('.tipsy')
			.live('mouseenter', enterTipsy)
			.live('mouseleave', leaveTipsy);
	}

	function init() {
		template = null;
		templateParams = {};
		dialogFields = [];
		rowsBypName = {};
		fieldsBypName = {};
		mw.util.addCSS(".tpw_hidden{display:none;}");
	}

	function reportError(a,b,error) {
		if (typeof console != 'undefined') {
			for (key in a)
				if (typeof a[key] != 'function')
					console.log(key + '=>' + a[key]);
			console.log(b);
			console.log(error);
		}
		alert(i18n('unknown error', error));
	}

	function pickTemplate() {
		var selector = $('<input>')
			.css({width: '28em'})
			.autocomplete({
				source: function(request, response) {
					$.getJSON(
						mw.util.wikiScript('api'),
						{action:'opensearch', search: request.term, namespace: 10},
						function(data){
							if(data[1])
								response($(data[1]).map(function(index,item){return item.replace(/.*:/, '');}));
						}
					);
				},
			});
		var templateSelector = $('<div>').dialog({
			title: i18n('template selector title'),
			height: 'auto',
			width: 'auto',
			modal: true,
			buttons: [
				{text: i18n('ok'), click: function(){template = selector.val(); fireDialog(); templateSelector.dialog("close")}},
				{text: i18n('cancel'), click: function(){templateSelector.dialog("close")}}
			]
		}).append(selector);
		circumventRtlBug();
	}

	function fireDialog() {
		rawTemplate = false;
		$.ajax({
			url: mw.util.wikiScript(),
			data: {title: paramPage(), action: 'raw', ctype: 'text/x-wiki'},
			success: buildDialog,
			error: function() {
				rawTemplate = true;
				$.ajax({
					url: mw.util.wikiScript(),
					data: {title: templatePage(), action: 'raw', ctype: 'text/x-wiki'},
					success: buildDialog,
					error: reportError
				});
			}
		});
	}


	function doIt() {
		init();
		var match = $("#wpTextbox1").textSelection('getSelection').match(/^\{\{([^|}]*)/);
		template = match ? $.trim(match[1]) : null;
		if (template)
			fireDialog();
		else
			pickTemplate();
	}

	setTimeout(function() {
		var buttonImage = '//upload.wikimedia.org/wikipedia/commons/e/eb/Button_plantilla.png';
		if (typeof $.wikiEditor == 'object' && $.wikiEditor.supported)
			$('#wpTextbox1').wikiEditor('addToToolbar', {
				section: 'advanced',
				group: 'more',
				tools: {
					'linkTemplatewizard': {
						label: i18n('button hint'),
						type: 'button',
						icon: buttonImage,
						action: {type: 'callback', execute: doIt}
					}
				}
			});
		else
			$('div #toolbar').append( // "old style"
				$('<img>', {src: buttonImage, title: i18n('button hint'), 'class': 'mw-toolbar-editbutton'})
				.css({cursor: 'pointer'})
				.click(doIt)
			);

	}, 120);

});
});
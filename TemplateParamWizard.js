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
	var templateParams = {};
	
	// which template are we working on
	var template;
	
	// the input fileds. each field has some data also, e.g., the param name.
	var dialogFields = [];
	
	function paramsFromSelection() {
	}
	
	function buildParams(data) {
		var lines = data.split("\n");
		while (lines) {
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
			if (fileds.length > 2)
				pAttribs.defVal = $.trim(fields[2]);
			if (fields.length > 3)
				pAttribs.options = fileds[3].split(",");
			templateParams[name] = pAttribs;
		}
	}
	
	function createWikiCode() {
		var par = [template];
		for (j in dialogFields) {
			var 
				field = dialogFields[i],
				val = $.trim(field[1].val()).replace(/\|/g, '{{!}}');
			if (val.length)
				par.push(field.data('paramName') + '=' + val);
		}
		return "{{" + par.join("\n|") + "}}";
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
	var	table = $('<table>');


	function updateRawPreview(){
		$('#tpw_preview').text(createWikiCode());
		var canOK = 'enable';
		var f = orderedFields.concat([]); //clone - we don't want to touch orderedFields.
		for (var i in namedFields)
			f.push(namedFields[i][1]);
		for (var i in f)
			if (f[i].hasClass('tpw_required') && $.trim(f[i].val()).length == 0)
				canOK = 'disable';
		$(".ui-dialog-buttonpane button:contains('אישור')").button(canOK);
		if (brainDamage) { //IOW: internet explorer.
			var width = $('#tpw_dialog').width() - 12;
			$('.ui-dialog-titlebar').width(width);
			$('.ui-dialog-buttonpane').width(width);
		}
	}
	
	function toggleDesc() {$(this).next('span').toggleClass('hiddenDesc');}
	
	function addRow(paramName) {
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
	function buildDialog(data) {
		$('.tpw_disposable').remove();
		buildParams(data);		
		dialog
			.append($('<p>').text(i18n('explainOptional')))
			.append(table)
			.append($('<p>').css({height: '2em'}))
			.append($('<div>', {id: 'tpw_preview'})
					.css({backgroundColor: "lightGreen", maxWidth: '40em', maxHeight: '8em', overflow: 'auto'}));


		for (var paramName in templateParams)
			addRow(paramName);
		
		var buttons = {}; // we need to do it this way, because with literal object, the keys must be literal.
		buttons[i18n('ok')] = function() {insertTags('', createWikiCode(), ''); dialog.dialog('close'); };
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
			var match = $("#wpTextbox1").textSelection('getSelection').match(/^\{\{([^|]*)/);
			if (match)
				template = $.trim(match[1]);
		}
		if (! template)
			return;
		
		$.ajax({
			url: mw.util.wikiScript('index'),
			contents: {title: param_page(), action: 'raw', ctype: 'text/x-wiki'},
			success: buildDialog
		});
	}

	$("<style type='text/css'> \n" +
		".hiddenDesc{display:none;} \n" +
		"</style> "
	).appendTo("head");

	var mode="none";
	var templateParamsNotFound = false;
	function findLinks(res){
		var pos=$( "#wpTextbox1" ).textSelection('getCaretPosition')-1;
		var txt=$( "#wpTextbox1" ).val();

		var lastbegin=txt.lastIndexOf("[[",pos);
		var lastend=txt.lastIndexOf("]]",pos);
		var isLink=lastbegin>lastend;
		if(isLink) {
			fillLinksList(res,txt.substr(lastbegin+2,pos-lastbegin));
			mode='link';
		}
		else{
			lastbegin=txt.lastIndexOf("{{",pos);
			lastend=txt.lastIndexOf("}}",pos);
			var isTemplate=lastbegin>lastend;
			if(isTemplate){
				mode='template';
				if (txt.substr(pos, 1) == '|') { // in template mode, | is as good as enter
					addAutocompleteLink(txt.substr(lastbegin+2,pos-lastbegin))
					return;
				}
				var prefixName=mw.config.get('wgFormattedNamespaces')[10]+':'+txt.substr(lastbegin+2,pos-lastbegin);
				fillLinksList(res,prefixName);
			}
			else{
				res([]);
				mode="none";
			}
		}
	}

	function fillLinksList(res,txt){
		if(txt.length<=1 || txt.indexOf('|')>-1 || txt.indexOf('#')>-1) res([]);
		else $.getJSON(mw.util.wikiScript('api'),{action:'opensearch',search:txt,format:'json'},function(data){if(data[1]) res(data[1]);});
	}
	
	function addAutocompleteLink(item){
		switch(mode){
		case "none": return;
		case "template":
			if (templateParamsNotFound) {
				item = item.substr(mw.config.get('wgFormattedNamespaces')[10].length+1);
				break;
			}
			else {
				template = item;
				$.ajax({
					url: mw.util.wikiScript('index'),
					data: {
						title: paramPage(),
						action: 'raw',
						ctype: 'text/x-wiki'
					},
					success: buildDialog,
					error: function() {
						templateParamsNotFound = true;
						addAutocompleteLink(item);
					}
				});
				return;
			}
		}
		if(mode=="none") return;
		var pos=$( "#wpTextbox1" ).textSelection('getCaretPosition')-1;
		var txt=$( "#wpTextbox1" ).val();
		var lastbegin=txt.lastIndexOf((mode=="link"?"[[":"{{"),pos);
		
		var newTxt=txt.substr(0,lastbegin)+(mode=="link"?"[[":"{{")+item+(mode=="link"?"]]":"}}")+txt.substr(pos+1);
		$( "#wpTextbox1" ).val(newTxt);
		$( "#wpTextbox1" ).textSelection('setSelection',{start:lastbegin+item.length+4});
	}

	$( "#wpTextbox1" ).autocomplete({
		source: function( request, response ) {
			findLinks(response);
			fixArrowsBug(this);
		},
		focus:function(){return false;},
		select:function(e,ui) {
			addAutocompleteLink(ui.item.value);return false;
		},
		open:function(){
			$(".ui-autocomplete").css('width','400px');
			$(".ui-autocomplete").position({
				my: $('body').is('.rtl')? "left bottom" : "right bottom",
				at: $('body').is('.rtl')? "left bottom" : "right bottom",
				of: "#wpTextbox1"
			});
		} 
	});
	
	var fixed=false;
	//this is hack to prevent known serious bug in autocomplete.js that prevent default of the up and down key which may drive you crazy....
	function fixArrowsBug(self) {
		if (fixed) 
			return;
		fixed=true;
		$("#wpTextbox1")
		.unbind("keydown.autocomplete")
		.bind("keydown.autocomplete", function(event ) {
			switch (event.keyCode) {
				case keyCode.PAGE_UP:
					self._move( "previousPage", event );
					break;
				case keyCode.PAGE_DOWN:
					self._move( "nextPage", event );
					break;
				case keyCode.UP:
					if (!self.menu.element.is(":visible")) 
						return;
					self._move( "previous", event );
					// prevent moving cursor to beginning of text field in some browsers
					event.preventDefault();
					break;
				case keyCode.DOWN:
					if (!self.menu.element.is(":visible")) 
						return;
					self._move( "next", event );
					// prevent moving cursor to end of text field in some browsers
					event.preventDefault();
					break;
				case keyCode.ENTER:
				case keyCode.NUMPAD_ENTER:
					// when menu is open or has focus
					if ( self.menu.active ) {
						event.preventDefault();
					}
					//passthrough - ENTER and TAB both select the current element
				case keyCode.TAB:
					if ( !self.menu.active ) {
						return;
					}
					self.menu.select( event );
					break;
				case keyCode.ESCAPE:
					self.element.val( self.term );
					self.close( event );
					break;
				case keyCode.LEFT:
				case keyCode.RIGHT:
				case keyCode.SHIFT:
				case keyCode.CONTROL:
				case keyCode.ALT:
				case keyCode.COMMAND:
				case keyCode.COMMAND_RIGHT:
				case keyCode.INSERT:
				case keyCode.CAPS_LOCK:
				case keyCode.END:
				case keyCode.HOME:
					// ignore metakeys (shift, ctrl, alt)
					break;
				default:
					// keypress is triggered before the input value is changed
					clearTimeout( self.searching );
					self.searching = setTimeout(function() {
						self.search( null, event );
					}, self.options.delay );
					break;
			}
		});
	}

});
});

jsb_main = {
	regexes: [],
	skip_regexes: {},
	textbox: null,
	dialog: null,
	lines: ['<div id="riwt_dialog" style="font-size:2em;">'],
	build_regexes: function(event, data) {
		var t = $('#wpTextbox1');
		this.textbox = t.length ? t[0] : null;
		if (!this.textbox || this.textbox.value.length == 0 || /{{ללא_בוט}}/.test(this.textbox.value))
			return;
		if (data) {
			this.progress(0, '  בוצע!');
//			var replace = $(data.parse.text['*']);
			var replace = $(data);
			var trs = replace.find('tr');
			var decoder = $('<div/>');
			for (var i = 0; i < trs.length; i++) {
				this.progress(1, i);
				var tds = $(trs[i]).find('td');
				if (tds.length > 4) {
					try {
						var regex = new RegExp(decoder.html(tds[1].innerHTML).text(), 'gi');
						this.regexes.push([regex, decoder.html(tds[2].innerHTML).text()]);
					} catch(ex) {
						this.regexes.push('');
						this.skip_regexes[i+1] = true;
					}
				}
			}
			this.process_page();
		}
		else {
			this.progress(0, '');
			/*
			$.getJSON(wgServer + wgScriptPath + '/api.php?', 
					{action: 'parse', page: 'ויקיפדיה:בוט/בוט החלפות/רשימת החלפות נוכחית', format: 'json', prop: 'text'}, 
					function(data){
						jsb_main.build_regexes(null, data)
					});
					*/
			$.ajax({
				url: wgServer + wgScriptPath + '/index.php?title=ויקיפדיה:בוט/בוט החלפות/רשימת החלפות נוכחית',
				context: document.body,
				success: function(data, status, jqhxr){
					jsb_main.build_regexes(null, data);
				}
			});
		}
	},
	
	progress: function(line_no, content) {
		if (this.dialog == null) {
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
		}
		var deflines = ['קורא את רשימת ההחלפות. אנא נא להמתין.', 'מעבד החלפה #', 'מבצע החלפה #'];
		this.lines[line_no] = deflines[line_no] + (content || '');
		this.dialog.html(this.lines.join('<br />' + '</div>'));
	},

	process_page: function() {
		var t = this.textbox.value;
		var skipmatch = t.match(/{{ללא_בוט\|(\d+)}}/g);
		if (skipmatch)
			for (var i = 1; i < skipmatch.length; i++)
				this.skip_regexes[parseInt(skipmatch[i], 10)] = true;
		for (var i = 0; i < this.regexes.length; i++) {
			this.progress(2, i + '/' + this.regexes.length);
			if (!this.skip_regexes[i+1])
				t = t.replace(this.regexes[i][0], this.regexes[i][1]);
		}
		this.textbox.value = t;
		this.dialog.append($('<p>').append($('<input>', {type: 'button', value: 'סגור'}).click(
			function() { 
				$(jsb_main.dialog).dialog('close');
				document.body.style.cursor = '';
			})));
	},
	
	init: function() {
		$('#ca-edit').after($('<li>').append($('<span>').append($('<a>', {href: '#', text: 'בוט החלפות'}).click(function(){jsb_main.build_regexes();}))));
	}
}

if (getParamValue('action') == 'edit') 
	$(document).ready(jsb_main.init);
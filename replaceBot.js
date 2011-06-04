jsb_main = {
	regexes: [],
	skip_regexes: {},
	badlines: [],
	textbox: null,
	build_regexes: function(event, data) {
		var t = $('#wpTextbox1');
		this.textbox = t.length ? t[0] : null;
		if (!this.textbox || this.textbox.value.length == 0 || /{{ללא_בוט}}/.test(this.textbox.value))
			return;
		if (data) {
			var lines = data.split(/\n/);
			while (lines.length) {
				var line = lines.shift();
				var matches = line.match(/^\|(\d+)/);
				if (matches) {
					var num = parseInt(matches[1], 10);
					line = lines.shift();
					line = line.replace(/<\/?nowiki>/g, '');
					if (! line || ! line.length || line.substring(0,1) != '|')
						continue;
					line = line.substring(1).replace(/<\/?nowiki>/g, '');
					try {
						var regex = new RegExp(line);
					} catch(e) {
						this.badlines.push([num, line]);
						continue;
					}
					line = lines.shift();
					if (! line || ! line.length || line.substring(0,1) != '|')
						continue;
					line = line.substring(1).replace(/<\/?nowiki>/g, '');
					this.regexes[num] = [regex, line];
				}
			}
			this.process_page();
		}
		else 
			$.ajax({
				url: wgServer + wgScriptPath + '/index.php?title=ויקיפדיה:בוט/בוט החלפות/רשימת החלפות נוכחית&action=raw&ctype=text/x-wiki',
				context: document.body,
				success: function(data, status, jqhxr){
					jsb_main.build_regexes(null, data);
				}
			});
	},
	
	process_page: function() {
		var t = this.textbox.value;
		var skipmatch = t.match(/{{ללא_בוט\|(\d+)}}/g);
		if (skipmatch)
			for (var i = 1; i < skipmatch.length; i++)
				this.skip_regexes[parseInt(skipmatch[i], 10)] = true;
		for (var i in this.regexes) 
			if (!this.skip_regexes[i])
				t = t.replace(this.regexes[i][0], this.regexes[i][1]);
		this.textbox.value = t;
		alert('סקריפט בוט החלפות סיים לרוץ. אנא בצעו "הצגת שינויים" לפני שמירה, כדי לוודא שהסקריפט לא גרם נזק');
	},
	
	init: function() {
		$('#ca-edit').after($('<li>').append($('<span>').append($('<a>', {href: '#', text: 'בוט החלפות'}).click(function(){jsb_main.build_regexes();}))));
	}
}

if ($.inArray(getParamValue('action'), ['edit', 'submit']) + 1) 
	$(document).ready(jsb_main.init);
jsb_main = {
	regexes: [],
	skip_regexes: {},
	badlines: [],
	textbox: null,
	build_regexes: function(event, data) {
		this.start = new Date();
		var t = $('#wpTextbox1');
		this.textbox = t.length ? t[0] : null;
		if (!this.textbox || this.textbox.value.length == 0 || /{{ללא_בוט}}/.test(this.textbox.value))
			return;
		if (data) {
			var lines = data.split(/\n/);
			var clear_nowiki = /\|<nowiki>(.*)<\/nowiki>/;
			var matches;
			while (lines.length) {
				if (! (matches = lines.shift().match(/^\|(\d+)/)))
					continue;
				var num = parseInt(matches[1], 10);
				if (! (matches = lines.shift().match(clear_nowiki)))
					continue;
				try {
					var regex = new RegExp(matches[1], 'g');
				} catch(e) {
					this.badlines.push(num);
					continue;
				}
				if (! (matches = lines.shift().match(clear_nowiki)))
					continue;
				this.regexes[num] = [regex, matches[1]];
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
		var skipmatch = t.match(/{{ללא[_ ]בוט\|\s*(\d+)\s*}}/g);
		if (skipmatch) 
			for (var i in skipmatch) {
				var matches = skipmatch[i].match(/{{ללא[_ ]בוט\|\s*(\d+)\s*}}/);
				this.skip_regexes[parseInt(matches[1], 10)] = true;
			}
		for (var i in this.regexes) 
			if (!this.skip_regexes[i])
				t = t.replace(this.regexes[i][0], this.regexes[i][1]);
		this.textbox.value = t;
		alert('סקריפט בוט החלפות סיים לרוץ. אנא בצעו "הצגת שינויים" לפני שמירה, כדי לוודא שהסקריפט לא גרם נזק.' + '\n' + 'ההרצה לקחה ' + (new Date() - this.start) + ' מילישניות.');
	},
	
	init: function() {
		$('#ca-edit').after($('<li>').append($('<span>').append($('<a>', {href: '#', text: 'בוט החלפות'}).click(function(){jsb_main.build_regexes();}))));
	}
}

if ($.inArray(getParamValue('action'), ['edit', 'submit']) + 1) 
	$(document).ready(jsb_main.init);
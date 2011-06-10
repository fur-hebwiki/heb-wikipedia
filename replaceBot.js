jsb_main = {
	regexes: [],
	badlines: [],
	textbox: null,
	build_regexes: function(event, data) {
		this.start = new Date();
		var t = $('#wpTextbox1');
		this.textbox = t.length ? t[0] : null;
		if (!this.textbox || this.textbox.value.length == 0 || /\{\{\s*ללא_בוט\s*\}\}/.test(this.textbox.value)) {
			alert('הדף מכיל תבנית "ללא בוט" ולכן לא יבוצעו החלפות');
			return;
		}
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
				url: wgServer + wgScriptPath + '/index.php?title=%D7%95%D7%99%D7%A7%D7%99%D7%A4%D7%93%D7%99%D7%94:%D7%91%D7%95%D7%98/%D7%91%D7%95%D7%98_%D7%94%D7%97%D7%9C%D7%A4%D7%95%D7%AA/%D7%A8%D7%A9%D7%99%D7%9E%D7%AA_%D7%94%D7%97%D7%9C%D7%A4%D7%95%D7%AA_%D7%A0%D7%95%D7%9B%D7%97%D7%99%D7%AA&action=raw&ctype=text/x-wiki',
						// above is: "ויקיפדיה:בוט/בוט_החלפות/רשימת_החלפות_נוכחית"
						// which all browsers except IE can work with.
				success: function(data, status){
					jsb_main.build_regexes(null, data);
				}
			});
	},
	
	process_page: function() {
		var t = this.textbox.value,
			skip_dict = {},
			skip_ar = [],
			actual_replaced = [],
			skipmatch = t.match(/{{ללא[_ ]בוט\|\s*(\d+)\s*}}/g);
		if (skipmatch) 
			for (var i = 0; i < skipmatch.length; i++) {
				var matches = skipmatch[i].match(/{{ללא[_ ]בוט\|\s*(\d+)\s*}}/);
				skip_dict[parseInt(matches[1], 10)] = true;
				skip_ar.push(matches[1]);
			}
		for (var i in this.regexes) 
			if (! skip_dict[i] && ! isNaN(i))
				if (this.regexes[i][0].test(t)) {
					actual_replaced.push(i);
					t = t.replace(this.regexes[i][0], this.regexes[i][1]);
				}
		this.textbox.value = t;
		var msg = ['‏ריצת הסקריפט הסתיימה. אנא בצעו "הצגת שינויים" לפני שמירה, כדי לוודא שהסקריפט לא גרם נזק.‏'];
		if (skip_ar.length)
			msg.push('‏החלפות שלא התבצעו בגלל תבנית "ללא בוט": ‏' + skip_ar.join(', '));
		if (this.badlines.length)
			msg.push('‏החלפות שלא התבצעו בגלל בעיה בקוד:‏ ' + this.badlines.join(', ‏'));
		msg.push('');
		msg.push(actual_replaced.length 
			? '‏התבצעו ההחלפות הבאות: ‏' + actual_replaced.join('‏ ,‏')
			: '‏לא התבצעו החלפות - הדף "נקי".‏');
		msg.push('‏הריצה ארכה ' + (new Date() - this.start) + ' מילישניות.‏');
		alert(msg.join('\n'));
		if (actual_replaced.length && $('#wpSummary').val() == '')
			$('#wpSummary').val('סקריפט החלפות - (' + actual_replaced.join('‏ ,‏') + ') ');
	},
	
	init: function() {
		$('#ca-edit').after($('<li>').append($('<span>').append($('<a>', {href: '#', text: 'בוט החלפות'}).click(function(){jsb_main.build_regexes();}))));
	}
}

if ($.inArray(getParamValue('action'), ['edit', 'submit']) + 1) 
	$(document).ready(jsb_main.init);
jsb_main = {
	regexes: [],
	skip_regexes: {},
	textbox: null,
	build_regexes: function(event, data) {
		var t = $('#wpTextbox1');
		this.textbox = t.length ? t[0] : null;
		if (!this.textbox || this.textbox.value.length == 0 || /{{ללא_בוט}}/.test(this.textbox.value))
			return;
		if (data) {
			var replace = $(data);
			var trs = replace.find('tr');
			var decoder = $('<div/>');
			for (var i = 0; i < trs.length; i++) {
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
		else 
			$.ajax({
				url: wgServer + wgScriptPath + '/index.php?title=ויקיפדיה:בוט/בוט החלפות/רשימת החלפות נוכחית',
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
		for (var i = 0; i < this.regexes.length; i++) 
			if (!this.skip_regexes[i+1])
				t = t.replace(this.regexes[i][0], this.regexes[i][1]);
		this.textbox.value = t;
	},
	
	init: function() {
		$('#ca-edit').after($('<li>').append($('<span>').append($('<a>', {href: '#', text: 'בוט החלפות'}).click(function(){jsb_main.build_regexes();}))));
	}
}

if ($.inArray(getParamValue('action'), ['edit', 'submit']) + 1) 
	$(document).ready(jsb_main.init);
if ($.inArray(mw.util.getParamValue('action'), ['edit', 'submit']) + 1)
$(document).ready(function() {mw.loader.using(['jquery.textSelection'], function() {
	function doit() {
		var selection = $("#wpTextbox1").textSelection('getSelection');
		var hes = ["qwertyuiop[asdfghjkl;'zxcvbnm,./", "/'קראטוןםפ]שדגכעיחלךף,זסבהנמצתץ."];
		var alt = '';
		var isEng = /[a-z]/.test(selection);
		for (var i = 0; i < selection.length; i++) {
			var c = selection[i];
			if (isEng && hes[0].indexOf(c) + 1)
				c = hes[1][hes[0].indexOf(c)];
			else if (!isEng && hes[1].indexOf(c) + 1)
				c = hes[0][hes[1].indexOf(c)];
			alt += c;
		}
		$("#wpTextbox1").textSelection('encapsulateSelection', {replace: true, peri: alt});
	}
	
	
	/*
	$('#p-views > ul').append($('<li>', {id: 'ca-hebeng'}).append($('<span>').append(
		$('<a>', {href: '#', title: 'Englishעברית'}).text('hebeng').click(doit)
	)));
	*/									  
	var buttonImage = '//upload.wikimedia.org/wikipedia/he/math/2/7/7/2778f20ac96041b97ed7050a7b3ff756.png';
	setTimeout(function() {
	if (typeof $.wikiEditor != 'undefined')
		$('#wpTextbox1').wikiEditor('addToToolbar', {
			section: 'advanced',
			group: 'more',
			tools: {
				'hebeng': {
					label: 'שיכול מקלדת',
					type: 'button',
					icon: buttonImage,
					
					action: {type: 'callback', execute: doit}
				}
			}
		});
	}, 100);
	$(document).keydown(function(e) {if (e.altKey && e.shiftKey && e.keyCode == 85) doit();});
});	
});	
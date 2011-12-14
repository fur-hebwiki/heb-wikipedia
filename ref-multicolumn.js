$(document).ready(function() {mw.loader.using('jquery.ui.slider', function() {
	var current = $.cookie("ref-col-setting") || '',
		sliderNum = 0,
		pairs = [
			{className: 'refDisplayRows', label: 'הצגה בטורים', nomsie: true},
			{className: 'refDisplayScroll', label: 'תיבת גלילה'},
			{className: 'refDisplayHide', label: 'הסתר'}
		];

	function makeCheckbox(ol, className, label) {
		var checkBox = $('<input>', {type: 'checkbox'})
			.prop('checked', current.indexOf(className) >= 0)
			.click(function() {
				ol.toggleClass(className, $(this).prop('checked'));
				$.cookie("ref-col-setting", ol.attr('class'), {'expires':30,'path':'/'});
			});
		return $('<span>')
			.append('&nbsp;&nbsp;' + label)
			.append(checkBox);
	}
	
	function makeSlider(ol) {
		var slider = $('<div>', {id: 'slider_' + sliderNum++})
		.css({fontSize: '130%', width: '100px'})
		.slider({
			width: '100px',
			max: 150,
			min: 40,
			value: $.cookie("ref-col-font-size") || 80,
			stop: function() {
				var value = parseInt($(this).slider('value'), 10);
				if (isNaN(value))
					value = 80;
				if (value < 40)
					value = 40;
				if (value > 150)
					value = 150;
				ol.css({fontSize: value + '%'});
				$.cookie("ref-col-font-size", value, {'expires':30,'path':'/'});
			}
		});
		return $('<div>').text(' גודל הטקסט ').css({float: 'left'}).append(slider);
	}
	
	function makeCheckBoxes(ol) {
		var span = $('<span>').css({fontSize: '50%'});
		for (var i in pairs)
			if ($.browser.msie && pairs[i].nomsie)
				continue;
			else
				span.append(makeCheckbox(ol, pairs[i].className, pairs[i].label));
		span.append(makeSlider(ol));
		return span;
	}
	
	// create the classes to be used
	$('<style>', {type: 'text/css'})
		.html(
			 'ol.refDisplayRows{-webkit-column-width:32em;-moz-column-width:32em;column-width:32em;}\n' + 
			 'ol.refDisplayScroll{max-height: 20em; overflow: auto; margin:0;}\n' + 
			 'ol.refDisplayScroll li, ol.refDisplayRows li {margin-right: 3em;margin-left:2em}\n' +
			 'ol.refDisplayHide{display: none}\n')
		 .appendTo('head');
	// create the controls
	$('ol.references').each(function() {
		var ol = $(this).addClass(current);
		// be very strict: only if we find a "h2" element whose text includes "הערות שוליים"
		var h2 = ol.parent().prev('h2').filter(function() {return $(this).text().indexOf('הערות שוליים') >= 0;});
		if (h2.length == 0) // can't find header?
			return;
		h2.append(makeCheckBoxes(ol));
	});

	
});});

// gadget to control the display of reference section. rows, scroll, hide, and text-size
// depends on 3 classes from common.css: ol.refDisplayRows, ol.refDisplayScroll, ol.refDisplayHide.
// if classes are removed from common.js, need to add them in gadget.
$(document).ready(function() {mw.loader.using('jquery.ui.slider', function() {
	var current = $.cookie("ref-col-setting") || '',
		pairs = [
			{className: 'refDisplayRows', label: 'הצגה בטורים', skip: $.browser.msie},
			{className: 'refDisplayScroll', label: 'תיבת גלילה'},
			{className: 'refDisplayHide', label: 'הסתר'}
		];

	function makeCheckbox(ol, className, label) {
		var already = ol.closest('.' + className).length;
		var checkBox = $('<input>', {type: 'checkbox'})
			.prop({'checked': already || (current.indexOf(className) >= 0), disabled: already})
			.click(function() {
				ol.toggleClass(className, $(this).prop('checked'));
				$.cookie("ref-col-setting", ol.attr('class'), {'expires':30,'path':'/'});
			});
		return $('<span>')
			.append('&nbsp;&nbsp;' + label)
			.append(checkBox);
	}
	
	function makeSlider(ol) {
		var value = $.cookie("ref-font-size") || 80;
		ol.css({fontSize: value + '%'});
		var slider = $('<div>')
		.css({fontSize: '130%', width: '140px'})
		.slider({
			max: 150,
			min: 50,
			value: value,
			stop: function() {
				var value = parseInt($(this).slider('value'), 10);
				value = value < 40 ? 40 : (value > 150 ? 150 : value);
				ol.css({fontSize: value + '%'});
				$.cookie("ref-font-size", value, {'expires':30,'path':'/'});
			}
		});
		return $('<div>').css({textAlign:'center'}).text('גודל הטקסט').css({float: 'left'}).append(slider);
	}
	
	function makeCheckBoxes(ol) {
		var span = $('<span>').css({fontSize: '50%'});
		for (var i in pairs)
			if (! pairs[i].skip)
				span.append(makeCheckbox(ol, pairs[i].className, pairs[i].label));
		span.append(makeSlider(ol));
		return span;
	}
	
	// create the controls
	$('ol.references').each(function() {
		var ol = $(this);
		if (ol.find('li').length < 10)
			return;
		ol.addClass(current);
		// be very strict: only if we find a "h2" element whose text includes "הערות שוליים"
		var h2 = ol.parent().prev('h2').filter(function() {return $(this).text().indexOf('הערות שוליים') >= 0;});
		h2.append(makeCheckBoxes(ol));
	});
	
});});

function mah_init() {

	function clearCanvas(area) {
		var context = area.canvasContext;
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	}

	function drawMarker(areas) {

		function drawPoly(context, coords) {
			context.beginPath();
			context.moveTo(coords.shift(), coords.shift());
			while (coords.length)
				context.lineTo(coords.shift(), coords.shift());
			context.closePath();
			context.stroke();
			context.fill();
		}

		function drawRect(context, co) {
			context.strokeRect(co[0],co[1],co[2]-co[0],co[3]-co[1]);
			context.fillRect(co[0],co[1],co[2]-co[0],co[3]-co[1]);
		}

		function drawCircle(context, coords) {
			context.beginPath();
			context.arc(coords[0],coords[1],coords[2],0,Math.PI*2,true);
			context.closePath();
			context.stroke();
			context.fill();
		}

		for (var i in areas) {
			var area = areas[i];
			var context = area.canvasContext;
			var coords = area.coords.split(',');
			$.extend(context, {fillStyle: 'rgba(0,0,0,0.2)', strokeStyle: 'yellow', lineJoin: 'round', lineWidth: 2});
			switch (area.shape) {
				case 'rect': drawRect(context, coords); break;
				case 'circle': drawCircle(context, coords); break;
				case 'poly': drawPoly(context, coords); break;
			}
		}
	}

	var canCanvas = $('<canvas>')[0].getContext;

	function backtonormal() {
		$(this).css({background: ''});
		if (canCanvas)
			clearCanvas(this.areas[0]);
	}

	function highlight() {
		$(this).css({background: 'yellow'});
		if (canCanvas)
			drawMarker(this.areas);
	}

	var myClassName = 'mah_artefact';
	$('.' + myClassName).remove();
	$(".imagetest").find('img').each(function() {
		var img = $(this);
		if (!img.parent().find('area').length)
			return;
		var context = null;
		if (canCanvas) {
			img.fadeTo(1, 0);
			var dims = {position: 'absolute', width: img.width() + 'px', height: img.height() + 'px', top: img.position().top + 'px', left: img.position().left + 'px', border: 0}
			var bgimg = $('<img>', {class: myClassName, src: img.attr('src')}).css(dims);
			var jcanvas = $('<canvas>', {class: myClassName}).css(dims).attr({width: img.width(), height: img.height()});
			img.before(bgimg).before(jcanvas);
			context = jcanvas[0].getContext("2d");
		}
		var ol = $('<ol>', {class: myClassName}).css({clear: 'both', marginTop: '1.5em', width: img.width()});
		img.after($('<hr>', {class: myClassName}).css('clear', 'both')).after(ol);
		var lis = {};
		img.parent().find('area').each(function() {
			var li = lis[this.title];
			if (!li) {
				lis[this.title] = li = $('<li>', {class: myClassName})
					.css({float: 'right', marginLeft: '2em', marginRight: '1em', whiteSpace: 'nowrap'})
					.append($('<a>', {href: this.href, text: this.title}))
					.mouseover(highlight)
					.mouseout(backtonormal);
				$.extend(li[0], {areas: [], highlight: highlight, backtonormal: backtonormal});
				ol.append(li);
			}
			li[0].areas.push(this);
			$.extend(this, {li: li[0], canvasContext: context});
			$(this).unbind('mouseover').unbind('mouseout')
				.mouseover(function() {this.li.highlight();})
				.mouseout(function(){this.li.backtonormal();});
		});
	});
}

addOnloadHook(mah_init);
$(window).resize(mah_init);
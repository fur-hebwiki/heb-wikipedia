$(document).ready(function() {

	var 
//add this class to all elements created by the script. the reason is that we call the script again on
//window resize, and use the class to remove all the "artefacts" we created in the previous run.
		myClassName = 'imageMapHighlighterArtefacts',
// "2d context" attributes used for highlighting.
		areaHighLighting = {fillStyle: 'rgba(0,0,0,0.3)', strokeStyle: 'yellow', lineJoin: 'round', lineWidth: 1.5},
// css for a li element
		liElementCss = {whiteSpace: 'nowrap'},
//css for highlighting a "li" element
		liHighlighting = {background: 'yellow'},
//css for un-highlighting li element:
		liBackToNormal = {background: ''},
//every imagemap that wants highlighting, should reside in a div of this 'class':
		hilightDivMarker = '.imageMapHighlighter';

	function drawMarker(context, areas) { // this is where the magic is done.
	
		function drawPoly(coords) {
			context.moveTo(coords.shift(), coords.shift());
			while (coords.length)
				context.lineTo(coords.shift(), coords.shift());
		}
		
		for (var i in areas) {
			var coords = areas[i].coords.split(',');
			context.beginPath();
			switch (areas[i].shape) {
				case 'rect': drawPoly([coords[0], coords[1], coords[0], coords[3], coords[2], coords[3], coords[2], coords[1]]); break;
				case 'circle': context.arc(coords[0],coords[1],coords[2],0,Math.PI*2);  break;//x,y,r,startAngle,endAngle
				case 'poly': drawPoly(coords); break;
			}
			context.closePath();
			context.stroke();
			context.fill();
		}
	}

	function backtonormal() {
		var $this = $(this),
			context = $this.data('context');
		$this.css(liBackToNormal);
		if (context)
			context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	}

	function highlight() {
		var $this = $(this);
		$this.css(liHighlighting);
		drawMarker($this.data('context'), $this.data('areas'));
	}

	function mah_init() {
		//making the li element "float" makes the list not 'columninzed'.
		if ($('body').is('.rtl'))
			$.extend(liElementCss, {float: 'right', marginLeft: '3em'});
		else
			$.extend(liElementCss, {float: 'left', marginRight: '3em'});
		$('.' + myClassName).remove(); //remove artefacts (if any) from previous run.
		$(hilightDivMarker).find('img').each(function() {
			var img = $(this);
			if (!img.parent().find('area').length)
				return;	//not an imagemap. inside "each" anonymous function, 'return' means "continue".
			img.fadeTo(1, 0);	//make the image transparent - it is still imagemap, but we see bgimg through it.
			var dims = {position: 'absolute', width: img.width() + 'px', height: img.height() + 'px',
						top: img.position().top + 'px', left: img.position().left + 'px', border: 0};
			var bgimg = $('<img>', {'class': myClassName, src: img.attr('src')}).css(dims);//completely inert image. this is what we see.
			var jcanvas = $('<canvas>', {'class': myClassName}).css(dims).attr({width: img.width(), height: img.height()});
			var context = $.extend(jcanvas[0].getContext("2d"), areaHighLighting);
			
			img.before(bgimg).before(jcanvas);	//both canvas and bgimage are behind the transparent image/imagemap
			var ol = $('<ol>', {'class': myClassName}).css({clear: 'both', marginTop: '1.5em'});
			img.after($('<hr>', {'class': myClassName}).css('clear', 'both')).after(ol); //ol below image, hr below ol. for thumbs, the caption appears below the hr.
			var lis = {};	//collapse areas with same caption to one list item
			img.parent().find('area').each(function() {
				var li = lis[this.title];	//saw it previously? use the same li
				if (!li) {	//no? create a new one.
					lis[this.title] = li = $('<li>', {'class': myClassName})
						.css(liElementCss)
						.append($('<a>', {href: this.href, text: this.title})) //put <a> with link and caption inside it
						.mouseover(highlight)
						.mouseout(backtonormal)
						.data({areas: [], context: context});
					ol.append(li);
				}
				li.data('areas').push(this);	//add the area to the li
				$(this).unbind('mouseover')
					.unbind('mouseout')	//clean junk from previous runs
					.mouseover(function() {li.trigger('mouseover');})
					.mouseout(function() {li.trigger('mouseout');});
			});
		});
	}

	if ($(hilightDivMarker).length && $('<canvas>')[0].getContext) { //canvas-capable browser.
		mah_init();
		$('.a_toggle').live('click', mah_init);
		$(window).resize(mah_init);
	}	
});
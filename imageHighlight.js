function mah_init() {
	
	function clearCanvas(area) {
		var context = area.canvasContext;
		context.clearRect(0,0,context.canvas.width, context.canvas.height);
	}

	function drawMarker(areas) {
		var context;
		var coords;
		
		function drawPoly() {
			context.beginPath();
			context.moveTo(coords.shift(), coords.shift());
			while (coords.length) 
				context.lineTo(coords.shift(), coords.shift());
			context.closePath();
			context.stroke();
			context.fill();
		}
		
		function drawRect() {
			context.strokeRect(coords[0],coords[1],coords[2]-coords[0],coords[3]-coords[1]);
			context.fillRect(coords[0],coords[1],coords[2]-coords[0],coords[3]-coords[1]);
		}
		
		function drawCircle() {
			context.beginPath();
			context.arc(coords[0],coords[1],coords[2],0,Math.PI*2,true);
			context.closePath();
			context.stroke();
			context.fill();
		}
		
		for (var i in areas) {
			var area = areas[i];
			context = area.canvasContext;
			coords = area.coords.split(',');
			context.fillStyle = 'rgba(0,0,0,0.4)';
			context.strokeStyle = 'yellow';
			context.lineJoin = 'round';
			context.lineWidth = 6;
			switch (area.shape) {
				case 'rect': drawRect(); break;
				case 'circle': drawCircle(); break;
				case 'poly': drawPoly(); break;
			}
		}
	}
	var myClassName = 'mah_artefact';
	var artefacts = $('.' + myClassName);
	for (var i = 0; i < artefacts.length; i++)
		$(artefacts[i]).remove();
	var imgs = $(".imagetest").find('img');
	for (var imgnum = 0; imgnum < imgs.length; imgnum++) {
		img = $(imgs[imgnum]);
		parent = img.parent();
		var areas = parent.find('area');
		if (!areas.length)
			continue;
		parent.css('zIndex', 10);
		var bgimg = $('<img>');
		bgimg.toggleClass(myClassName);
		var width = img.width(), height = img.height();
		var dims = {position: 'absolute', width: width + 'px', height: height + 'px', top: img.position().top + 'px', left: img.position().left + 'px', border: 0}
		bgimg.css(dims);
		bgimg.attr('src', img.attr('src'));
		img.before(bgimg);
		img.fadeTo(5, 0.4);
		var jcanvas = $('<canvas>');
		jcanvas.toggleClass(myClassName);
		jcanvas.css(dims);
		img.before(jcanvas);
		var canvas = jcanvas[0];
		canvas.height = height; canvas.width = width;
		var context = canvas.getContext("2d");
		var ol = $('<ol>');
		ol.toggleClass(myClassName);
		ol.css({clear: 'both'});
		parent.after(ol);
		var div = $('<div class="' + myClassName + '">'); div.css('clear', 'both');
		ol.after(div);
		div.after('<hr class="' + myClassName + '">');
		
		var areas = parent.find('area');
		var lis = {};
		var highlightList = {background: 'yellow'}, clearList = {background: ''};
		for (var i = 0; i < areas.length; i++) {
			var area = areas[i];
			var li = lis[area.title];
			if (!li) {
				lis[area.title] = li = $('<li>');
				li.css({float: 'right', marginLeft: '2em', marginRight: '1em', whiteSpace: 'nowrap'});
				li[0].areas = [];
				li.html('<a href="'+areas[i].href+'">' + areas[i].title + '</a>');
				ol.append(li);
			}
			li[0]['areas'].push(areas[i]);
			$.extend(area, {li: li, canvasContext: context});
			$(area).mouseover(function() {
				drawMarker([this]);
				this.li.css(highlightList);
			});
			$(area).mouseout(function() { clearCanvas(this); this.li.css(clearList)});
			li.mouseover(function() {$(this).css(highlightList); drawMarker(this.areas);});
			li.mouseout(function() {$(this).css(clearList); clearCanvas(this.areas[0]);});
		}
	}
}

addOnloadHook(mah_init);
$(window).resize(mah_init);
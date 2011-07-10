function clearCanvas(area) {
	var context = area.canvasContext;
	context.clearRect(0,0,context.canvas.width, context.canvas.height);
}

function drawMarker(area) {
	var context = area.canvasContext;
	var coords = area.coords.split(',');
	
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
	
	context.fillStyle = 'rgba(0,0,0,0.4)';
	context.strokeStyle = 'yellow';
	context.lineWidth = 6;
	switch (area.shape) {
		case 'rect': drawRect(); break;
		case 'circle': drawCircle(); break;
		case 'poly': drawPoly(); break;
	}
	
	//alert(area.shape + '\n' + area.coords + '\n' + area.title);
}

function mah_init() {
	var imgs = $(".img_toggle").find('img');
	for (var imgnum = 0; imgnum < imgs.length; imgnum++) {
		img = $(imgs[imgnum]);
		parent = img.parent();
		var bgimg = $('<img>');
		var width = img.width(), height = img.height();
		var dims = {position: 'absolute', width: width + 'px', height: height + 'px', top: img.position().top + 'px', left: img.position().left + 'px', border: 0}
		bgimg.css(dims);
		bgimg.attr('src', img.attr('src'));
		parent.css('zIndex', 10);
		img.before(bgimg);
		img.fadeTo(5, 0.4);
		var jcanvas = $('<canvas>');
		jcanvas.css(dims);
		img.before(jcanvas);
		var canvas = jcanvas[0];
		var context = canvas.getContext("2d");
		var ol = $('<ol>');
		ol.css('margin', '30px');
		parent.after(ol);
		var areas = parent.find('area');
		for (var i = 0; i < areas.length; i++) {
			var li = $('<li>');
			li[0]['area'] = areas[i]
			$.extend(areas[i], {li: li, canvasContext: context});
			li.html('<a href="'+areas[i].href+'">' + areas[i].title + '</a>');
			ol.append(li);
			$(areas[i]).mouseover(function() {
				drawMarker(this);
				this.li.css('background', 'pink');
			});
			$(areas[i]).mouseout(function() { clearCanvas(this); this.li.css('background', '')});
			li.mouseover(function() {$(this).css('background', 'pink'); drawMarker(this.area);});
			li.mouseout(function() {$(this).css('background', ''); clearCanvas(this.area);});
		}
	}
}



addOnloadHook(mah_init);
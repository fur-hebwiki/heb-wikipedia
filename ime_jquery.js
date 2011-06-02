/*
	Copyright (c) 2007-2011 Peter Schlömer

	Released under the following licenses (to make reuse in other Wikis
	easier):

	GNU General Public License (GPL), version 2
	GNU Free Documentatin Licence (GFDL), version 1.2 or later
	Creative Commons Attribution ShareAlike (CC-by-sa), version 2 or later
*/

/*
	Constants
*/

var IME_JQUERY = 'http://toolserver.org/~dapete/ime/jquery-1.5.2.min.js';
var IME_TEMPLATE = 'http://toolserver.org/~dapete/ime/template.php';
var IME_TRANSLATIONS = 'http://toolserver.org/~dapete/ime/translations_jquery.php?lang=' + wgUserLanguage;

// Scripts to create the circle and polygon images
var IME_CIRCLESCRIPT = 'http://toolserver.org/~dapete/ime/circle.php';
var IME_POLYSCRIPT = 'http://toolserver.org/~dapete/ime/poly.php';

/*
	Imports
*/

// If jquery is not available, load our own version
if (!jQuery) {
	importScriptURI(IME_JQUERY);
}

// Load HTML form code for ImageMapEdit
importScriptURI(IME_TEMPLATE);

// Default error message, will be overwritten if translation is loaded
var ime_translations = new Array();
ime_translations['error_imagenotfound'] = 'ImageMapEdit: Could not find image in page structure.';
// Container for translations
// Load translations
importScriptURI(IME_TRANSLATIONS);

/*
	Global variables
*/
var ime_areas = Array();
var ime_currentlyEditing = -1;
var ime_width;
var ime_height;
var ime_scale;

/*
	Start Initialization if this is an image page and there actually is an image
*/
if (wgNamespaceNumber==6 && wgAction=='view') 
	$(document).ready(function(){ 
		if (document.getElementById('file')) // Determine whether we are on an image page. Namespace must be 6 and action view
			ime_init1();
	});

/*
	Create a new div element object with an id.
*/
function ime_htmlNewDiv(id) {
	var div = document.createElement('div');
	if (id) div.id = id;
	return div;
}

function ime_extend(target, source) {
	$.extend(target, source);
	return target;
}
/*
	Initialization, part 1: Tries to find image and uses a XMLHttpRequest
	to download information about the image. When this is done (it's an
	asynchronous request) show a link to load the rest of ImageMapEdit
	using ime_init2().
*/
function ime_init1() {
	var divFile = document.getElementById('file');
	if (!divFile) 
		return ime_error(ime_translations['error_imagenotfound'] + ' (ime_init1,divFile=null)');

	var a = ime_findATag(divFile);
	if (!a) 
		return ime_error(ime_translations['error_imagenotfound'] + ' (ime_init1,a=null)');

	var img = a.firstChild;
	if (!img) 
		return ime_error(ime_translations['error_imagenotfound'] + ' (ime_init1,img=null)');
		
	var url = wgScriptPath + '/api.php?format=json&action=query&prop=imageinfo&iiprop=size&titles=' + wgPageName;

	$.get(url, function(data) {
		if (data && data.query && data.query.pages) 
			for (var pageid in data.query.pages) {
				var page = data.query.pages[pageid], size = page.imageinfo[0];
				ime_width = size.width;
				ime_height = size.height;

				ime_scale = img.width/ime_width;

				// Show 'show ImageMapEdit' button now
				var a = ime_extend(document.createElement('a'), {id: 'imeLink', href: 'javascript:ime_init2()'});
				a.style.display = 'block';
				a.appendChild(document.createTextNode('ImageMapEdit >'));
				document.getElementById('file').appendChild(a);
				return;
		}
	});
}

/*
	Initialization, part 2: Triggered by an external link. Does some moving
	around of the image in the logical structure of the page, then hides the
	link and finally puts the HTML code in place.
*/
function ime_init2() {

	// Remove UI that might interfere with this code
	ime_removeOtherUIElements();

	var divFile = document.getElementById('file');
	var tempNode = divFile.firstChild;
	var a = ime_findATag(tempNode);
	var img = a.firstChild;

	var divImeContainer = ime_htmlNewDiv('imeContainer');
	divImeContainer.style.position = 'relative';

	// Move image from within link to outside
	a.removeChild(img);
	divFile.insertBefore(divImeContainer,tempNode);
	divFile.removeChild(tempNode);
	// Fix for rtl wikis, thanks to hewiki user "קיפוד� חש"
	divImeContainer.style.direction = 'ltr';

	img.id = 'imeImg';
	ime_extend(img.style, {zIndex: 99, border: 'none', opacity: '0.75', filter: 'alpha(opacity=75)'/*IE*/});

	// Internet Explorer needs this differently
	divImeContainer.style.overflow = typeof(navigator.userAgent) != 'undefined' && navigator.userAgent.match('/MSIE/') 
		? 'none'
		: 'auto';

	var divImePreview = ime_htmlNewDiv('imePreview');
	ime_extend(divImePreview.style,
		{position: 'absolute', top: '0', left: 0, width: img.width + 'px', height: img.height + 'px', zIndex: 0});

	divImeContainer.appendChild(divImePreview);
	divImeContainer.appendChild(img);

	var divIme = ime_htmlNewDiv('ime');
	divFile.appendChild(divIme);

	// Hide the link now
	document.getElementById('imeLink').style.display = 'none';

	// Disable image context menu so right click can be used for events
	img.oncontextmenu = ime_eventDummy;


	divIme.innerHTML = ime_templateHtml;

	// Translate texts
	ime_translate();
}

/*
	Translate the user interface to the specified language.
*/
function ime_translate() {
	if (ime_translations) 
		for (var i in ime_translations) {
			var elements = ime_getElementsByClassName('ime_t_' + i);
			for (var j=0; j<elements.length; j++) 
				elements[j].innerHTML = ime_translations[i];
		}
}

/*
	Finds all elements in the current document with the specified class.
*/
function ime_getElementsByClassName(className) {
	// Hopefully the browser supports this natively
	if (document.getElementsByClassName) 
		return document.getElementsByClassName(className);

	// Otherwise use the function defined by MediaWiki
	return getElementsByClassName(document,'*',className)
}

/*
	Display an error message, either by putting it on the page or - if the
	place to put it does not exist - by showing an alert box.
*/
function ime_error(message) {
	var jqFile = $('#file');
	var jqIme = $('#ime');

	if (jqFile.length !== 0) {
		var jqImeError = $('<p/>')
		.css({
			'color' : 'darkred',
			'background' : 'white',
			'border' : '1px solid darkred',
			'padding' : '1ex'
		})
		.text(message)

		if (jqIme !== 0) {
			jqIme.before(jqImeError);
		} else {
			jqImeError.appendTo(jqFile);
		}
	}
	else {
		window.alert(message);
	}
}

/*
	Dummy function to intercept events
*/
function ime_eventDummy(e) {
	e.cancelBubble = true;
	return false;
}

/*
	Function to define an object containing rect(angle) coordinates.
*/
function ime_RectCoord(x1,y1,x2,y2) {ime_extend(this, {left: x1, top: y1, right: x2, bottom: y2});}

/*
	Function to define an object containing circle coordinates.
*/
function ime_CircleCoord(x,y,r) {ime_extend(this, {x: x, y: y, radius: r});}

/*
	Function to define an object containing poly(gon) coordinates.
*/
function ime_PolyCoord(x,y,r) {this.points = Array();}

/*
	Function to define an object storing info on a clickable area for the
	imagemap.
*/
function ime_Area(shape) {
	var coords = (shape=='rect' 
		? new ime_RectCoord(0,0,0,0)
		: (shape=='circle' 
			?  new ime_CircleCoord(0,0,20)
			: new ime_PolyCoord()));
	ime_extend(this, {link: '', title: '', coords: coords, shape: shape || 'poly'});
}

/*
	Browser invariant function to get the event "behind" the object passed
	to event handlers.
*/
function ime_getEvent(e) {return e || window.event;}

function ime_eventGetX(e) {
	if (typeof(e.layerX)!='undefined') 
		return Math.round(e.layerX / ime_scale);
	if (typeof(e.offsetX)!='undefined')
		return Math.round(e.offsetX / ime_scale);
	return Math.round(e.x / ime_scale);
}

function ime_eventGetY(e) {
	if (typeof(e.layerY)!='undefined') 
		return Math.round(e.layerY / ime_scale);
	if (typeof(e.offsetY)!='undefined') 
		return Math.round(e.offsetY / ime_scale);
	return Math.round(e.y / ime_scale);
}

function ime_eventGetButton(e) {
	return e.which || e.button;
}

function ime_mouseEventSet(func) {
	var img = document.getElementById('imeImg');
	img.onmousedown = func || null;
	img.style.cursor = func ? 'crosshair' : '';
}

function ime_eventRect(e) {
	e = ime_getEvent(e);
	var button = ime_eventGetButton(e);
	if (button==1) {
		document.ime.areaRectLeft.value = ime_eventGetX(e);
		document.ime.areaRectTop.value = ime_eventGetY(e);
	}
	else if (button==2 || button==3) {
		document.ime.areaRectRight.value = ime_eventGetX(e);
		document.ime.areaRectBottom.value = ime_eventGetY(e);
	}
	ime_saveArea();
	return false;
}

function ime_eventCircle(e) {
	e = ime_getEvent(e);
	var button = ime_eventGetButton(e);
	if (button==1) {
		document.ime.areaCircleX.value = ime_eventGetX(e);
		document.ime.areaCircleY.value = ime_eventGetY(e);
	}
	else if (button==2 || button==3) {
		var a = (ime_eventGetX(e) - parseInt(document.ime.areaCircleX.value));
		var b = (ime_eventGetY(e) - parseInt(document.ime.areaCircleY.value));
		document.ime.areaCircleRadius.value = Math.round(Math.sqrt(a*a + b*b));
	}
	ime_saveArea();
	return false;
}

function ime_eventPoly(e) {
	e = ime_getEvent(e);
	var button = ime_eventGetButton(e);
	if (button==1) {
		area = ime_areas[ime_currentlyEditing];
		area.coords.points.push(ime_eventGetX(e));
		area.coords.points.push(ime_eventGetY(e));
		ime_saveArea();
	}
	return false;
}

function ime_newArea(shape) {
	var area = new ime_Area(shape);
	area.shape = shape;
	ime_areas.push(area);

	ime_currentlyEditing = ime_areas.length-1;
	ime_updateAreas();
	ime_editArea(ime_currentlyEditing);
}

function ime_updateAreas() {
	ime_updateSelectArea();
	ime_updateMap();
	ime_updateResult();
}

function ime_updateResult() {
	var arr = document.ime.imageDescriptionPos;
	var imageDescriptionPos = arr[0].value;
	for (var i=1; i<arr.length; i++) {
		if (arr[i].checked) {
			imageDescriptionPos = arr[i].value;
			break;
		}
	}

	var result = Array();
	result.push('<imagemap>');
	result.push(wgPageName + '|' + document.ime.imageDescription.value);
	result.push('');
	for (var i=0; i<ime_areas.length; i++) {
		var coords = ime_areas[i].coords, shape = ime_areas[i].shape, s;
		if (shape=='rect') 
			s = [coords.left, coords.top, coords.right, coords.bottom];
		else if (shape=='circle') 
			s = [coords.x, coords.y, coords.radius];
		else if (shape=='poly') 
			s = coords.points;
		result.push(ime_areas[i].shape + ' ' + s.join(' ') + ' [[' + ime_areas[i].link + (ime_areas[i].title ? '|' + ime_areas[i].title : '') + ']]');
	}
	result.push('');
	result.push('desc ' + imageDescriptionPos);
	result.push('</imagemap>');

	var preResult = document.getElementById('imeResult');

	while (preResult.lastChild) {
		preResult.removeChild(preResult.lastChild);
	}

	for (var i=0; i<result.length; i++) {
		preResult.appendChild(document.createTextNode(result[i]));
		preResult.appendChild(document.createElement('br'));
	}
}

function ime_corners_of_poly(points) {
	if (!points.length)
		return [0,0,0,0];
	var minX, maxX, minY, maxY;
	minX = maxX = points[0]; minY = maxY = points[1];
	for (var j=2; j<points.length; j+=2) {
		var x = points[j], y = points[j+1];
		minX = Math.min(minX, x);
		maxX = Math.max(maxX, x);
		maxY = Math.max(maxY, y);
		minY = Math.min(minY, y);
	}
	return [minX, minY, maxX, maxY];
}

function ime_updateMap() {
	var preview = document.getElementById('imePreview');
	var img = document.getElementById('imeImg');

	// Remove areas from map which are out of range
	for (var i = preview.childNodes.length - 1; i >= 0; i--) {
		var child = preview.childNodes[i];
		var id = parseInt(child.id.substring(10));
		if (id>=ime_areas.length) 
			preview.removeChild(child);
	}

	for (var i=0; i<ime_areas.length; i++) {
		// Get existing DIV
		var area = ime_areas[i];
		var div = document.getElementById('imePreview' + i);

		// If it does not exist exists, create a new one and set style
		if (!div) {
			var div = ime_htmlNewDiv('imePreview' + i)
			preview.appendChild(div);
			ime_extend(div.style, {zIndex: 0, position: 'absolute', opacity: 0.25, filter: 'alpha(opacity=25)'});
		}

		var coords = area.coords;
		if (area.shape == 'rect') {
			div.className = 'previewRect';
			// Only if valid coordinates were given, draw
			if (coords.left<coords.right && coords.top<coords.bottom) 
				ime_extend(div.style, {
					left: Math.round(ime_scale * coords.left) + 'px',
					top: Math.round(ime_scale * coords.top) + 'px',
					width: Math.round(ime_scale * (coords.right - coords.left)) + 'px',
					height: Math.round(ime_scale * (coords.bottom - coords.top)) + 'px'
				});
			else 
				ime_extend(div.style, {left: 0, top: 0, width: 0, height: 0});
		}
		else if (area.shape == 'circle') {
			div.className = 'previewCircle';
			var left = Math.round(ime_scale * coords.x) - Math.round(ime_scale * coords.radius);
			var top = Math.round(ime_scale * coords.y) - Math.round(ime_scale * coords.radius);
			var size = Math.round(ime_scale * coords.radius * 2) + 1;
			
			ime_extend(div.style, {backgroundRepeat: 'no-repeat', left: left + 'px', top: top + 'px',
				width: Math.min(left + size, img.width) + 'px',
				height: Math.min(img.height - top, size) + 'px'
				});

		}
		else if (area.shape == 'poly') {
			// Determine maximum coordinates (this is how big the image is)
			div.className = 'previewPoly';

			var corners = ime_corners_of_poly(coords.points);
			
			ime_extend(div.style, {backgroundRepeat: 'no-repeat', 
				left: Math.round(ime_scale * corners[0]) + 'px',
				top: Math.round(ime_scale * corners[1]) + 'px',
				width: Math.round(ime_scale * (corners[2] -  corners[0])) + 'px',
				height: Math.round(ime_scale * (corners[3] - corners[1])) + 'px'
			});
		} //poly
	}

	ime_highlightMap();
}

function ime_highlightMapCircle(div,radius,highlight) {
	var background = "url('" + IME_CIRCLESCRIPT + '?' + (highlight ? 'active=1&' : '') + 'radius=' +  Math.round(ime_scale * radius) + "') no-repeat";
	if (div.style.background != background) {
		div.style.background = background;
	}
}

function ime_highlightMapPoly(div,points,highlight) {
	var corners = ime_corners_of_poly(points);
	var minX = corners[0], minY = corners[1];
	var convpoints = Array();
	for(var j=0; j<points.length; j+=2) {
		convpoints[j] = Math.round(ime_scale * (points[j] - minX));
		convpoints[j+1] = Math.round(ime_scale * (points[j+1]- minY));
	}
	var background = "url('" + IME_POLYSCRIPT + '?' + (highlight ? 'active=1&' : '') + 'coords=' + convpoints.join("|") + "') no-repeat";
	if (div.style.background != background) {
		div.style.background = background;
	}
}

function ime_highlightMap() {
	for (var i=0; i<ime_areas.length; i++) {
		var div = document.getElementById('imePreview' + i);
		var area = ime_areas[i];
		if (div && area) {
			if (i==ime_currentlyEditing) {
				div.style.opacity = '0.6';
				div.style.filter = 'alpha(opacity=60)'; // IE
			} else {
				div.style.opacity = '0.5';
				div.style.filter = 'alpha(opacity=50)'; // IE
			}
			if (area.shape == 'rect') {
				var backgroundColor = (i==ime_currentlyEditing) ? 'red' : 'black';
				if (div.style.backgroundColor != backgroundColor) div.style.backgroundColor = backgroundColor;
			}
			else if (area.shape == 'circle') {
				ime_highlightMapCircle(div,area.coords.radius,(i==ime_currentlyEditing));
			}
			else if (area.shape == 'poly') {
				ime_highlightMapPoly(div,area.coords.points,(i==ime_currentlyEditing));
			}
		}
	}
}

function ime_updateSelectArea() {
	var selectArea = document.ime.area;

	while (selectArea.childNodes.length>0) {
		selectArea.removeChild(selectArea.lastChild);
	}

	for (var i=0; i<ime_areas.length; i++) {
		var option = document.createElement('option');
		var area = ime_areas[i];
		option.value = i;
		while (option.childNodes.length>0) {
			option.removeChild(option.lastChild);
		}
		var text = (area.title ? area.title : area.link) + ' [' + area.shape + ']';
		option.appendChild(document.createTextNode(text));
		if (i == ime_currentlyEditing) {
			option.selected = 'selected';
		}
		selectArea.appendChild(option);
	}
}

function ime_editArea(index) {
	document.getElementById('imeProps').style.display = 'none';

	var area = ime_areas[index];

	if (area) {
		ime_currentlyEditing = index;

		document.getElementById('imeProps').style.display = '';
		document.getElementById('imePropsRect').style.display = 'none';
		document.getElementById('imePropsCircle').style.display = 'none';
		document.getElementById('imePropsPoly').style.display= 'none';
		ime_mouseEventSet(null);

		if (area.shape == 'rect') {
			document.getElementById('imePropsRect').style.display = '';
			ime_mouseEventSet(ime_eventRect);
		}
		else if (area.shape == 'circle') {
			document.getElementById('imePropsCircle').style.display = '';
			ime_mouseEventSet(ime_eventCircle);
		}
		else if (area.shape == 'poly') {
			document.getElementById('imePropsPoly').style.display = '';
			ime_mouseEventSet(ime_eventPoly);
		}

		document.ime.areaLink.value = area.link;
		document.ime.areaTitle.value = area.title;

		var coords = area.coords;
		if (area.shape == 'rect') {
			document.ime.areaRectLeft.value = coords.left;
			document.ime.areaRectTop.value = coords.top;
			document.ime.areaRectRight.value = coords.right;
			document.ime.areaRectBottom.value = coords.bottom;
		}
		else if (area.shape == 'circle') {
			document.ime.areaCircleX.value = coords.x;
			document.ime.areaCircleY.value = coords.y;
			document.ime.areaCircleRadius.value = coords.radius;
		}
		else if (area.shape == 'poly') {
			var propsPolyCoords = document.getElementById('imePropsPolyCoords');
			if (propsPolyCoords.childNodes.length > 0) propsPolyCoords.removeChild(propsPolyCoords.lastChild);
			propsPolyCoords.appendChild(document.createTextNode(area.coords.points.join(", ")));
		}

		ime_highlightMap();
	}
}

function ime_deletePolyCoords() {
	ime_areas[ime_currentlyEditing].coords.points = Array();
	ime_saveArea();
}

function ime_saveArea() {
	var area = ime_areas[ime_currentlyEditing];
	area.link = document.ime.areaLink.value;
	area.title = document.ime.areaTitle.value;

	var coords = area.coords;
	switch (area.shape) {
		case 'rect': 
			ime_extend(coords, { left: parseInt(document.ime.areaRectLeft.value),
						top: parseInt(document.ime.areaRectTop.value),
						right: parseInt(document.ime.areaRectRight.value),
						bottom: parseInt(document.ime.areaRectBottom.value)});
			break;
		case 'circle':
			if (parseInt(document.ime.areaCircleRadius.value) < 0) document.ime.areaCircleRadius.value = 0;
			coords.x = parseInt(document.ime.areaCircleX.value);
			coords.y = parseInt(document.ime.areaCircleY.value);
			coords.radius = parseInt(document.ime.areaCircleRadius.value);
			break;
		case 'poly':
			var propsPolyCoords = document.getElementById('imePropsPolyCoords');
			if (propsPolyCoords.childNodes.length > 0) propsPolyCoords.removeChild(propsPolyCoords.lastChild);
			propsPolyCoords.appendChild(document.createTextNode(coords.points.join(", ")));
			break;
	}

	ime_updateAreas();
}

function ime_deleteArea() {
	ime_mouseEventSet(null);

	// Remove element from ime_areas array
	ime_areas.splice(ime_currentlyEditing,1);

	// Remove preview div of the deleted area
	var div = document.getElementById('imePreview' + ime_currentlyEditing);
	if (div) {
		div.parentNode.removeChild(div);
	}

	// Move ids of preview divs to fill the hole
	for (var i=ime_currentlyEditing+1; i<ime_areas.length; i++) {
		div = document.getElementById('imePreview' + i);
		if (div) {
			div.id = 'imePreview' + (i-1);
		}
	}

	// If we deleted the last area, correct currently editing
	if (ime_currentlyEditing>=ime_areas.length) {
		ime_currentlyEditing = ime_areas.length-1;
	}

	ime_updateAreas();
	ime_editArea(ime_currentlyEditing);
}

function ime_importLines() {
	var text = document.ime.importText.value;
	var lines = text.split("\n");

	for (var i=0; i<lines.length; i++) {
		var rectMatch = /rect +(\d+) +(\d+) +(\d+) +(\d+) +\[\[([^|]*)(|(.*))?\]\]/i;
		var circleMatch = /circle +(\d+) +(\d+) +(\d+) +\[\[([^|]*)(|(.*))?\]\]/i;
		var polyMatch = /poly +(.*?) +\[\[([^|]*)(|(.*))?\]\]/i;

		var line = lines[i];

		if (rectMatch.test(line)) {
			var results = rectMatch.exec(line);
			var area = new ime_Area("rect");
			area.coords.left = parseInt(results[1]);
			area.coords.top = parseInt(results[2]);
			area.coords.right = parseInt(results[3]);
			area.coords.bottom = parseInt(results[4]);
			area.link = results[5];
			if (results[6]) area.title = results[6].substring(1);
			ime_areas.push(area);
		}
		else if (circleMatch.test(line)) {
			var results = circleMatch.exec(line);
			var area = new ime_Area("circle");
			area.coords.x = parseInt(results[1]);
			area.coords.y = parseInt(results[2]);
			area.coords.radius = parseInt(results[3]);
			area.link = results[4];
			if (results[5]) area.title = results[5].substring(1);
			ime_areas.push(area);
		}
		else if (polyMatch.test(line)) {
			var results = polyMatch.exec(line);
			var area = new ime_Area("poly");
			area.coords.points = results[1].replace(/ +/," ").split(" ");
			for (var j=0; j<area.coords.points.length; j++) {
				area.coords.points[j] = parseInt(area.coords.points[j]);
			}
			area.link = results[2];
			if (results[3]) area.title = results[3].substring(1);
			ime_areas.push(area);
		}
	}
	ime_updateAreas();
	ime_hideImport();
}

function ime_showImport() {
	$('#imeImport').show();
	$('#imeImportShow').hide();
	$('#imeImportHide').show();
}

function ime_hideImport() {
	$('#imeImport').hide();
	$('#imeImportShow').show();
	$('#imeImportHide').hide();
}

/*
	Remove all UI elements that might interfere with ImageMapEdit.
*/
function ime_removeOtherUIElements() {
	// Remove all UI elements of the 'annotations' feature used on Wikimedia
	// Commons.
	$('#ImageAnnotationAddButton').remove();
}

/*
	Try to find an <a> tag within the specified HTML document node.
*/
function ime_findATag(node) {
	// We just look at the first child until there is none or it is an <a> tag
	var a = node;
	while (a != null && a.nodeName.toUpperCase() != 'A') {
		a = a.firstChild;
	}
	return a;
}

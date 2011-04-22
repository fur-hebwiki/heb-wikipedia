var refContainer; //must be global, sorry for that.
function refColumns() {
	var copyAttribs = function(a, b) {
		for (var key in b)
			a[key] = b[key];
		return a;
	}

	var saveSelection = ($.cookie) ? (function() {
		var selection = parseInt(this.cookie("ref-col-setting") || 0);
		if (this.checked)
			selection |= this.selectionBit;
		else
			selection &= ~this.selectionBit;
		this.cookie("ref-col-setting", selection, {'expires':30,'path':'/'});
	}) : function(){};

// do we have a "reference" section? please find it.
	var refListElement = getElementsByClassName(document, 'OL', 'references');
	if (!refListElement || !refListElement[0])
		return;
	// getElementsByClassName returns an array, even though there's only one. the [0] element is our guy. find its papa while we're at it.
	var refList = refListElement[0], papa = refList.parentNode;
	// columns already defined in the page itself?
	var already = papa && papa.style && (papa.style["-webkit-column-width"] || papa.style.MozColumnWidth);
	// no columns yet? is browser column-capable? enough entries in list to justify splitting? 
	var useCols = !already && refList.childElementCount > 3 && navigator.userAgent.indexOf("Gecko") >= 0;
	var enableScroll = (refList.clientHeight > 400) || (refList.offsetHeight && refList.offsetHeight > 400);
	if (!useCols && !enableScroll)
		return;
	// create the checkbox and label, assign the onclick.
	var cbCol = null, cbScroll = null;
	
	var controlsDiv = document.createElement('span');
	controlsDiv.style.direction = 'rtl'; // reflist may be in ltr div
	controlsDiv.style.width = '100%';
	if (useCols) {
		cbCol = copyAttribs(document.createElement('input'), {type: 'checkbox', selectionBit: 1, cookie: $.cookie, saveSelection: saveSelection});
		cbCol.onclick = function(){var s = refContainer.style; s.MozColumnWidth = s.WebkitColumnWidth = s.ColumnWidth = this.checked ? '32em' : null; this.saveSelection();};
		var label = document.createElement('label');
		label.htmlFor = cbCol;
		label.innerHTML =  "הצגה בטורים";
		// append them to controlsDiv
		controlsDiv.appendChild(label);
		controlsDiv.appendChild(cbCol);
	}
	if (enableScroll) {
		cbScroll = copyAttribs(document.createElement('input'), {type: 'checkbox', selectionBit: 2, cookie: $.cookie, saveSelection: saveSelection});
		cbScroll.onclick = function(){var s = refContainer.style; s.maxHeight = this.checked ? '30em' : null; s.overflow = this.checked ? "auto" : "visible"; this.saveSelection();};
		var slabel = document.createElement('label');
		slabel.htmlFor = cbScroll;
		slabel.innerHTML =  "תיבת גלילה";
		// insert them just before refList (or just before papa in case columns already defined)
		controlsDiv.appendChild(slabel);
		controlsDiv.appendChild(cbScroll);
	}
	if (useCols || enableScroll) {
		var cbHide = copyAttribs(document.createElement('input'), {type: 'checkbox', refList: refList});
		cbHide.onclick = function(){this.refList.style.display = (this.checked ? 'none' : 'block');};
		var hlabel = document.createElement('label');
		hlabel.htmlFor = cbHide;
		hlabel.innerHTML =  "הסתרה";
		controlsDiv.appendChild(hlabel);
		controlsDiv.appendChild(cbHide);
	}
	
	var header = document.getElementById(".D7.94.D7.A2.D7.A8.D7.95.D7.AA_.D7.A9.D7.95.D7.9C.D7.99.D7.99.D7.9D");
	var controlsInHeader = header && header.nodeName == "SPAN";
	if (controlsInHeader) {
		controlsDiv.style.fontSize = "67%";
		controlsDiv.style.marginRight = controlsDiv.style.marginLeft = "40px";
		if (header.nextSibling)
			header.parentNode.insertBefore(controlsDiv, header.nextSibling);
		else
			header.parentNode.appendChild(controlsDiv);
	}
	if (already) { // in this page, references are already inside a div - just use it. otherwise, we wrap our own div around it. 
		if (!controlsInHeader)
			papa.parentNode.insertBefore(controlsDiv, papa);
		refContainer = papa;
	}
	else {
		if (!controlsInHeader)
			papa.insertBefore(controlsDiv, refList);
		// make a div and add it to papa.
		refContainer = document.createElement('div');
		papa.insertBefore(refContainer, refList);
		// now remove reflist from its parent, and shove it into the div:
		papa.removeChild(refList);
		refContainer.appendChild(refList);
	}
	refContainer.style.clear = 'both';	
	
	if ($.cookie) {
		var state = parseInt($.cookie("ref-col-setting") || 0);
		if (cbCol && (state & 1))
			cbCol.click();
		if (cbScroll && (state & 2))
			cbScroll.click();
	}
}

$j(document).ready(refColumns);

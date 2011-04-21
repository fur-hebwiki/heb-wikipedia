var refContainer; //must be global, sorry for that.
function refColumns() {
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
		cbCol = document.createElement('input');
		cbCol.type = 'checkbox';
		cbCol.onclick = function(){var s = refContainer.style; s.MozColumnWidth = s.WebkitColumnWidth = s.ColumnWidth = this.checked ? '30em' : null;};
		var label = document.createElement('label');
		label.htmlFor = cbCol;
		label.innerHTML =  "הצגה בטורים";
		// append them to controlsDiv
		controlsDiv.appendChild(label);
		controlsDiv.appendChild(cbCol);
	}
	if (enableScroll) {
		cbScroll = document.createElement('input');
		cbScroll.type = 'checkbox';
		cbScroll.onclick = function(){var s = refContainer.style; s.maxHeight = this.checked ? '30em' : null; s.overflow = this.checked ? "auto" : "visible";};
		var slabel = document.createElement('label');
		slabel.htmlFor = cbScroll;
		slabel.innerHTML =  "תיבת גלילה";
		// insert them just before refList (or just before papa in case columns already defined)
		controlsDiv.appendChild(slabel);
		controlsDiv.appendChild(cbScroll);
	}
	if (useCols || enableScroll) {
		var cbHide = document.createElement('input');
		cbHide.type = 'checkbox';
		cbHide.refList = refList
		cbHide.onclick = function(){this.refList.style.display = (this.checked ? 'none' : 'block');
		};
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
	// click the checkbox once to split the columns. if you rather the default is single col, put next 2 lines in a comment.
	if (cbCol && (window.wgDefaultRecCol !== undefined) && wgDefaultRecCol)
		cbCol.click();
	

	if (cbScroll && (window.wgDefaultRefScroll !== undefined)  && wgDefaultRefScroll)
		cbScroll.click();
}
addOnloadHook(refColumns);

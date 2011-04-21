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
	var enableScroll = refList.clientHeight > 400;
	if (!useCols && !enableScroll)
		return;
	// create the checkbox and label, assign the onclick.
	var cbCol = null, cbScroll = null;
	
	var controlsDiv = document.createElement('div');
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
		cbScroll.onclick = function(){var s = refContainer.style; s.maxHeight = this.checked ? '30em' : null; s.overflow = this.checked ? "auto" : "none";};
		var slabel = document.createElement('label');
		slabel.htmlFor = cbScroll;
		slabel.innerHTML =  "תיבת גלילה";
		// insert them just before refList (or just before papa in case columns already defined)
		controlsDiv.appendChild(slabel, refList);
		controlsDiv.appendChild(cbScroll, refList);
	}
	
	papa.insertBefore(controlsDiv, refList);
	if (already)  // in this page, references are already inside a div - just use it. otherwise, we wrap our own div around it. 
		refContainer = papa;
	else {
		// make a div and add it to papa.
		refContainer = document.createElement('div');
		papa.insertBefore(refContainer, refList);
		// now remove reflist from its parent, and shove it into the div:
		papa.removeChild(refList);
		refContainer.appendChild(refList);
	}
	
	// click the checkbox once to split the columns. if you rather the default is single col, put next 2 lines in a comment.
	if (cbCol)
		cbCol.click();
	
// if you want the default to be scrolling, uncomment the next 2 lines.
//	if (cbScroll)
//		cbScroll.click();
}
addOnloadHook(refColumns);

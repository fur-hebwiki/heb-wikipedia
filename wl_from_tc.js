// Adds Watch/Unwatch links to recent-changes list.
function wlinrc_setText(element, text) {
	if (typeof element.innerText != "undefined")
		element.innerText = text;
	if (typeof element.textContent != "undefined")
		element.textContent = text;
}

function wlinrc_done() {
	if (this.readyState != 4) // this is some ajax incantation - ony "4" is good.
		return;
	var span = this.span;
	if (wgCanonicalSpecialPageName == 'Watchlist') {
		span.parentNode.removeChild(span);
		return;
	}
	wlinrc_setText(span.firstChild, span.isWatched ? '[עקוב]' : '[הפסק לעקוב]');
	span.source.style.fontWeight = span.isWatched ? 'normal' : 'bolder';
	span.style.color = span.isWatched ? 'blue' : 'green';
	span.isWatched ^= true;
}

function wlinrc_watchme() {
	var ajax = sajax_init_object();
	ajax.open('GET', 'http://he.wikipedia.org/w/api.php?action=watch' + 
				'&title=' + this.target.replace(' ', '_') + 
				(this.isWatched ? '&unwatch=' : ''));
	ajax.onreadystatechange = wlinrc_done;
	ajax.span = this;
	wlinrc_setText(this.firstChild, '[נשלח...]');
	this.style.color = 'orange';
	ajax.send(null);	
}

function wlinrc_addWatchListLink(element, anchor) {
	var link, source;
	if (anchor) {
		source = anchor;
		link = anchor.title;
	} else {
		var anchors = element.getElementsByTagName('a');
		var link = '', source = null;
		for (var i = 0; i < anchors.length; i++) {
			var anchor = anchors[i];
			var linkString = anchor.href;
			if (linkString && linkString.indexOf('/wiki/', 0) > 0) {
				link = anchor.title;
				source = anchor;
				break;
			}
		}
		if (!link)
			return;
	}
	var span = document.createElement(span);
	// this is a kludge: we take advantage of the fact that watched pages appear in boldface 
	// in last changes page, with className of "'mw-watched'" to deduc that this page is watched.
	var inWatchList = wgCanonicalSpecialPageName == 'Watchlist';
	span.isWatched =  inWatchList || getElementsByClassName(element, 'strong', 'mw-watched').length > 0;
	var stopFollowStr = inWatchList ? '[הסר]' : '[הפסק לעקוב]';
	span.appendChild(document.createTextNode(span.isWatched ? stopFollowStr  : '[עקוב]'));
	$.extend(span.style, {cursor: 'pointer', color: span.isWatched ? 'green' : 'blue'});
	$.extend(span, {onclick: wlinrc_watchme, target: link, source: source});
	element.appendChild(span);
}

function wlinrc_addWatchListLinks() {
	// this works in "regular" changes list
	var kinds = ['mw-line-even', 'mw-line-odd'];
	for (var i in kinds) {
		var links = getElementsByClassName(document, 'li', kinds[i]);
		for (var l in links) 
			wlinrc_addWatchListLink(links[l]);
	}
	// this works in "enhanced" changes list.
	var tds = $("td.mw-enhanced-rc").next();
	for (var i = 0; i < tds.length; i++) {
		var a = $(tds[i]).find("a:eq(0)");
		if (a.length)
			wlinrc_addWatchListLink(tds[i], a[0]);
	}
	if (wgCanonicalSpecialPageName == 'Newpages') {
		var lis = $(".mw-newpages-time").parent();
		for (var i = 0; i < lis.length; i++) {
			var anchors = $(lis[i]).find(".mw-newpages-time").next();
			if (anchors.length)
				wlinrc_addWatchListLink(lis[i], anchors[0]);
		}
	}
}

if ($.inArray(wgCanonicalSpecialPageName, ['Recentchanges', 'Watchlist', 'Newpages']) + 1)
	hookEvent("load", wlinrc_addWatchListLinks);

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
	wlinrc_setText(span.firstChild, span.isWatched ? '[עקוב]' : '[הסר]');
	span.source.style.fontWeight = span.isWatched ? 'normal' : 'bolder';
	span.style.color = span.isWatched ? 'blue' : 'red';
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

function wlinrc_addWatchListLink(li) {
	var anchors = li.getElementsByTagName('a');
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
	var span = document.createElement(span);
	// this is a kludge: we take advantage of the fact that watched pages appear in boldface 
	// in last changes page, with className of "'mw-watched'" to deduc that this page is watched.
	span.isWatched = (getElementsByClassName(li, 'strong', 'mw-watched').length > 0);
	span.appendChild(document.createTextNode(span.isWatched ? '[הסר]' : '[עקוב]'));
	$.extend(span.style, {cursor: 'pointer', color: span.isWatched ? 'red' : 'blue'});
	$.extend(span, {onclick: wlinrc_watchme, target: link, source: source});
	li.appendChild(span);
}

function wlinrc_addWatchListLinks() {
	var kinds = ['mw-line-even', 'mw-line-odd'];
	for (var i in kinds) {
		var links = getElementsByClassName(document, 'li', kinds[i]);
		for (var l in links) 
			wlinrc_addWatchListLink(links[l]);
	}
}

if (wgCanonicalSpecialPageName == 'Recentchanges')
	hookEvent("load", wlinrc_addWatchListLinks);
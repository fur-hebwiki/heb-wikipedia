// the usual prayer
if ((mw.config.get('wgNamespaceNumber') == -1 && mw.config.get('wgCanonicalSpecialPageName') == "Contributions")
	|| (mw.config.get('wgNamespaceNumber') == 14))
	$(document).ready(function() {
var isCat = mw.config.get('wgNamespaceNumber') == 14;
var watchList = {};

function readWatchList(continuation) {
	var params = {action: 'query', list: 'watchlistraw', wrlimit: 500, format: 'json'};
	if (continuation)
		params.wrcontinue = continuation;
	$.getJSON(mw.util.wikiScript('api'), params, function(data) {
		if (data && data.watchlistraw)
			$.each(data.watchlistraw, function(key, val) { watchList[val.title] = true; });
		if (data && data['query-continue'])
			readWatchList(data['query-continue']['watchlistraw']['wrcontinue']);
		else
			colorWatched();
	});
}	

function watchText(watch) { return (isCat ? ' ':'') + (watch ? '[עקוב]' : '[הסר]');}
function watchTitle(watch){ return watch? 'הוסף לרשימת המעקב שלי' : 'הסר מרשימת המעקב שלי';}

function colorWatched() {
	var pagesList = isCat ? $('#mw-pages').find('li') : $('#bodyContent > ul > li');
	var all = [];
	var all = pagesList.each(function() {
		var li = $(this);
		var line = li.children().filter('a:last');
		var page = line.attr('title');
		var watched = watchList[page] || false;
		if (watched)
			line.addClass('iswatched');
		var watchLink = $('<span>', {'class': watched? 'unwatchit-link' : 'watchit-link', title: watchTitle( !watched)})
			.text(watchText(! watched))
			.click(function() {watchIt($(this), page, line)})
		li.append(watchLink);
	});
}
		
function watchIt(span, page, line) {
	var watched = span.hasClass('unwatchit-link');
	var params = {action: 'watch', title: page, format: 'json'};
	if (watched)
		params.unwatch = '';
	if (mw && mw.user && mw.user.tokens)
		params.token = mw.user.tokens.get('watchToken');
	$.post(mw.util.wikiScript('api'), params, function() {
		span.toggleClass('unwatchit-link  watchit-link')
			.text(watchText(watched))
			.attr({title: watchTitle(watched)});
		line.toggleClass('iswatched');
	});
}
		
$("<style type='text/css'> \n" +
	".unwatchit-link{color:#a00; cursor: pointer; font-size: 70%;}  \n" +
	".watchit-link{color:#008; cursor: pointer; font-size: 70%;}  \n" +
	".iswatched{font-weight: bolder;}  \n" +
	"</style> "
).appendTo("head");
readWatchList();		
		
}); // document ready
		
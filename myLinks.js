$(document).ready(function() {
	var linksPortalName = 'myLinksPortal';
	
	function getState() {return parseInt($.cookie('vector-nav-' + linksPortalName, {path: '/'}) == 'true');}
	
	function toggleState() {
		var state = getState() ^ 1;
		var div = $('div#' + linksPortalName);
		var classes = ['extended', 'collapsed'];
		if (!state)
			classes.reverse();
		div.addClass(classes[0])
			.removeClass(classes[1])
			.filter('h5 > div').css({display: state ? 'block' : 'hidden'});
	}
	$.getJSON(mw.util.wikiScript('api'),
		{action: 'parse', page: 'User:' + wgUserName + '/הקישורים שלי', format: 'json'}, function(data) {
			
			if (data && data.parse && data.parse.text) {
				var p = $(data.parse.text['*']);
				var links = p.find('a');
				if (! links.length)
					returnl
				var ul = $('<ul>');
				var div = $('<div>', {'class': 'portal ' + (getState() ? 'expanded' : 'collapsed'), id: linksPortalName});
				links.each(function() {
					ul.append($('<li>').append($('<a>', {href: $(this).attr('href'), text: $(this).attr('text')})));
				});
				$('#mw-panel > div.portal:eq(0)').after(
					div
					.append($('<h5>').text('הקישורים שלי').click(toggleState))
					.append($('<div>', {'class': 'body'}).css({display: getState() ? 'block' : 'hidden'})
							.append(ul)
					)
				);
				}
			});
});
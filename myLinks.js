$(document).ready(function() {
	var linksPortalName = 'myLinksPortal';
	
	function getState() {return $.cookie('vector-nav-' + linksPortalName, {path: '/'}) == 'true';}

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
					.append($('<h5>').text('הקישורים שלי'))
					.append($('<div>', {'class': 'body'}).css({display: getState() ? 'block' : 'hidden'}).append(ul))
					);
				}
			});
});
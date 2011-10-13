$(document).ready(function() {
	$(".mw-rollback-link  a:eq(0)").click(function() {
		var match = $(this).attr('href').match(/title=([^&]*)/);
		if (!match)
			return;
		var data = {action: 'watch', title: decodeURI(match[1])};
		if (mw && mw.user && mw.user.tokens)
			data.token = mw.user.tokens.get('watchToken');		
		$.ajax({url: mw.util.wikiScript('api'), async: false, type: 'post', data: data});
	});
});

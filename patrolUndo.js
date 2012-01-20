if ($.inArray(wgAction, ['history', 'historysubmit', 'view']) + 1) 
$(document).ready(function() {
	$('.mw-history-undo, #mw-diff-ntitle1 a:[text=ביטול]').click(function() {
		var user, href;
		if ($('#mw-diff-ntitle1').length) {
			href = this.href;
			user = $('#mw-diff-ntitle2>a').text();
		} else {
			href = $('a:eq(0)', this).attr('href');
			user = $(this).siblings('.history-user').find('a:eq(0)').text();
		}
		if (!href || !user)
			return;
		var match = href.match(/&undo=(\d*)/);
		if (!match.length)
			return;
		var revToMark = parseInt(match[1], 10);
		$.ajaxSetup({url: mw.util.wikiScript('api'), type: 'post', async: false});
		$.ajax({
			data: {action: 'query', list: 'recentchanges', rctoken: 'patrol', rcprop: 'ids|patrolled', rclimit: 500, rcuser: user, format: 'json'},
			success: function(data) {
				var item = $.grep(data.query.recentchanges, function(i){return i.revid == revToMark}).pop();
				if (!item || !item.rcid || !item.patroltoken || (typeof item.patrolled == "string"))
					return;
				$.ajax({data: {action: 'patrol', rcid: item.rcid, token: item.patroltoken, format: 'json'}});
			} 
		});
	});
});
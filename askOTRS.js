// script 38: add linkette to place OTRS request in talkpage of the user who added or modified the file.
// <source lang="javascript">
if (wgNamespaceNumber == 6)
$(document).ready(function() {
	$('span.mw-usertoollinks').find('a:first').each(function() {
		var talkPage = $.trim(this.title.replace('(הדף אינו קיים)', ''));
		$(this)
		.after(
			$('<a>', {href: '#'})
			.text('אישור OTRS')
			.click(function() {
				var message = '\n\n==[[:' + wgPageName + ']]==\n{{אישור OTRS|תמונה=' + wgTitle + '}} ~~' + '~~';
				var summary = 'בקשת אישור OTRS ל[[:' + wgPageName + ']]';
				var param = {action: 'edit', title: talkPage, summary: summary, token: mw.user.tokens.get('editToken'), appendtext: message, format: 'json'};
				$.post(mw.util.wikiScript('api'), param, function(){alert('הבקשה לאישור OTRS התווספה לדף המשתמש - ' + talkPage);}); //flying blind
			})
		)
		.after(' | ')
	});
});	
// </source>
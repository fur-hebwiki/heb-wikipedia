// סקריפט 38: הוספת קישורית "אישור OTRS" לקישורי המשתמש בדף הקובץ של תמונות מסוימות{{ש}}
// נכתב על ידי {{משתמש| Mikimik}}, שוכתב על ידי {{משתמש|קיפודנחש}}
// <source lang="javascript">
if (wgNamespaceNumber == 6)
$(document).ready(function() {
	$('span.mw-usertoollinks a:first').each(function() {
		var talkPage = $.trim(this.title.replace('(הדף אינו קיים)', ''));
		$(this)
		.after(
			$('<a>', {href: '#'})
			.text('אישור OTRS')
			.click(function() {
				var message = '\n\n==[[:' + wgPageName + ']]==\n{{אישור OTRS|תמונה=' + wgTitle + '}} ~~' + '~~';
				var summary = 'בקשת אישור OTRS ל[[:' + wgPageName + ']]';
				var param = {action: 'edit', title: talkPage, summary: summary, token: mw.user.tokens.get('editToken'), appendtext: message, format: 'json'};
				var $this = $(this);
				$.post(mw.util.wikiScript('api'), param, function(){$this.remove();});
			})
		)
		.after(' | ')
	});
});	
// </source>
// הוסף אפשרות "הסתר כותרות" או"הצג כותרות" מתחת כותרת הדף בדפים שינויים אחרונים, רשימת המעקב, תרומות המשתמש והיסטוריית הדף.
// <source lang="javascript">
if (wgNamespaceNumber === -1 || wgAction === 'history') $(document).ready(function() {
	var	stuffToHideSelector = window.stuffToHideSelector || '.rcoptions, #Recentchangestext, #mw-watchlist-options, .mw-contributions-form, #mw-history-searchform, .mw-history-legend',
		cookieName = 'hideHeaders_' + (wgCanonicalSpecialPageName || 'history');
	if (! $(stuffToHideSelector).length)
		return;
		
	var hide = $.cookie(cookieName) === "true";
	
	function hideOrShow() {
		$(stuffToHideSelector).toggle(!hide);
	}
	
	function toggle() {
		hide = ! hide;
		$.cookie(cookieName, hide.toString(), {path:'/', expires: 30});
		hideOrShow();
	}
	
	function prompt() { return hide ? 'הצגת כותרות' : 'הסתרת כותרות';}

	var link = $('<a>', {href: '#'})
		.text(prompt())
		.click(function(){
			toggle(); 
			$(this).text(prompt());
		});
		
	if (hide)
		hideOrShow();
	if ($('#contentSub a').length)
		$('#contentSub a:last').after(link).after(' | ');
	else
		$('#contentSub').append(link);
});
// </source>

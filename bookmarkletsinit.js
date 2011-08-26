function create_bookmarklets() {
	var stubparts = [
		"javascript:(function(){if(typeof(", 
		")=='undefined'){var s=document.createElement('script');s.setAttribute('src','http://he.wikipedia.org/w/index.php?title= ",
		"&action=raw&ctype=text/javascript&dontcountme=s');document.getElementsByTagName('body')[0].appendChild(s);}else ",
		"();})()"
	];
	var bookmarklets = [
		{func: 'wikiit', sourcepage: 'משתמש:שמוליק/קישורים חיצוניים/chrome.js'  , name: 'תבנית לויקיפדיה', description: 'יצירת תבנית קישור ממאמרים ב"הארץ", nrg, ynet ועוד: '},
		{func: 'coords', sourcepage: 'משתמש:קיפודנחש/common.js/coords.js', name: 'תבנית coord', description: 'יצירת תבנית coord ממפה של גוגל או עמוד ענן (ראו הוראות למטה): '}
	];
	var $ol = $("#bmList ol:first");
	$ol.contents().remove();
	$(bookmarklets).each(function(idx, item){
		$("<li>").text(item.description)
		.append(
			$("<a>",
				{
				"href": stubparts[0] + item.func + stubparts[1]+ item.sourcepage + stubparts[2] + item.func + stubparts[3],
				"click": bookmarlets_wrong,
				"text" : item.name
				}
			)
		).appendTo($ol)
	});
	
	function bookmarlets_wrong(e)
	{
		e.preventDefault();
		alert('את הקישור יש לגרור לסרגל המועדפים, ולהפעיל באתרים המתאימים.\nקישור זה לא מיועד להפעלה מתוך ויקיפדיה. למידע נוסף קרא את ההוראות בדף.');
	}
	
};

addOnloadHook(create_bookmarklets);
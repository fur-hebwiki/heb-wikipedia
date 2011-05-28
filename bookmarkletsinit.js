function create_bookmarklets() {
	var stubparts = [
		"javascript:(function(){if(typeof(", 
		")=='undefined'){var s=document.createElement('script');s.setAttribute('src','http://he.wikipedia.org/w/index.php?title=",
		"&action=raw&ctype=text/javascript&dontcountme=s');document.getElementsByTagName('body')[0].appendChild(s);}else ",
		"();})()"
	];
	var bookmarklets = [
		{func: 'wikiit', sourcepage: 'משתמש:שמוליק/קישורים חיצוניים/chrome.js', name: 'צור תבניות לויקי', description: 'יצירת תבנית קישור ממאמרים ב"הארץ", נרג, טמקא ועוד: '},
		{func: 'coords', sourcepage: 'משתמש:קיפודנחש/common.js/coords.js', name: 'מציאת קואורדינטות', description: 'יצירת תבנית coord ממפה של גוגל מפות או עמוד ענן: '},
	];
	
	var lists = document.getElementById('bmList').getElementsByTagName('ol'),
		list = lists[0];
	while (list.firstChild)
		list.removeChild(list.firstChild);
	for (var bmi in bookmarklets) {
		var bm = bookmarklets[bmi];
		var li = document.createElement('li');
		var a = document.createElement('a');
		a.href = stubparts[0] + bm.func + stubparts[1] + bm.sourcepage + stubparts[2] + bm.func + stubparts[3];
		a.innerHTML = bm.name;
		li.appendChild(document.createTextNode(bm.description));
		li.appendChild(a);
		list.appendChild(li);
	}
}

if (wgPageName == 'משתמש:קיפודנחש/בוקמרקלטים')
	addOnloadHook(create_bookmarklets);

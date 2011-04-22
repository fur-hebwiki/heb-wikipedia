var specialContribs = {
	/*
	"94.159.166.231":{color:'black'},
	"94.159.166.232":{fontWeight:'bold'},
	"94.159.166.233":{font-style: 'italic'},
	"94.159.166.234":{fontSize:'2em'},
	**/"77.125.102.3":{border: 'solid red 1px'},/*
	
	"94.159.166.236":{replaceWith: 'מוישה זוכמיר'},
	"94.159.166.237":{comment:'אני מכיר אותו עוד מקפריסין'},
	
	"94.159.166.238":{color:'black',fontWeight:'bold',font-style:'italic',fontSize:'2em',border:'solidred2px'replaceWith:'מוישהזוכמיר',comment:'אנימכיראותועודמקפריסין'},
	
	"קיפודנחש": {replaceWith: "סתם נודניק"},
	"דוד שי": {comment: 'אדוננו, מורנו ורבנו', color: '#808080', fontSize: '2em',border:"solid black 2px", fontWeight:'bold', replaceWith:'חד, יחיד ומיוחד'},
	*/	
} 

function markContributors() {
	var contribList = getElementsByClassName(document.getElementById('bodyContent'), 'A', 'mw-userlink');
	for (var i = 0; i < contribList.length; i++) {
		var item = contribList[i];
		var name = item.innerHTML;
		var attribs = specialContribs[name]; 
		if (attribs) 
			for (var key in attribs)
				if (key == 'replaceWith')
					item.innerHTML = attribs[key]; 
				else if (key == 'comment')
					item.title = attribs[key];
				else
					item.style[key] = attribs[key]; 
	}	
}

switch (wgCanonicalSpecialPageName) {
	case "Recentchanges":
	case "Watchlist":
	case "Recentchangeslinked":
		addOnloadHook(markContributors);
		break;
}
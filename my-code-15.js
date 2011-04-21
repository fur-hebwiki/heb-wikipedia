// סקריפט 15: מתוך [[ויקיפדיה:סקריפטים/15]]
// מוסיף קישור "הסר" תחת הכותרת "קישורי תמונות" בדפי תמונה. לחיצה על הקישור תסיר את התמונה מהערך. עובד ב-IE בלבד.
// created by [[user:Yonidebest]]

function addRemoveImageLinks() {
	// add the link to image pages
	if (wgNamespaceNumber == 6 && wgAction == 'view') {
		var ul = getElementsByClassName(document, 'UL', 'mw-imagepage-linkstoimage');
		if (!ul) 
			return;
		var lis = ul[0].getElementsByTagName('LI');
		for (var i = 0; i < lis.length; i++) {
			link = document.createElement('A');
			link.href = '/w/index.php?title=' + lis[i].childNodes[0].title + '&action=edit&removeimage=yes&name=' + encodeURIComponent(wgTitle);
			link.appendChild(document.createTextNode('הסרש'));
			lis[i].appendChild(document.createTextNode(' ('));
			lis[i].appendChild(link);
			lis[i].appendChild(document.createTextNode(')'));
		}
	}
}
	 // remove image and save
 if (getParamValue('removeimage') == 'yes') {
	var imageName = decodeURIComponent(getParamValue('name'));
	if (imageName) {
		var mImageName = imageName.replace(/ /g,'[ _]');
		var rx = /\[\[\s*:?(‏image|תמונה|קובץ|file).*:.*IMAGENAME([^\[\]]*|\[[^\[\]]*\]|\[\[[^\[\]]*\]\])*\]\]/ig;
		rx = new RegExp(rx.source.replace('IMAGENAME', mImageName), "ig");
		document.editform.wpTextbox1.value = document.editform.wpTextbox1.value.replace(rx, '');
		document.editform.wpSummary.value = 'הסרת [[קובץ:' + imageName + ']]';
//			document.editform.wpSave.click();
	}
}

addOnloadHook(addRemoveImageLinks);

// עד כאן סקריפט 15

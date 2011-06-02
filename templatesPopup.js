//Adds wizard for using templates for external links
//Written by [[User:קיפודנחש]]

function ltw_createTemplate() {
	var par = ["{{" + this.templateName];
	for (var i in this.orderedFields)
		par.push((this.problematic? (parseInt(i)+1) + "=":"") + $.trim(this.orderedFields[i].value));
	if (this.defParam)
		for (var parnum in this.defParam)
			if (par[parnum] == this.defParam[parnum])
				par[parnum] = '';
	while (par.length && !par[par.length-1].length && this.orderedFields[par.length-2].type) // remove tailing empty ordered params.
		par.pop();
	var code = par.join("|");
	if (this.namedFields) {
		var pairs = ['']; // so we'll get the firs bar
		for (j in this.namedFields) {
			var val = $.trim(this.namedFields[j][1].value);
			if (val.length > 0)
				pairs.push(this.namedFields[j][0] + '=' + val);
		}
		if (pairs.length > 1)
			code += pairs.join('|');
	}
	code += "}}";
	if (this.refCheckBox.checked)
		return "{{הערה|1=" +  code + "}}";
	if (this.listCheckBox.checked)
		return "\n* " + code + "\n";
	return code;
}

function ltw_copyAttributes(target, source) {for (key in source)target[key] = source[key];return target;}





function ltw_knownLinkTemplates() {
	var constants = ["",
		"שם המחבר",
		"כותרת  המאמר",
		"מספר (כפי שמופיע בקישור)",
		"מידע נוסף (למשל תאריך)",
		"מספר הסדרה",
		"נתיב הדף - כמו שמופיע בקישור",
		"מידע נוסף (לא תאריך)",
		"ספר",
		"פרק",
		"פסוק",
		"מסכת",
		"דף",
		"עמוד",
		"משנה",
		"סימן",
		"סעיף",
		"הלכות",
		"שם",
		"מספר הסדרה",
		'מספר סדרת "ART"',
		"",
		"תאריך כתבה, בצורה 1949/07/25<br/>כפי שמופיע בקישור",
		"סוג הפרסום, כפי שמופיע בקישור אחרי '=EntityId'. בדרך כלל 'Ar' לכתבה רגילה, 'Pc' לתמונה ו־'Ad' לפרסומת",
		"שם הספר",
		"קידומת סוג הכתבה",
		"מזהה נושא הכתבה",
		"שם הערך",
		"קוד כניסה חינם (כפי שמופיע בקישור)",
		"כרך",
		"הפניה לכתבה (כפי שמופיע בקישור)",
		"הלכה",
		"",
		"חלק",
		"כותרת הדף",
		"שם החלל",
		"מספר ה-folder כמו שמופיע בקישור",
		"כותרת הספר/שם הקהילה",
		"מספר גיליון, תאריך פרסום ומספרי עמודים",
		"החלק השני של הקישור",
		"מספר העמוד, כפי שמופיע באתר",
		"שם האיש",
		"שם האמן",
		"שם העיתון",
		"קוד העיתון באתר (שלוש אותיות לטיניות גדולות)",
		"שם המין/זן",
		"שם הרב",
		"שם השיעור",
		"השיעור כשם שמופיע בקישור",
		"מספר גיליון, תאריך פרסום ומספרי עמודים (אופציונלי)"
	];

	var templatesDic = {
		"הארץ": [1, 2, 3, 4],
		"דבר": [1,2,22,3,7,0,23],
		"מעריב": [1,2,22,3,7,0,23],
		"הצבי": [1,2,22,3,7,0,23],
		"הצפירה": [1,2,22,3,7,0,23],
		"המגיד": [1,2,22,3,7,0,23],
		"חבצלת": [1,2,22,3,7,0,23],
		"המליץ": [1,2,22,3,7,0,23],
		"PalPost": [1,2,22,3,7,0,23],
		'תנ"ך': [8,9,10],
		"nrg": [1,2,3,4,0,19,20],
		"Mooma2": [42,3],
		"בחדרי חרדים": [1,2,3,4],
		"CIA factbook":["האותיות שמציינות את המדינה"],
		"HebrewBooks":[1,8,3,4],
		"mynet":[1,2,3,4,0,5],
		"NFC":[1,2,3,4],
		"Onlife":[1,2,3,4],
		"ynet":[1,2,3,4,0,5,25],
		"Xnet":[1,2,3,4,0,5,25],
		"וואלה!":[1,2,3,4,0,26],
		"גלובס":[1,2,3,4],
		"כלכליסט":[1,2,3,4,0,19],
		"נענע10":[1,2,3,4,0,26],
		"אנציקלופדיה ynet":[27,3,28,4],
		"תדהר":[29,13,27],
		"אנשים ישראל":[1,2,3,4],
		"אתר חיל האוויר":[1,2,3,4],
		"בלדד השוחי":[3,2,4],
		"בשבע":[1,2,3,4],
		"האייל הקורא":[1,2,3,4],
		"הידען":[1,2,30,4],
		"המאסף":[1,2,3,4],
		"חסקין":[3,2],
		"בבלי":[11,12,13],
		"משנה":[11,9,14],
		'רמב"ם':[8,17,9,31],
		"ירושלמי":[11,9,31],
		"שולחן ערוך":[33,15,16],
		"מטח":[1,2,3,4],
		"גלצ":[1,2,3,4],
		"ישראל היום":[1,2,3,4],
		"מממ":[1,2,3,4],
		"מממ2":[1,2,3,4],
		"משנה תורה":[12,3,34],
		"נזכור":[35,3],
		"סגולה":[1,2,3,4],
		"ספורט 5":[1,2,3,36,4],
		"ספסל":[3,18,0],
		"ספסל מאמן":[3,18,0],
		"ספרי יזכור":[1,37,3,4],
		"הספרייה הדיגיטלית":[1,24,3,4],
		"אורות":[1,2,3,4],
		"הערוץ האקדמי":[1,34,3,4],
		"עכבר העיר":[1,2,3,4],
		"ערוץ7":[1,2,3,4],
		"פעמים":[1,2,3,38],
		"תכלת":[1,2,3,4],
		"אנצ דעת":[3,27],
		"דעת":[1,39,2],
		"ויקישיבה":["שם הערך בויקישיבה"],
		"HebrewBooksPage": [1,8,3,4,40],
		"גדולי ישראל": [29,40,41,13],
		"פנאי פלוס": [1,2,3,4,0,5,25],
		"עיתונות יהודית היסטורית 2": [43,44,1,2,22,3,7,0,23],
		"Iucnredlist": [45,3],
		"העין השביעית": [1,34,6,4,25],
		"One": [1,2,3,4],
		"קול הלשון - שיעור" : [46,47,48,4],
		"ספר פרויקט גוטנברג": [],
		"imdb title": [],
		"imdb name": [],
		"imdb company": [],
		"Google book": [],
		"TheMarker1": [1,2,3,4],
		"מערכות": [1,2,3,49]
	};
	for (var key in templatesDic)
		for (var i in templatesDic[key])
			if (typeof(templatesDic[key][i]) == "number")
				templatesDic[key][i] = constants[templatesDic[key][i]];
	if (typeof privateTemplates === "object")
		ltw_copyAttributes(templatesDic, privateTemplates);
	return templatesDic;
}

function ltw_namedParams(templateName) {
	var allNamedParam = {
		'קול הלשון - שיעור': [['וידאו', '"וידאו": רשמו "כן" אם זה שיעור לצפייה'], ['תואר', 'תואר - אם תואר המרצה שונה מ"הרב"']],
		"ספר פרויקט גוטנברג": [["כותב", "שם כותב הספר (אופציונלי)"], ['שם הספר', 'שם הספר (ברירת מחדל: שם הערך)'], ['מספר', 'מספר הספר בפרויקט']],
		"imdb title": [['id', 'המספר שמופיע בקישור'], ['title', 'הכותרת שתופיע בקישור (אופציונלי: ברירת מחדל - שם הערך']],
		"imdb name": [['id', 'המספר שמופיע בקישור'], ['name', 'הכותרת שתופיע בקישור (אופציונלי: ברירת מחדל - שם הערך']],
		"imdb company": [['id', 'המספר שמופיע בקישור'], ['company', 'הכותרת שתופיע בקישור']],
		"Google book": [['מזהה','מזהה הספר באתר גוגל'],['כותב','שם כותב/י הספר (אופציונלי)'],['שם הספר','שם הספר (אופציונלי) - ללא הפרמטר יוצג שם הערך']],
		"TheMarker1": [['5','קידומת הקישור, אם שונה מ-www']]
	};
	return allNamedParam[templateName] || [];
}

function ltw_defaultParameters(templateName) { // if parameter has the default value, we omit it
	var defs = {
		"דבר": {7: "Ar"}, 
		"מעריב": {7: "Ar"},
		"הצבי": {7: "Ar"},
		"הצפירה": {7: "Ar"},
		"המגיד": {7: "Ar"},
		"המליץ": {7: "Ar"},
		"חבצלת": {7: "Ar"},
		"PalPost": {7: "Ar"},
		"עיתונות יהודית היסטורית 2": {9: "Ar"},		
		"ynet": {6: 0, 7: 'articles'},
		"Xnet": {6: 0, 7: 'articles'},
		"פנאי פלוס": {6: 0, 7: 'articles'}
	}
	return defs[templateName] || {};
}

function ltw_templateRegex(templateName) {
	var regexes = {
		"nrg": {regex: /\/online\/([^\/]+)\/ART([^\/]*)\/([^\.]+).html/i, params:[6,7,3]},
		"NFC": {regex: /Archive\/([^\.]+)\.html/i, params:[3]},
		"HebrewBooks": {regex: /hebrewbooks\.org\/(\d+)/i, params:[3]},
		"mynet": {regex: /articles\/(\d+),7340,L-(\d+),00\.html/i, params:[6,3]},
		"Onlife": {regex: /onlife\.co\.il\/([^\/]+)\/(.*)/i, params:[1,3]},
		"PalPost": {regex: /BaseHref=PLS\/(\d{4}\/\d{1,2}\/\d{1,2})&EntityId=Ar(\d+)/i, params:[3,4]},
		"ynet": {regex: /ynet\.co\.il\/([^\/]+)\/(\d+),7340,L-(\d+),00.html/i, params:[7,6,3]},
		"Xnet": {regex: /([^\/]+)\/(\d+),\d+,L-(\d+),00.html/i, params:[7,6,3]},
		"Mooma2": {regex: /\?ArtistId=(\d+)/i, params:[2]},
		"HebrewBooksPage": {regex: /pdfpager\.aspx\?.*req=(\d+).*&pgnum=(\d+)/i, params:[3,5]},
		"בחדרי חרדים" : { regex: /\/Article\.aspx\?id=(\d+)/i, params:[3]},
		"וואלה!": {regex: /\?w=\/(\d+)\/(\d+)/i, params:[6,3]},
		"גלובס": {regex: /\/news\/article.aspx\?did=(\d+)/i, params:[3]},
		"כלכליסט": {regex: /\/articles\/(\d+),7340,L-(\d+),00/i, params:[6,3]},
		"נענע10": {regex: /http:\/\/([a-z]*)\.nana10\.co\.il\/Article\/\?ArticleID=(\d+)/i, params:[6,3]},
		"אנציקלופדיה ynet": {regex: /\/yaan\/0,7340,L-(\d+)-([^-]*)-FreeYaan,00.html/i, params:[2,3]},
		"אנשים ישראל": {regex: /.*itemID=(\d+)&/i, params:[3]},
		"אתר חיל האוויר": {regex: /\/([^\/]*)-he\//i, params:[3]},
		"בלדד השוחי": {regex: /ArticleID(\d*)/i, params:[1]},
		"בשבע": {regex: /Article.aspx\/(\d+)/i, params:[3]},
		"האייל הקורא": {regex: /story(?:_|\?id=)(\d+)/i, params:[3]},
		"הידען": {regex: /hayadan\.org\.il\/([^\/]*)/i, params:[3]},
		"המאסף": {regex: /notimportant\.co\.il\/?p=(\d+)/i, params:[3]},
		"חסקין": {regex: /ArticleNum=(\d+)/i, params:[1]},
		"הארץ": {regex: /(?:spages\/|itemNo=)(\d+)/i, params:[3]},
		"גלצ": {regex: /NewsArticle\.aspx\?NewsId\=(\d+)/i, params:[3]},
		"ישראל היום": {regex: /newsletter_article\.php\?id=(\d+)/i, params:[3]},
		"מממ": {regex: /data\/pdf\/([^\.])\.pdf/i, params:[3]},
		"מממ2": {regex: /data\/docs\/([^\.])\.rtf/i, params:[3]},
		"משנה תורה": {regex: /mechon-mamre.org\/\i\/(\d+)\.htm/i, params:[2]},
		"נזכור": {regex: /HalalKorot\.aspx\?id=(\d+)/i, params:[2]},
		"סגולה": {regex: /view-article\.asp\?article=(\d+)/i, params:[3]},
		"ספורט 5": {regex: /articles\.aspx\?FolderID=(\d+)&docID=(\d+)/i, params:[4,3]},
		"ספסל": {regex: /hplayer\.aspx\?id=(\d+)/i, params:[1]},
		"ספסל מאמן": {regex: /hstaff\.aspx\?id=(\d+)/i, params:[1]},
		"ספרי יזכור": {regex: /yizkor\.nypl\.org\/index\.php\?id=(\d+)/i, params:[3]},
		"הספרייה הדיגיטלית": {regex: /nnl\/dig\/books\/([^\.]+)\.html/i, params:[3]},
		"אורות": {regex: /Article\.aspx\?ID=(\d+)/i, params:[3]},
		"הערוץ האקדמי": {regex: /programs\/Item\.aspx\?it=(\d+)/i, params:[3]},
		"עכבר העיר": {regex: /CM\.articles_item,(.*),\.aspx/i, params:[3]},
		"ערוץ7": {regex: /News\.aspx\/(\d+)/i, params:[3]},
		"פעמים": {regex: /dbsAttachedFiles\/Article_(.*)\.pdf/i, params:[3]},
		"תכלת": {regex: /article\.php\?id=(\d+)/i, params:[3]},
		":אנצ דעת": {regex: /value\.asp\?id1=(\d+)/i, params:[1]},
		"דעת": {regex: /(?:www\.)?daat\.ac\.il\/(.*)/i, params:[2], problematic:1},
		"פנאי פלוס": {regex: /ynet\.co\.il\/([^\/]+)\/(\d+),7340,L-(\d+),00\.html/i, params:[7,6,3]},
		"עיתונות יהודית היסטורית 2": {regex: /(?:Key|BaseHref)=([A-Z]{3})\/(\d{4}\/\d{1,2}\/\d{1,2})(?:.*&EntityId=|\/\d+\/)([A-Z][a-z])(\d+)/i, params:[2,5,9,6], replace: [[/%2F/gi, '/']]},
		"Iucnredlist": {regex: /details(?:\.php)?\/(\d+)/, params: [2]},
		"העין השביעית": {regex: /the7eye\.org\.il\/([^\/]+)\/Pages\/(.*)\.aspx/, params: [5,3]},
		"One": {regex: /(?:Article[\d\-\/,]*\/|id=)([\d\-\/,]*\d)/, params: [3]},
		"קול הלשון - שיעור": {regex: /(?:PathFile=|Source=)([^&]*)/i, params:[3]},
		"ספר פרויקט גוטנברג": {regex: /ebooks\/(\d+)/i, params: [3]},
		"imdb title": {regex: /title\/tt(\d+)/i, params: [1]},
		"imdb name": {regex: /name\/nm(\d+)/i, params: [1]},
		"imdb company": {regex: /company\/co(\d+)/i, params: [1]},
		"Google book" : {regex: /id=([^&]*)/, params: [1]},
		"TheMarker1": {regex: /http:\/\/(?:www)?(.*)\.themarker\.com\/([^\?]+)/i, params: [5,3]},
		"מערכות": {regex: /FILES\/(.*)\.pdf/i, params: [3]}
	}

	// these guys are all the same - it's best to handle them as such.
	var historic = {"דבר": "DAV", "מעריב": "MAR", "הצבי": "HZV", "הצפירה": "HZF", "המגיד": "MGD", "המליץ": "HMZ", "חבצלת": "HZT", "PalPost": "PLS"};
	var histregex = {regex: /=HISTNAME\/(\d{4}\/\d{1,2}\/\d{1,2})(?:.*&EntityId=|\/\d+\/)([A-Z][a-z])(\d+)/i, params:[3,7,4], replace: [[/%2F/gi, '/']]};
	for (var template in historic) {
		var lr = ltw_copyAttributes({}, histregex);
		lr.regex =  new RegExp(lr.regex.source.replace("HISTNAME", historic[template]));
		regexes[template] = lr;
	}
	if (typeof privateRegexes === "object")
		ltw_copyAttributes(regexes, privateRegexes);
	return regexes[templateName];
}

function ltw_addFiledToTable(doc, table, param) {
	var row = table.insertRow(-1) || table[rows[table.rows.length-1]];
	var cell = row.insertCell(-1) || row.cells[0];
	cell.innerHTML = param;
	cell.style.maxWidth = "16em";
	var field = ltw_copyAttributes(doc.createElement("input"), {type: "text", maxLength: 120, doc: doc});
	field.onkeyup = field.onmouseup = field.onfocus = field.onblur = ltw_updatePreview;
	field.style.width = "20em";
	cell = row.insertCell(-1) || row.cells[1];
	cell.appendChild(field);
	return field;
}

function ltw_hasBookMarklet(template) {
	return $.inArray(template, ['ynet', 'הארץ', 'nrg', 'וואלה!', 'ערוץ 7', 'נענע10', 'גלובס', 'עכבר העיר', 'הערוץ האקדמי', 'העין השביעית', 'Xnet' ,'One', 'בחדרי חרדים']) + 1;
}

function ltw_popupPredefinedLinkTemplate(templateName, paramList, regexDict) {
	var hasBookmarklet = ltw_hasBookMarklet(templateName);
	var namedParamsList = ltw_namedParams(templateName);
	var height = 160 + 20 * (paramList.length + namedParamsList.length) + (regexDict ? 60 : 0) + (hasBookmarklet ? 60 : 0);
	for (i in paramList)
		height += 16 * Math.floor(paramList[i].length / 24);
	var top = (screen.height - height) / 2, left = (screen.width - 550) / 2;
	var popup = window.open("", "", "resizable=1,height="+height+",width=550,left="+left+",top="+top);
	var doc = ltw_copyAttributes(popup.document, {
		title: " הוספת תבנית: " + templateName, 
		dir: "rtl", 
		templateName: templateName, 
		orderedFields: [], 
		getTemplate: ltw_createTemplate, 
		updatePreview: function(){this.previewNode.data = this.getTemplate();},
		problematic: regexDict && regexDict.problematic,
		defParam: ltw_defaultParameters(templateName)
	});
	var body = doc.body;
	if (hasBookmarklet) {
		var p = doc.createElement("p");
		p.style.color = 'red';
		p.appendChild(doc.createTextNode('קיים בוקמרקלט שמייצר תבנית זו באופן אוטומטי. אנא שקלו להשתמש בו.'));
		body.appendChild(p);
	}
	if (regexDict) {
		body.appendChild(doc.createTextNode('הדביקו את הקישור כאן:'));
		var b = doc.createElement("input");
		b.urlInput = doc.createElement("input");
		ltw_copyAttributes(b.urlInput, { type: "text", maxLength: 600 } );
		b.urlInput.style.width = "12em";
		body.appendChild(b.urlInput);
		ltw_copyAttributes(b, {type: "button", value: "חילוץ פרמטרים מהקישור", regexDict: regexDict, doc: doc, update: ltw_updatePreview });
		b.onclick = function() {
			var str = this.urlInput.value;
			if (this.regexDict.replace)
				for (var r in this.regexDict.replace)
					str = str.replace(this.regexDict.replace[r][0], this.regexDict.replace[r][1]);
			var matches = str.match(this.regexDict.regex);
			var orderedFields = this.doc.orderedFields, namedFields = this.doc.namedFields;
			var numOrdered = orderedFields.length, numNamed = namedFields.length;
			if (matches)
				for (var i = 1; i < matches.length; i++) {
					var fieldIndex = this.regexDict.params[i-1] - 1; //parameters are counted from one, we count from 0.
					if (fieldIndex < numOrdered)
						orderedFields[fieldIndex].value = matches[i] || '';
					else if (fieldIndex < numOrdered + numNamed)
						namedFields[fieldIndex-numOrdered][1].value = matches[i] || '';
				}
			this.update();
		}
		body.appendChild(b);
		body.appendChild(doc.createElement("hr"));
	}
	var table = doc.createElement("table");
	for (var i in paramList) {
		var param = paramList[i];
		if (param.length == 0) { // this allow defining an empty parameter. by use of a "pseudo field".
			doc.orderedFields.push({value:""});
			continue;
		}
		doc.orderedFields.push(ltw_addFiledToTable(doc, table, param));
	}
	doc.namedFields = [];
	for (var i in namedParamsList) {
		var np = namedParamsList[i];
		doc.namedFields.push([np[0], ltw_addFiledToTable(doc, table, np[1])]);
	}
	body.appendChild(table);
	body.appendChild(doc.createElement("p"));
	var p = doc.createElement("p");
	var checkboxes = {refCheckBox: " הערת שוליים:", listCheckBox: " פריט ברשימה:"}
	for (var box in checkboxes) {
		p.appendChild(doc.createTextNode(checkboxes[box]));
		doc[box] = ltw_copyAttributes(doc.createElement('input'), {type: "checkbox", doc: doc, onchange: ltw_updatePreview});
		p.appendChild(doc[box]);
	}
	body.appendChild(p);
	body.appendChild(p = doc.createElement("p"));
	ltw_copyAttributes(p.style, {background: "blue", color: "white", fontSize: "0.85em"} );
	p.appendChild(doc.previewNode = doc.createTextNode(' '));
	body.appendChild(doc.createElement("p"));
	b = ltw_copyAttributes(doc.createElement("input"), {type:"button", value:"אישור", doc: doc, popup: popup});
	doc.problematic = regexDict && regexDict.problematic && true;
	b.onclick = function() {
		insertTags("", this.doc.getTemplate(), "");
		this.popup.close();
	}
	body.appendChild(b);
	b = ltw_copyAttributes(doc.createElement("input"), {type: "button", value: "ביטול", popup: popup, onclick: function(){this.popup.close();}});
	body.appendChild(b);
	doc.refCheckBox.onchange();
}

function ltw_fireLinkTemplatePopup(templateName) {
	var linkTemplates = ltw_knownLinkTemplates();
	var templateParams = linkTemplates[templateName];
	ltw_popupPredefinedLinkTemplate(templateName, templateParams, ltw_templateRegex(templateName));
}

function ltw_createSortedTemplatesList() {
	var fullList = ltw_knownLinkTemplates();
	var names = [], hnames = [];
	for (x in fullList)
		if (x.match(/^[a-zA-Z]/))
			names.push(x);
		else
			hnames.push(x);
	hnames.sort();
	names.sort(function(a,b){var la=a.toLowerCase(),lb=b.toLowerCase();return la>lb?1:la<lb?-1:0;});
	return hnames.concat(names);
}

function ltw_createLinkTemplatesSelections() {
	var select = document.createElement("select");
	select.onchange = function() {
		ltw_fireLinkTemplatePopup(this.value);
		this.selectedIndex = 0;
		return false;
	}
	select.options.add(new Option("אשף תבניות קישורים", ""));
	var allnames = ltw_createSortedTemplatesList();
	for (var i in allnames)
		select.options.add(new Option(allnames[i], allnames[i]));
	var toolbar = document.getElementById("toolbar");
	if (toolbar)
		toolbar.appendChild(select);
}

function ltw_updatePreview() { this.doc.updatePreview(); }

function ltw_advancedFire(context) {
	ltw_fireLinkTemplatePopup(this.template);
}

function ltw_createAdvanceToolKit() {
    var gadget = {label: 'אשף תבניות קישורים', type: 'select', list: []};
	var templatesList = ltw_createSortedTemplatesList();
	for (var i in templatesList)
        gadget.list.push({label: templatesList[i], action: {type: 'callback', execute: ltw_advancedFire, template: templatesList[i]}});
	$j('#wpTextbox1').wikiEditor('addToToolbar', {
		'section': 'advanced',
		'group': 'heading',
		'tools': {'linkTemplateWizard': gadget}
	});
}

if (typeof $j != 'undefined' && typeof $j.fn.wikiEditor != 'undefined')
	$j(document).ready(ltw_createAdvanceToolKit);
if (wgAction == 'edit')
	hookEvent("load", ltw_createLinkTemplatesSelections);
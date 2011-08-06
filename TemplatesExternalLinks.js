//Adds wizard for using templates for external links
//Written by [[User:קיפודנחש]]
function ltw2_knownLinkTemplates() {
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
		"תאריך כתבה (לדוגמה, 1949/07/25), כפי שמופיע בקישור",
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
		'קישור כללי': [],
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
		"מערכות": [1,2,3,49],
		"mako": [1,2,3,6,4]
	};
	for (var key in templatesDic)
		for (var i in templatesDic[key])
			if (typeof(templatesDic[key][i]) == "number")
				templatesDic[key][i] = constants[templatesDic[key][i]];
	if (typeof privateTemplates === "object")
		$.extend(templatesDic, privateTemplates);
	return templatesDic;
}
 
function ltw2_namedParams(templateName) {
	var allNamedParam = {
		'קול הלשון - שיעור': [['וידאו', '"וידאו": רשמו "כן" אם זה שיעור לצפייה'], ['תואר', 'תואר - אם תואר המרצה שונה מ"הרב"']],
		"ספר פרויקט גוטנברג": [["כותב", "שם כותב הספר (אופציונלי)"], ['שם הספר', 'שם הספר (ברירת מחדל: שם הערך)'], ['מספר', 'מספר הספר בפרויקט']],
		"imdb title": [['id', 'המספר שמופיע בקישור'], ['title', 'הכותרת שתופיע בקישור (אופציונלי: ברירת מחדל - שם הערך']],
		"imdb name": [['id', 'המספר שמופיע בקישור'], ['name', 'הכותרת שתופיע בקישור (אופציונלי: ברירת מחדל - שם הערך']],
		"imdb company": [['id', 'המספר שמופיע בקישור'], ['company', 'הכותרת שתופיע בקישור']],
		"Google book": [['מזהה','מזהה הספר באתר גוגל'],['כותב','שם כותב/י הספר (אופציונלי)'],['שם הספר','שם הספר (אופציונלי) - ללא הפרמטר יוצג שם הערך']],
		"TheMarker1": [['5','קידומת הקישור, אם שונה מ-www']],
		'קישור כללי': [
			['כתובת', 'הקישור (כלומר ה-URL) עצמו'],
			['כותרת', 'שם המאמר המקושר'],
			['הכותב', 'שמות כותבי המאמר'],
			['תאריך', 'תאריך המאמר'],
			['עמודים', 'מספר העמודים'],
			['שפה', 'שפה (אם המאמר לא בעברית)'],
			['פורמט', 'פורמט המאמר, אם אינו HTML (למשל PDF, DOC, וכן הלאה'],
			['ציטוט', 'ציטוט משפט מהדף המקושר (יכול לעזור במציאת הדף בעתיד, אם הקישור ישתנה)']
		]
	};
	return allNamedParam[templateName] || [];
}
 
function ltw2_defaultParameters(templateName) { // if parameter has the default value, we omit it
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
		"Xnet": {6: 0, 7: 'articles'}
	}
	return defs[templateName] || {};
}
 
function ltw2_templateRegex(templateName) {
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
		"דעת": {regex: /(?:www\.)?daat\.ac\.il\/(.*)/i, params:[2]},
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
		"מערכות": {regex: /FILES\/(.*)\.pdf/i, params: [3]},
		"mako": {regex: /www\.mako\.co\.il\/(.*?)\/Article-(.*?)\.htm/i, params: [4,3]}
	}
 
	// these guys are all the same - it's best to handle them as such.
	var historic = {"דבר": "DAV", "מעריב": "MAR", "הצבי": "HZV", "הצפירה": "HZF", "המגיד": "MGD", "המליץ": "HMZ", "חבצלת": "HZT", "PalPost": "PLS"};
	var histregex = {regex: /=HISTNAME\/(\d{4}\/\d{1,2}\/\d{1,2})(?:.*&EntityId=|\/\d+\/)([A-Z][a-z])(\d+)/i, params:[3,7,4], replace: [[/%2F/gi, '/']]};
	for (var template in historic) {
		var lr = $.extend({}, histregex);
		lr.regex =  new RegExp(lr.regex.source.replace("HISTNAME", historic[template]));
		regexes[template] = lr;
	}
	if (typeof privateRegexes === "object")
		$.extend(regexes, privateRegexes);
	return regexes[templateName];
}
 
function ltw2_linkTemplateDialog(dialog, templateName) {
	var
		namedParamsList = ltw2_namedParams(templateName),
		regexDict = ltw2_templateRegex(templateName),
		paramList = ltw2_knownLinkTemplates()[templateName],
		orderedFields = [], 
		namedFields = [],
		table,
		hasBookMarklet = $.inArray(templateName, ['ynet', 'הארץ', 'nrg', 'וואלה!', 'ערוץ 7', 'נענע10', 'גלובס', 'עכבר העיר', 'הערוץ האקדמי', 'העין השביעית', 'Xnet' ,'One', 'בחדרי חרדים','ישראל היום','mako']) + 1,
		empty = {val: function(){return '';}};

 
	function createTemplate() {
		var defParam = ltw2_defaultParameters(templateName);
		var par = ["{{" + templateName];
		
		for (var i in orderedFields) {
			var val = orderedFields[i].val();
			val = $.trim(val).replace('|', '{{!}}');
			if (val.indexOf('=') + 1)
				val = (parseInt(i) + 1) + '=' + val;
			par.push(val);
		}
		for (var parnum in defParam)
			if (par[parnum] == defParam[parnum])
				par[parnum] = '';
		while (par.length && !par[par.length-1].length && orderedFields[par.length-2].length) // last condition is to avoid remving "emptys"
			par.pop();
		var code = par.join("|");
		if (namedFields) {
			var pairs = [];
			for (j in namedFields) {
				var val = $.trim(namedFields[j][1].val()).replace('|', '{{!}}');
				if (val.length)
					pairs.push(namedFields[j][0] + '=' + val);
			}
			if (pairs.length)
				code += '|' + pairs.join('|');
		}
		code += "}}";
		if ($('#ltw2_ref').attr('checked')) 
			return "{{הערה|" +  code + "}}";
		if ($('#ltw2_list').attr('checked'))
			return "\n* " + code + "\n";
		return code;
	}
 

	function updatePreview(){
		$('#ltw2_preview').text(createTemplate());
	}

	function addRow(labelText, paramName) {
		var inputField = $('<input>', {type: 'text', width: 600}).css({width: '28em'}).change(updatePreview);
		var tr = $('<tr>')
			.append($('<td>').text(labelText).css({maxWidth: '20em'}))
			.append($('<td>').css({width: '30em'}).append(inputField));
		if (paramName)
			namedFields.push([paramName, inputField]);
		else
			orderedFields.push(inputField);
		table.append(tr);
	}
	
	function extractParamsFromURL() {
				var str = this.value;
				if (regexDict.replace)
					for (var r in regexDict.replace)
						str = str.replace(regexDict.replace[r][0], regexDict.replace[r][1]);
				var matches = str.match(regexDict.regex);
				var numOrdered = orderedFields.length, numNamed = namedFields.length;
				if (matches)
					for (var i = 1; i < matches.length; i++) {
						var fieldIndex = regexDict.params[i-1] - 1; //parameters are counted from one, we count from 0.
						if (fieldIndex < numOrdered)
							orderedFields[fieldIndex].val(matches[i] || '');
						else if (fieldIndex < numOrdered + numNamed)
							namedFields[fieldIndex-numOrdered][1].val(matches[i] || '');
					}
	}
	
	if (hasBookMarklet) 
		dialog.append($('<p>').css({color: 'red', fontWeight: 'bold'}).text('קיים בוקמרקלט שמייצר תבנית "'  +  templateName + '" באופן אוטומטי. אנא שקלו להשתמש בו.')).append($('<hr>'));
	
	if (regexDict) 
		dialog.append($('<span>').text('הדביקו את הקישור כאן:').css({width: '20em'}))
			.append($('<input>', {type: "text", maxLength: 600}).css({width: '30em'}).change(extractParamsFromURL))
			.append($('<hr>'));
		
	var table = $('<table>');
	for (var i in paramList) 
		if (paramList[i].length == 0)  // this allow defining an empty parameter. by use of a "pseudo field".
			orderedFields.push(empty);
		else
			addRow(paramList[i]);
		
	for (var i in namedParamsList) 
		addRow(namedParamsList[i][1], namedParamsList[i][0]);
	
	dialog.append(table)
		.append($('<p>').css({height: '2em'}))
		.append($('<label>').text(' הערת שוליים '))
		.append($('<input>', {type: 'checkbox', id: 'ltw2_ref'}).change(updatePreview))
		.append($('<label>').css({width: '12em'}).text( ' פריט ברשימה '))
		.append($('<input>', {type: 'checkbox', id: 'ltw2_list'}).change(updatePreview))
		.append($('<p>').css({height: '1.5em'}))
		.append($('<p>', {id: 'ltw2_preview'}).css({background: "lightGreen", fontSize: '120%'}).text(createTemplate()));
	
	dialog.dialog({});
}
 
function ltw2_fireLinkTemplatePopup() {
	var title = 'אשף תבניות קישורים',
		dialog = $('<div>').dialog({
						id: 'ltw_dialog',
						title: title,
						height: 'auto',
						width: 'auto',
						position: [100, 100],
						modal: true,
						close: function() {$(this).remove();},
					}),
		buttons = {};
		
	buttons['אישור'] = function() {insertTags('', '', createTemplate()); dialog.dialog('close');};
	buttons['ביטול'] = function() {dialog.dialog('close');};
	dialog.dialog('option', 'buttons', buttons);
	var selector = $('<select>').change(function() {
		if (this.value) {
			var templateName = this.value;
			dialog.dialog('option', 'title', title + ' - ' + templateName);
			$(this).remove();
			ltw2_linkTemplateDialog(dialog, templateName);
		}
	});
	selector.append($('<option>', {text: 'בחרו תבנית מהרשימה'}));
	var fullList = ltw2_knownLinkTemplates();
	var names = [], hnames = [];
	var first = 'קישור כללי';
	for (var x in fullList)
		if (x.match(/^[a-zA-Z]/))
			names.push(x);
		else
			if (x != first)
				hnames.push(x);
	hnames.sort();
	names.sort(function(a,b){var la=a.toLowerCase(),lb=b.toLowerCase();return la>lb?1:la<lb?-1:0;});
	var allnames = [first].concat(hnames).concat(names);
	for (var i in allnames)
		selector.append($('<option>', {text: allnames[i], value: allnames[i]}));
	dialog.append(selector);
}
 
function ltw2_createLinkTemplatesSelections() {
	mediaWiki.loader.using('jquery.ui.dialog', function () {
		var button = $('<input>', {type: 'button', value: '{{w³}}'}).click(ltw2_fireLinkTemplatePopup);
		$('.group-more').append(button);
		$('div #toolbar').append(button);
	});
}
 
if (wgAction == 'edit')
	hookEvent("load", ltw2_createLinkTemplatesSelections);
//Adds wizard for using templates for external links
//Written by [[User:קיפודנחש]]
if (wgAction == 'edit') $(document).ready(function() {




	
	function templates(templateName) {
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
			"מספר גיליון, תאריך פרסום ומספרי עמודים (אופציונלי)",
			"שם הערך בויקישיבה",
			"קידומת הקישור, אם שונה מ-www"
		];

		var templatesAr = [
			{t: 'קישור כללי', np: [
				['כתובת', 'הקישור (כלומר ה-URL) עצמו'], 
				['כותרת', 'שם המאמר המקושר'],
				['הכותב', 'שמות כותבי המאמר'],
				['תאריך', 'תאריך המאמר'],
				['עמודים', 'מספר העמודים'],
				['שפה', 'שפה (אם המאמר לא בעברית)'],
				['פורמט', 'פורמט המאמר, אם אינו HTML (למשל PDF, DOC, וכן הלאה'],
				['ציטוט', 'ציטוט משפט מהדף המקושר (יכול לעזור במציאת הדף בעתיד, אם הקישור ישתנה)']
			]},
			{t: 'הארץ', p: [1, 2, 3, 4], r: /(?:spages\/|itemNo=)(\d+)/i, rp: [3], bm: 1},
			{t: 'דבר'},
			{t: 'מעריב'},
			{t: 'הצבי'},
			{t: 'הצפירה'},
			{t: 'המגיד'},
			{t: 'חבצלת'},
			{t: 'המליץ'},
			{t: 'PalPost'},
			{t: 'תנ"ך', p: [8,9,10]},
			{t: 'nrg', p: [1,2,3,4,0,19,20], r: /\/online\/([^\/]+)\/ART([^\/]*)\/([^\.]+).html/i, rp: [6,7,3], bm: 1},
			{t: 'Mooma2', p: [42,3], r: /\?ArtistId=(\d+)/i, rp: [2]},
			{t: 'בחדרי חרדים', p: [1,2,3,4], r: /\/Article\.aspx\?id=(\d+)/i, rp: [3], bm: 1},
			{t: 'CIA factbook', p: ["האותיות שמציינות את המדינה"]},
			{t: 'mynet', p: [1,2,3,4,0,5], r: /articles\/(\d+),7340,L-(\d+),00\.html/i, rp: [6,3]},
			{t: 'NFC', p: [1,2,3,4], r: /Archive\/([^\.]+)\.html/i, rp: [3]},
			{t: 'Onlife', p: [1,2,3,4], r: /onlife\.co\.il\/([^\/]+)\/(.*)/i, rp: [1,3]},
			{t: 'ynet', p: [1,2,3,4,0,5,25], def: {6: 0, 7: 'articles'}, r: /ynet\.co\.il\/([^\/]+)\/(\d+),7340,L-(\d+),00.html/i, rp: [7,6,3], bm: 1},
			{t: 'Xnet', p: [1,2,3,4,0,5,25], def: {6: 0, 7: 'articles'}, r: /([^\/]+)\/(\d+),\d+,L-(\d+),00.html/i, rp: [7,6,3], bm: 1},
			{t: 'וואלה!', p: [1,2,3,4,0,26], r: /\?w=\/(\d+)\/(\d+)/i, rp: [6,3], bm: 1},
			{t: 'גלובס', p: [1,2,3,4], r: /\/news\/article.aspx\?did=(\d+)/i, rp: [3], bm: 1},
			{t: 'כלכליסט', p: [1,2,3,4,0,19], r: /\/articles\/(\d+),7340,L-(\d+),00/i, rp: [6,3]},
			{t: 'נענע10', p: [1,2,3,4,0,26], r: /http:\/\/([a-z]*)\.nana10\.co\.il\/Article\/\?ArticleID=(\d+)/i, rp: [6,3], bm: 1},
			{t: 'אנציקלופדיה ynet', p: [27,3,28,4], r: /\/yaan\/0,7340,L-(\d+)-([^-]*)-FreeYaan,00.html/i, rp: [2,3]},
			{t: 'תדהר', p: [29,13,27]},
			{t: 'אנשים ישראל', p: [1,2,3,4], r: /.*itemID=(\d+)&/i, rp: [3]},
			{t: 'אתר חיל האוויר', p: [1,2,3,4], r: /\/([^\/]*)-he\//i, rp: [3]},
			{t: 'בלדד השוחי', p: [3,2,4], r: /ArticleID(\d*)/i, rp: [1]},
			{t: 'בשבע', p: [1,2,3,4], r: /Article.aspx\/(\d+)/i, rp: [3]},
			{t: 'האייל הקורא', p: [1,2,3,4], r: /story(?:_|\?id=)(\d+)/i, rp: [3]},
			{t: 'הידען', p: [1,2,30,4], r: /hayadan\.org\.il\/([^\/]*)/i, rp: [3]},
			{t: 'המאסף', p: [1,2,3,4], r: /notimportant\.co\.il\/?p=(\d+)/i, rp: [3]},
			{t: 'חסקין', p: [3,2], r: /ArticleNum=(\d+)/i, rp: [1]},
			{t: 'בבלי', p: [11,12,13]},
			{t: 'משנה', p: [11,9,14]},
			{t: 'רמב"ם', p: [8,17,9,31]},
			{t: 'ירושלמי', p: [11,9,31]},
			{t: 'שולחן ערוך', p: [33,15,16]},
			{t: 'מטח', p: [1,2,3,4]},
			{t: 'גלצ', p: [1,2,3,4], r: /NewsArticle\.aspx\?NewsId\=(\d+)/i, rp: [3]},
			{t: 'ישראל היום', p: [1,2,3,4], r: /newsletter_article\.php\?id=(\d+)/i, rp: [3], bm: 1},
			{t: 'מממ', p: [1,2,3,4], r: /data\/pdf\/([^\.])\.pdf/i, rp: [3]},
			{t: 'מממ2', p: [1,2,3,4], r: /data\/docs\/([^\.])\.rtf/i, rp: [3]},
			{t: 'משנה תורה', p: [12,3,34], r: /mechon-mamre.org\/\i\/(\d+)\.htm/i, rp: [2]},
			{t: 'נזכור', p: [35,3], r: /HalalKorot\.aspx\?id=(\d+)/i, rp: [2]},
			{t: 'סגולה', p: [1,2,3,4], r: /view-article\.asp\?article=(\d+)/i, rp: [3]},
			{t: 'ספורט 5', p: [1,2,3,36,4], r: /articles\.aspx\?FolderID=(\d+)&docID=(\d+)/i, rp: [4,3]},
			{t: 'ספסל', p: [3,18,0], r: /hplayer\.aspx\?id=(\d+)/i, rp: [1]},
			{t: 'ספסל מאמן', p: [3,18,0], r: /hstaff\.aspx\?id=(\d+)/i, rp: [1]},
			{t: 'ספרי יזכור', p: [1,37,3,4], r: /yizkor\.nypl\.org\/index\.php\?id=(\d+)/i, rp: [3]},
			{t: 'הספרייה הדיגיטלית', p: [1,24,3,4], r: /nnl\/dig\/books\/([^\.]+)\.html/i, rp: [3]},
			{t: 'אורות', p: [1,2,3,4], r: /Article\.aspx\?ID=(\d+)/i, rp: [3]},
			{t: 'הערוץ האקדמי', p: [1,34,3,4], r: /programs\/Item\.aspx\?it=(\d+)/i, rp: [3], bm: 1},
			{t: 'עכבר העיר', p: [1,2,3,4], r: /CM\.articles_item,(.*),\.aspx/i, rp: [3], bm: 1},
			{t: 'ערוץ7', p: [1,2,3,4], r: /News\.aspx\/(\d+)/i, rp: [3], bm: 1},
			{t: 'פעמים', p: [1,2,3,38], r: /dbsAttachedFiles\/Article_(.*)\.pdf/i, rp: [3]},
			{t: 'תכלת', p: [1,2,3,4], r: /article\.php\?id=(\d+)/i, rp: [3]},
			{t: 'אנצ דעת', p: [3,27], r: /value\.asp\?id1=(\d+)/i, rp: [1]},
			{t: 'דעת', p: [1,39,2], r: /(?:www\.)?daat\.ac\.il\/(.*)/i, rp: [2]},
			{t: 'ויקישיבה', p: [50]},
			{t: 'HebrewBooks', p: [1,8,3,4], r: /hebrewbooks\.org\/(\d+)/i, rp: [3]},
			{t: 'HebrewBooksPage', p: [1,8,3,4,40], r: /pdfpager\.aspx\?.*req=(\d+).*&pgnum=(\d+)/i, rp: [3,5]},
			{t: 'גדולי ישראל', p: [29,40,41,13]},
			{t: 'עיתונות יהודית היסטורית 2', p: [43,44,1,2,22,3,7,0,23], def: {9: "Ar"}, r: /(?:Key|BaseHref)=([A-Z]{3})\/(\d{4}\/\d{1,2}\/\d{1,2})(?:.*&EntityId=|\/\d+\/)([A-Z][a-z])(\d+)/i, rp: [2,5,9,6], replace: [[/%2F/gi, '/']]},
			{t: 'Iucnredlist', p: [45,3], r: /details(?:\.php)?\/(\d+)/, rp: [2]},
			{t: 'העין השביעית', p: [1,34,6,4,25], r: /the7eye\.org\.il\/([^\/]+)\/Pages\/(.*)\.aspx/, rp: [5,3], bm: 1},
			{t: 'One', p: [1,2,3,4], r: /(?:Article[\d\-\/,]*\/|id=)([\d\-\/,]*\d)/, rp: [3], bm: 1},
			{t: 'קול הלשון - שיעור', p: [46,47,48,4], np: [['וידאו', '"וידאו": רשמו "כן" אם זה שיעור לצפייה'], ['תואר', 'תואר - אם תואר המרצה שונה מ"הרב"']], r: /(?:PathFile=|Source=)([^&]*)/i, rp: [3]},
			{t: 'ספר פרויקט גוטנברג', np: [["כותב", "שם כותב הספר (אופציונלי)"], ['שם הספר', 'שם הספר (ברירת מחדל: שם הערך)'], ['מספר', 'מספר הספר בפרויקט']], r: /ebooks\/(\d+)/i, rp: [3]},
			{t: 'imdb title', np: [['id', 'המספר שמופיע בקישור'], ['title', 'הכותרת שתופיע בקישור (אופציונלי: ברירת מחדל - שם הערך']], r: /title\/tt(\d+)/i, rp: [1]},
			{t: 'imdb name', np: [['id', 'המספר שמופיע בקישור'], ['name', 'הכותרת שתופיע בקישור (אופציונלי: ברירת מחדל - שם הערך']], r: /name\/nm(\d+)/i, rp: [1]},
			{t: 'imdb company', np: [['id', 'המספר שמופיע בקישור'], ['company', 'הכותרת שתופיע בקישור']], r: /company\/co(\d+)/i, rp: [1]},
			{t: 'Google book', np: [['מזהה','מזהה הספר באתר גוגל'],['כותב','שם כותב/י הספר (אופציונלי)'],['שם הספר','שם הספר (אופציונלי) - ללא הפרמטר יוצג שם הערך']], r: /id=([^&]*)/, rp: [1]},
			{t: 'TheMarker1', p: [1,2,3,4,51], r: /http:\/\/(?:www)?(.*)\.themarker\.com\/([^\?]+)/i, rp: [5,3]},
			{t: 'מערכות', p: [1,2,3,49], r: /FILES\/(.*)\.pdf/i, rp: [3]},
			{t: 'mako', p: [1,2,3,6,4], r: /www\.mako\.co\.il\/(.*?)\/Article-(.*?)\.htm/i, rp: [4,3], bm: 1},
			];
		
		if (! templateName) {
			var en = /^[a-z]/;
			function compare(t1, t2) {
				var gen = 'קישור כללי', a = t1.t.toLowerCase(), b = t2.t.toLowerCase();
				if (a == gen ^ b == gen) return (b == gen) - (a == gen);
				if (en.test(a) - en.test(b)) return en.test(a) - en.test(b); // all hebrew before all english
				return a > b ? 1 : (a < b ? -1 : 0);
			}
			templatesAr.sort(compare);
			return templatesAr;
		}
		
		var template;
		for (var i in templatesAr) 
			if (templatesAr[i].t == templateName) 
				template = templatesAr[i];
		
		for (var i in template.p)
		if (typeof template.p[i] == "number")
			template.p[i] = constants[template.p[i]];
			
		var historic = {"דבר": "DAV", "מעריב": "MAR", "הצבי": "HZV", "הצפירה": "HZF", "המגיד": "MGD", "המליץ": "HMZ", "חבצלת": "HZT", "PalPost": "PLS"};
		if (historic[template.t]) {
			var r = new RegExp('=HISTNAME/(\\d{4}/\\d{1,2}/\\d{1,2})(?:.*&EntityId=|/\\d+/)([A-Z][a-z])(\\d+)'.replace('HISTNAME', historic[template.t]));
			$.extend(template, {p: [1,2,22,3,7,0,23], def: {7: "Ar"}, r: r, rp: [3,7,4], replace: [[/%2F/gi, '/']]});
		}
		return template;
	}

	function templateDialog(dialog, template) {
		var
			orderedFields = [],
			namedFields = [],
			table,
			empty = {val: function(){return '';}};

		function createTemplate() {
			var par = ["{{" + template.t];
			for (var i in orderedFields) {
				var val = orderedFields[i].val();
				val = $.trim(val).replace('|', '{{!}}');
				if (val.indexOf('=') + 1)
					val = (i + 1) + '=' + val;
				par.push(val);
			}
			if (template.def)
				for (var parnum in template.def)
					if (par[parnum] == template.def[parnum])
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

		function updatePreview(){$('#ltw2_preview').text(createTemplate());}

		function addRow(labelText, paramName) {
			var inputField = $('<input>', {id: 'ltw2_inputfield_' + paramName, type: 'text', width: 600}).css({width: '28em'}).bind('input', updatePreview);
			var tr = $('<tr>')
				.append($('<td>').text(labelText).css({maxWidth: '20em'}))
				.append($('<td>').css({width: '30em'}).append(inputField));
			if (typeof paramName == 'number')
				orderedFields.push(inputField);
			else
				namedFields.push([paramName, inputField]);
			table.append(tr);
		}
		
		function extractParamsFromURL() {
			var str = this.value;
			if (template.replace)
				for (var r in template.replace)
					str = str.replace(template.replace[r][0], template.replace[r][1]);
			var matches = str.match(template.r);
			if (matches)
				for (var i = 1; i < matches.length; i++)
					$('#ltw2_inputfield_' + template.rp[i-1]).val(matches[i] || '');
			updatePreview();
		}
		
		if (template.bm)
			dialog.append($('<p>').css({color: 'red', fontWeight: 'bold'}).text('קיים בוקמרקלט שמייצר תבנית "'  +  template.t + '" באופן אוטומטי. אנא שקלו להשתמש בו.')).append($('<hr>'));
		
		if (template.r)
			dialog.append($('<span>').text('הדביקו את הקישור כאן:').css({width: '20em'}))
				.append($('<input>', {type: "text", maxLength: 600}).css({width: '30em'}).bind('input', extractParamsFromURL))
				.append($('<hr>'));
			
		var table = $('<table>');
		
		dialog.append(table); //have to do it here (before adding the rows), otherwise column width comes out wrong.
		
		for (var i in template.p)
			if (template.p[i].length == 0)  // this allow defining an empty parameter. by use of a "pseudo field".
				orderedFields.push(empty);
			else
				addRow(template.p[i], parseInt(i, 10) + 1);
			
		for (var i in template.np)
			addRow(template.np[i][1], template.np[i][0]);
		
		dialog.append($('<p>').css({height: '2em'}))
			.append($('<label>').text(' הערת שוליים '))
			.append($('<input>', {type: 'checkbox', id: 'ltw2_ref'}).change(updatePreview))
			.append($('<label>').css({width: '12em'}).text( ' פריט ברשימה '))
			.append($('<input>', {type: 'checkbox', id: 'ltw2_list'}).change(updatePreview))
			.append($('<p>').css({height: '1.5em'}))
			.append($('<p>', {id: 'ltw2_preview'}).css({backgroundColor: "lightGreen", fontSize: '120%', maxWidth: '40em'}));
		var buttons = {};
		buttons['אישור'] = function() {insertTags('', '', createTemplate()); dialog.dialog('close');};
		buttons['ביטול'] = function() {dialog.dialog('close');};
		dialog.dialog('option', 'buttons', buttons);
		$('.ui-dialog-buttonpane').css({backgroundColor: '#E0E0E0'});
		updatePreview();
		dialog.dialog('option', 'position', [(window.width - dialog.width()) / 2, (window.height - dialog.height()) / 2]);
	}

	function fireDialog() {
		var title = 'יצירת תבנית קישור',
			dialog = $('<div>', {id: 'ltw_dialog'}).css({backgroundColor: '#E8E8E8'}).dialog({
							title: title,
							resizable: false,
							height: 'auto',
							width: 'auto',
							modal: false,
							close: function() {$(this).remove();},
						}),

			selector = $('<select>').change(function() {
				if (this.value) {
					var template = templates(this.value);
					dialog.dialog('option', 'title', title + ' עבור ' + template.t);
					$(this).remove();
					templateDialog(dialog, template);
				}
			});
		
		selector.append($('<option>', {text: 'בחרו תבנית מהרשימה'}));
		var fullList = templates(false);
		for (var i in fullList)
			selector.append($('<option>', {text: fullList[i].t, value: fullList[i].t}));
		dialog.append(selector);
	}

	setTimeout(function() {
		var button = $('<img>', {src: 'http://he.wikipedia.org/skins-1.5/common/images/button_extlink.png', 					   title: 'תבנית קישור'})
		.click(function() {
			mediaWiki.loader.using('jquery.ui.dialog', fireDialog);
		});
		$('div.section-advanced > div:last').append(button);
		$('div #toolbar').append(button);
	}, 1000);
});
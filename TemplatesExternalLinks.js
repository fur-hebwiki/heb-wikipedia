//Adds wizard for using templates for external links
//Written by [[User:קיפודנחש]]
if ($.inArray(wgAction, ['edit', 'submit']) + 1) $(document).ready(function() {





	function templates(templateName) {
		var constants = ["",
			"שם המחבר",
			"כותרת  המאמר",
			"מספר (כפי שמופיע בקישור)",
			"מידע נוסף, למשל תאריך. נסו לשמור על הפורמט '30 באוגוסט 1958'",
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
			"תאריך כתבה (בפורמט 1949/07/25, כפי שמופיע בקישור)",
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
			"מספר גיליון, תאריך פרסום ומספרי עמודים",
			"שם הערך בויקישיבה",
			"קידומת הקישור, אם שונה מ-www",
			"האותיות שמציינות את המדינה"
		];

		var templatesAr = [
			{t: 'קישור כללי', np: [
				['הכותב', 'שמות כותבי המאמר', 1],
				['כותרת', 'שם המאמר המקושר'],
				['כתובת', 'הקישור (כלומר ה-URL) עצמו'],
				['תאריך', 'תאריך המאמר, בפורמט "30 באוגוסט 1958"', 1],
				['עמודים', 'מספר העמודים', 1],
				['מידע נוסף', 'מידע נוסף (לא תאריך)', 1],
				['שפה', 'שפה (אם המאמר לא בעברית)', 1],
				['פורמט', 'פורמט המאמר, אם אינו‏ HTML‏ ‏(PDF או DOC)', 1],
				['ציטוט', 'ציטוט משפט מהדף המקושר (יכול לעזור במציאת הדף בעתיד, אם הקישור ישתנה)', 1]
			]},
			{t: 'הארץ 0', p: [1,2,3,4], r: /([.\d]+)$/i, rp: [3], bm: 1, op: [0,3]},
			{t: 'דבר'},
			{t: 'מעריב'},
			{t: 'הצבי'},
			{t: 'הצפירה'},
			{t: 'המגיד'},
			{t: 'חבצלת'},
			{t: 'המליץ'},
			{t: 'PalPost'},
			{t: 'תנ"ך', p: [8,9,10], op:[2]},
			{t: 'nrg', p: [1,2,3,4,0,19,20], r: /\/online\/([^\/]+)\/ART([^\/]*)\/([^\.]+).html/i, rp: [6,7,3], bm: 1, op:[3,4,5,6]},
			{t: 'Mooma2', p: [42,3], r: /\?ArtistId=(\d+)/i, rp: [2]},
			{t: 'בחדרי חרדים', p: [1,2,3,4], r: /\/Article\.aspx\?id=(\d+)/i, rp: [3], bm: 1, op: [3]},
			{t: 'CIA factbook', p: [52]},
			{t: 'mynet', p: [1,2,3,4,0,5], r: /articles\/(\d+),7340,L-(\d+),00\.html/i, rp: [6,3], op: [3,4,5,6]},
			{t: 'NFC', p: [1,2,3,4], r: /Archive\/([^\.]+)\.html/i, rp: [3], op: [3]},
			{t: 'Onlife', p: [1,2,3,4], r: /onlife\.co\.il\/([^\/]+)\/(.*)/i, rp: [1,3], op: [3]},
			{t: 'ynet', p: [1,2,3,4,0,5,25], def: {6: 0, 7: 'articles'}, r: /ynet\.co\.il\/([^\/]+)\/(\d+),7340,L-(\d+),00.html/i, rp: [7,6,3], bm: 1, op: [3,4,5,6]},
			{t: 'Xnet', p: [1,2,3,4,0,5,25], def: {6: 0, 7: 'articles'}, r: /([^\/]+)\/(\d+),\d+,L-(\d+),00.html/i, rp: [7,6,3], bm: 1, op: [3,4,5,6]},
			{t: 'וואלה!', p: [1,2,3,4,0,26], r: /\?w=\/(\d+)\/(\d+)/i, rp: [6,3], bm: 1, op: [3,4,5]},
			{t: 'גלובס', p: [1,2,3,4], r: /\/news\/article.aspx\?did=(\d+)/i, rp: [3], bm: 1, op: [3]},
			{t: 'כלכליסט', p: [1,2,3,4,0,19], r: /\/articles\/(\d+),7340,L-(\d+),00/i, rp: [6,3], op: [3,4,5,6]},
			{t: 'נענע10', p: [1,2,3,4,0,26], r: /http:\/\/([a-z]*)\.nana10\.co\.il\/Article\/\?ArticleID=(\d+)/i, rp: [6,3], bm: 1, op: [3,4,5,6]},
			{t: 'אנציקלופדיה ynet', p: [27,3,28,4], r: /\/yaan\/0,7340,L-(\d+)-([^-]*)-FreeYaan,00.html/i, rp: [2,3], op: [3]},
			{t: 'תדהר', p: [29,13,27], op: [2]},
			{t: 'אנשים ישראל', p: [1,2,3,4], r: /.*itemID=(\d+)&/i, rp: [3], op: [3]},
			{t: 'אתר חיל האוויר', p: [1,2,3,4], r: /\/([^\/]*)-he\//i, rp: [3], op: [3]},
			{t: 'בלדד השוחי', p: [3,2,4], r: /ArticleID(\d*)/i, rp: [1], op: [2]},
			{t: 'בשבע', p: [1,2,3,4], r: /Article.aspx\/(\d+)/i, rp: [3], op: [3]},
			{t: 'האייל הקורא', p: [1,2,3,4], r: /story(?:_|\?id=)(\d+)/i, rp: [3], op: [3]},
			{t: 'הידען', p: [1,2,30,4], r: /hayadan\.org\.il\/([^\/]*)/i, rp: [3], op: [3]},
			{t: 'המאסף', p: [1,2,3,4], r: /notimportant\.co\.il\/?p=(\d+)/i, rp: [3], op: [3]},
			{t: 'חסקין', p: [3,2], r: /ArticleNum=(\d+)/i, rp: [1]},
			{t: 'בבלי', p: [11,12,13], op: [2]},
			{t: 'משנה', p: [11,9,14], op: [2]},
			{t: 'רמב"ם', p: [8,17,9,31], op: [0,3]},
			{t: 'ירושלמי', p: [11,9,31], op: [2]},
			{t: 'שולחן ערוך', p: [33,15,16], op: [2]},
			{t: 'מטח', p: [1,2,3,4], op: [3]},
			{t: 'גלצ', p: [1,2,3,4], r: /NewsArticle\.aspx\?NewsId\=(\d+)/i, rp: [3], op: [3]},
			{t: 'ישראל היום', p: [1,2,3,4], r: /newsletter_article\.php\?id=(\d+)/i, rp: [3], bm: 1, op: [3]},
			{t: 'מממ', p: [1,2,3,4], r: /data\/pdf\/([^\.])\.pdf/i, rp: [3], op: [3]},
			{t: 'מממ2', p: [1,2,3,4], r: /data\/docs\/([^\.])\.rtf/i, rp: [3], op: [3]},
			{t: 'משנה תורה', p: [12,3,34], r: /mechon-mamre.org\/\i\/(\d+)\.htm/i, rp: [2]},
			{t: 'נזכור', p: [35,3], r: /HalalKorot\.aspx\?id=(\d+)/i, rp: [2]},
			{t: 'סגולה', p: [1,2,3,4], r: /view-article\.asp\?article=(\d+)/i, rp: [3], op: [3]},
			{t: 'ספורט 5', p: [1,2,3,36,4], r: /articles\.aspx\?FolderID=(\d+)&docID=(\d+)/i, rp: [4,3], op: [3], op: [0,4]},
			{t: 'ספסל', p: [3,18,0], r: /hplayer\.aspx\?id=(\d+)/i, rp: [1]},
			{t: 'ספסל מאמן', p: [3,18,0], r: /hstaff\.aspx\?id=(\d+)/i, rp: [1]},
			{t: 'ספרי יזכור', p: [1,37,3,4], r: /yizkor\.nypl\.org\/index\.php\?id=(\d+)/i, rp: [3], op: [3]},
			{t: 'הספרייה הדיגיטלית', p: [1,24,3,4], r: /nnl\/dig\/books\/([^\.]+)\.html/i, rp: [3], op: [3]},
			{t: 'אורות', p: [1,2,3,4], r: /Article\.aspx\?ID=(\d+)/i, rp: [3], op: [3]},
			{t: 'הערוץ האקדמי', p: [1,34,3,4], r: /programs\/Item\.aspx\?it=(\d+)/i, rp: [3], bm: 1, op: [3]},
			{t: 'עכבר העיר', p: [1,2,3,4], r: /CM\.articles_item,(.*),\.aspx/i, rp: [3], bm: 1, op: [3]},
			{t: 'ערוץ7', p: [1,2,3,4], r: /News\.aspx\/(\d+)/i, rp: [3], bm: 1, op: [3]},
			{t: 'פעמים', p: [1,2,3,38], r: /dbsAttachedFiles\/Article_(.*)\.pdf/i, rp: [3], op: [3], op: [0,3]},
			{t: 'תכלת', p: [1,2,3,4], r: /article\.php\?id=(\d+)/i, rp: [3], op: [3]},
			{t: 'אנצ דעת', p: [3,27], r: /value\.asp\?id1=(\d+)/i, rp: [1]},
			{t: 'דעת', p: [1,39,2], r: /(?:www\.)?daat\.ac\.il\/(.*)/i, rp: [2]},
			{t: 'ויקישיבה', p: [50]},
			{t: 'HebrewBooks', p: [1,8,3,4], r: /hebrewbooks\.org\/(\d+)/i, rp: [3], op: [3]},
			{t: 'HebrewBooksPage', p: [1,8,3,4,40], r: /pdfpager\.aspx\?.*req=(\d+).*&pgnum=(\d+)/i, rp: [3,5], op: [0,3]},
			{t: 'גדולי ישראל', p: [29,40,41,13]},
			{t: 'עיתונות יהודית היסטורית 2', p: [43,44,1,2,22,3,7,0,23], def: {9: "Ar"}, r: /(?:Key|BaseHref)=([A-Z]{3})\/(\d{4}\/\d{1,2}\/\d{1,2})(?:.*&EntityId=|\/\d+\/)([A-Z][a-z])(\d+)/i, rp: [2,5,9,6], replace: [[/%2F/gi,'/']], op: [6,8]},
			{t: 'Iucnredlist', p: [45,3], r: /details(?:\.php)?\/(\d+)/, rp: [2]},
			{t: 'העין השביעית', p: [1,34,6,4,25], r: /the7eye\.org\.il\/([^\/]+)\/Pages\/(.*)\.aspx/, rp: [5,3], bm: 1, op: [3,4]},
			{t: 'One', p: [1,2,3,4], r: /(?:Article[\d\-\/,]*\/|id=)([\d\-\/,]*\d)/, rp: [3], bm: 1, op: [3]},
			{t: 'קול הלשון - שיעור', p: [46,47,48,4], np: [['וידאו', '"וידאו": רשמו "כן" אם זה שיעור לצפייה'], ['תואר', 'תואר - אם תואר המרצה שונה מ"הרב"']], r: /(?:PathFile=|Source=)([^&]*)/i, rp: [3], op: [3]},
			{t: 'ספר פרויקט גוטנברג', np: [["כותב", "שם כותב הספר", 1], ['שם הספר', 'שם הספר (ברירת מחדל: שם הערך)', 1], ['מספר', 'מספר הספר בפרויקט']], r: /ebooks\/(\d+)/i, rp: [3]},
			{t: 'imdb title', np: [['id', 'המספר שמופיע בקישור'], ['title', 'הכותרת שתופיע בקישור (אופציונלי: ברירת מחדל - שם הערך', 1]], r: /title\/tt(\d+)/i, rp: [1]},
			{t: 'imdb name', np: [['id', 'המספר שמופיע בקישור'], ['name', 'הכותרת שתופיע בקישור (אופציונלי: ברירת מחדל - שם הערך', 1]], r: /name\/nm(\d+)/i, rp: [1]},
			{t: 'imdb company', np: [['id', 'המספר שמופיע בקישור'], ['company', 'הכותרת שתופיע בקישור']], r: /company\/co(\d+)/i, rp: [1]},
			{t: 'Google book', np: [['מזהה','מזהה הספר באתר גוגל'],['כותב','שם כותב/י הספר', 1],['שם הספר','שם הספר (אופציונלי) - ללא הפרמטר יוצג שם הערך', 1]], r: /id=([^&]*)/, rp: [1]},
			{t: 'TheMarker1', p: [1,2,3,4,51], r: /http:\/\/(?:www)?(.*)\.themarker\.com\/([^\?]+)/i, rp: [5,3], op: [3,4]},
			{t: 'מערכות', p: [1,2,3,49], r: /FILES\/(.*)\.pdf/i, rp: [3], op: [3]},
			{t: 'mako', p: [1,2,3,6,4], r: /www\.mako\.co\.il\/(.*?)\/Article-(.*?)\.htm/i, rp: [4,3], bm: 1, op: [4]}
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

		var historic = {"דבר": "DAV", "מעריב": "MAR", "הצבי": "HZV", "הצפירה": "HZF", "המגיד": "MGD", "המליץ": "HMZ", "חבצלת": "HZT", "PalPost": "PLS"};
		if (historic[template.t]) {
			var r = new RegExp('=HISTNAME/(\\d{4}/\\d{1,2}/\\d{1,2})(?:.*&EntityId=|/\\d+/)([A-Z][a-z])(\\d+)'.replace('HISTNAME', historic[template.t]));
			$.extend(template, {p: [1,2,22,3,7,0,23], def: {7: "Ar"}, r: r, rp: [3,7,4], replace: [[/%2F/gi, '/']], op: [4,6]});
		}

		for (var i in template.p)
		if (typeof template.p[i] == "number")
			template.p[i] = constants[template.p[i]];

		return template;
	}

	function templateDialog(dialog, template, values) {
		var brainDamage = $.browser.msie && $.browser.version < 8;
		var	orderedFields = [],
			namedFields = [],
			table = $('<table>'),
			empty = {val: function(){return '';}, hasClass: function(){return 0;}};

		function createWikiCode() {
			var par = ["{{" + template.t];
			for (var i = 0; i < orderedFields.length; i++)
				par.push($.trim(orderedFields[i].val()).replace(/\|/g, '{{!}}').replace(/=/g, '{{=}}'));

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
					var val = $.trim(namedFields[j][1].val()).replace(/\|/g, '{{!}}');
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
			$('#ltw2_preview').text(createWikiCode());
			var canOK = 'enable';
			var f = orderedFields.concat([]); //clone - we don't want to touch orderedFields.
			for (var i in namedFields)
				f.push(namedFields[i][1]);
			for (var i in f)
				if (f[i].hasClass('ltw_required') && $.trim(f[i].val()).length == 0)
					canOK = 'disable';
			$(".ui-dialog-buttonpane button:contains('אישור')").button(canOK);
			$('#ltw2_list').attr('disabled', $('#ltw2_ref').attr('checked'));//disable list if ref
			$('#ltw2_ref').attr('disabled', $('#ltw2_list').attr('checked'));//disable ref if list
			if (brainDamage) { //IOW: internet explorer.
				var width = $('#ltw_dialog').width() - 12;
				$('.ui-dialog-titlebar').width(width);
				$('.ui-dialog-buttonpane').width(width);
			}
		}

		function addRow(labelText, paramName, optional) {
			var inputField = $('<input>', {id: 'ltw2_inputfield_' + paramName, type: 'text', width: 600}).css({width: '28em'}).bind('paste cut drop input change', updatePreview);
			if (! (optional || 0))
				inputField.addClass('ltw_required').css({border: '1px red solid'});
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
			var str = $('#ltw_urlinput').val();
			if (template.replace)
				for (var r in template.replace)
					str = str.replace(template.replace[r][0], template.replace[r][1]);
			var matches = str.match(template.r);
			if (matches)
				for (var i = 1; i < matches.length; i++)
					$('#ltw2_inputfield_' + template.rp[i-1]).val(matches[i] || '');
			updatePreview();
		}

		$('.ltw_disposable').remove();

		if (template.bm)
			dialog.append($('<p>', {title: 'ראו דף "עזרה:בוקמרקלטים"'}).css({color: 'red', fontWeight: 'bold'})
				.text('קיים בוקמרקלט שמייצר תבנית "'  +  template.t + '" באופן אוטומטי. אנא שקלו להשתמש בו (ראו "עזרה:בוקמרקלטים").'))
				.append($('<hr>'));

		if (template.r)
			dialog.append($('<span>').text('הדביקו את הקישור כאן:').css({width: '20em'}))
				.append($('<input>', {type: "text", id: 'ltw_urlinput', maxLength: 600}).css({width: '26em'}).bind('paste cut drop input change', extractParamsFromURL))
				.append($('<hr>'))

		dialog
			.append($('<p>').text('השדות המסומנים באדום הם חובה, השאר אופציונליים'))
			.append(table)
			.append($('<p>').css({height: '2em'}))
			.append($('<label>').text(' הערת שוליים '))
			.append($('<input>', {type: 'checkbox', id: 'ltw2_ref'}).change(updatePreview))
			.append($('<label>').css({width: '12em'}).text( ' פריט ברשימה '))
			.append($('<input>', {type: 'checkbox', id: 'ltw2_list'}).change(updatePreview))
			.append($('<p>').css({height: '1.5em'}))
			.append($('<p>', {id: 'ltw2_preview'}).css({backgroundColor: "lightGreen", fontSize: '120%', maxWidth: '40em'}));


		for (var i = 0; i < (template.p || []).length; i++)
			if (template.p[i].length == 0)  // this allow defining an empty parameter. by use of a "pseudo field".
				orderedFields.push(empty);
			else
				addRow(template.p[i], parseInt(i, 10) + 1, template.op && ($.inArray(i, template.op)+1));

		for (var i in template.np)
			addRow(template.np[i][1], template.np[i][0], template.np[i][2]);

		var valIndex = 0;
		while (values && values.length) {
			var next = values.shift();
			var pair = next.split('=');
			if (pair.length > 1) {
				if (isNaN(pair[0])) {
					for (var named in namedFields)
						if (namedFields[named][0] == $.trim(pair[0]))
							namedFields[named][1].val(pair[1]);
				} else {
					valIndex = parseInt(pair[0], 10);
					if (valIndex <= orderedFields.length)
						orderedFields[valIndex - 1].val(pair[1]);
				}
			} else
				if (valIndex < orderedFields.length)
					orderedFields[valIndex++].val(pair[0]);
		}

		dialog.dialog('option', 'buttons', {
			'אישור':
				function() {
					insertTags('', createWikiCode(), '');
					dialog.dialog('close');
				},
			'ביטול':
			function() {
				dialog.dialog('close');
			}
		});
		$('.ui-dialog-buttonpane').css({backgroundColor: '#E0E0E0'});
		dialog.dialog('option', {
			height: 'auto',
			width: 'auto',
			position: [(window.width - dialog.width()) / 2, (window.height - dialog.height()) / 2]
		});
		$('.ui-dialog-buttonpane').css({direction: 'ltr'});
		$('.ui-dialog-buttonpane > button').css({float: 'right'}); // jQuery has problems with rtl dialogs + ie is braindamaged.
		updatePreview();
	}

	function findSelected() {
		if (document.selection && document.selection.createRange)
			return document.selection.createRange().text;
		else if (currentFocused.selectionStart) {
			var start = currentFocused.selectionStart;
			var end   = currentFocused.selectionEnd;
			return $(currentFocused).val().substring(start, end);
		}
		return '';
	}


	function fireDialog() {

		var killold = $('#ltw_dialog').remove(), // kill existing popup when button is pressed again.
			title = 'יצירת תבנית קישור',
			dialog = $('<div>', {id: 'ltw_dialog'}).css({backgroundColor: '#E8E8E8', maxWidth: '58em'}).dialog({
				title: title,
				resizable: false,
				close: function() {$(this).remove();}
			}),
			fullList = templates(false),
			allTemplates = [];

		function fromTemplate(text) {
			var regex = new RegExp('\\{\\{(' + allTemplates.join('|') + ')([^}]*)');
			match = text.match(regex);
			if (match) {
				template = match[1];
				values = match[2].split('|');
				values.shift();
				templateDialog(dialog, templates(template), values);
				return true;
			}
			return false;
		}


		for (var i in fullList)
			allTemplates.push(fullList[i].t);

		if (fromTemplate(findSelected()))
			return;

		var selector = $('<select>', {'class': 'ltw_disposable'}).change(function() { // class in quotes - reserved word.
			if (! this.value) return;
			dialog.dialog('option', 'title', title + ' עבור ' + this.value);
			$(this).remove();
			templateDialog(dialog, templates(this.value));
		});
		selector.append($('<option>', {text: 'בחרו תבנית מהרשימה'}));
		for (var i in allTemplates)
			selector.append($('<option>', {text: allTemplates[i], value: allTemplates[i]}));
		dialog.append(selector);
		dialog.append($('<p>', {'class': 'ltw_disposable'}).text('או הדביקו כאן תבנית לעריכה:'));
		dialog.append($('<input>', {type: 'text', maxLength: 1000, 'class': 'ltw_disposable'}).css({width: '14em'}).bind('paste cut drop input change', function() {fromTemplate(this.value);}));
	}

	setTimeout(function() {
		var buttonImage = 'http://upload.wikimedia.org/wikipedia/commons/3/34/Button_LINK_HE1.png';
		$('div #toolbar').append( // "old style"
			$('<img>', {src: buttonImage, title: 'תבנית קישור', 'class': 'mw-toolbar-editbutton'})
			.css({cursor: 'pointer'})
			.click(function() {mediaWiki.loader.using('jquery.ui.dialog', fireDialog);})
		);
		$('#wpTextbox1').wikiEditor('addToToolbar', {
				section: 'advanced',
				group: 'more',
				tools: {
					'linkTemplatewizard': {
						label: 'תבנית קישור',
						type: 'button',
						icon: buttonImage,
						action: {type: 'callback', execute: fireDialog}
					}
				}
			});
	}, 1000);
});
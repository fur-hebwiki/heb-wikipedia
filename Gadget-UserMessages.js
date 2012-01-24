/* adds to the toolbox a list of templates to add in talkpages. */
$(function() {
	var user = findUser(),
		userAnon = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(user),
		tlist = userAnon
		? [
			{title: 'אזהרות', templates: ['אזהרה', 'לך', 'הבל', 'העתקה', 'נחסמת', 'תלונה', 'שגיאה']},
			{title: 'הודעות', templates: ['ניסויים', 'נמחק ניסויים', 'נמחק', 'בוטל', 'חזרה על עריכה', 'קישור מבוטל']},
			{title: 'הסברים', templates: ['טעות', 'הסבר', 'לא כאן', 'נייטרליות', 'סגנון', 'שימוש בדף השיחה', 'כבר קיים', 'התנחלות', 'ויקיזציה', 'מילון']},
			{title: 'תודות', templates: ['תודה', 'הזמנה']}
		]
		: [
			{title: 'אזהרות', templates: ['אזהרה', 'אזהרה לרשום', 'הבל', 'העתקה', 'שם פוגעני', 'נחסמת', 'לך', 'שגיאה']},
			{title: 'הודעות', templates: ['פרסומת', 'ניסויים', 'נמחק ניסויים', 'נמחק', 'בוטל', 'חזרה על עריכה', 'קישור מבוטל']},
			{title: 'תמונות', templates: ['אזהרת תמונות2',  'תמונה מוגנת', 'מחיקת תמונה', 'מקור תמונה', 'הנחיות תמונה']},
			{title: 'הסברים', templates: ['אוטוביוגרפיה', 'טעות', 'הסבר', 'נייטרליות', 'לא כאן', 'סגנון', 'שימוש בדף השיחה', 'כבר קיים', 'התנחלות', 'ויקיזציה', 'זכות הצבעה', 'מילון']},
			{title: 'תודות', templates: ['תודה לרשום', 'בדוק עריכות אוטומטית']}
		],
		tooltips = {
			'תמונה מוגנת': 'הסבר למשתמש שהעלה תמונה מוגנת',
			'תלונה': 'הודעה למשתמש שהוגשה תלונה נגדו לספק האינטרנט שלו',
			'תודה': 'תודה לאלמוני על תרומתו, והזמנה להרשם',
			'תודה לרשום': 'תודה אישית למשתמש רשום - יש להוסיף לתבנית את הערך בגינו את מודה לו',
			'שם פוגעני': 'הודעה למשתמש רשום שהשם שבחר פוגעני, ובקשה להרשם בשם אחר',
			'שימוש בדף השיחה': 'הודעה למשתמש שכתב דברים שמתאימים לדף שיחה בערך עצמו',
			'שגיאה': 'אזהרת משתמש שעריכתו הכילה מידע שגוי, מידע שאין מקומו בערך או לא אנציקלופדי',
			'קישור מבוטל': 'הודעה למשתמש אחרי שהסרת קישור שהוסיף',
			'פרסומת': 'הודעה למשתמש אחרי שהסרת פרסומת שהוסיף',
			'סגנון': 'אחרי שמחקת עריכה בגלל סגנון או תוכן לא מתאים לערך',
			'נמחק': 'הודעה למשתמש אחרי מחיקת ערך חדש שכתב',
			'נמחק ניסויים': 'הודעה למשתמש אחרי מחיקת ערך הבל שכתב',
			'ניסויים': 'הודעה למשתמש אחרי שחזור עריכת הבל קטנה',
			'נייטרליות': 'הודעה למשתמש אחרי שחזור עריכה לא נייטרלית',
			'נחסמת': 'אזהרת משתמש שנחסם בגלל השחתות, עם איום לפנות לספק האינטרנט ולרשויות',
			'מקור תמונה': 'יש להכליל תבנית זו בדף שיחת המשתמש של משתמש שהעלה תמונה שלא ידוע מה מקורה. (פרמטרים)',
			'מילון': 'הזמנה להרשם, והערה לגבי ערכים מילוניים, הפניה לויקימילון',
			'מחיקת תמונה': 'הודעה למשתמש שתמונה שהעלה נמחקה',
			'לך': 'אזהרה אחרונה לפני חסימה למשחית',
			'לא כאן': 'תבנית פרמטרית למשתמש שכתב דברים בדף לא מתאים, והם נמחקו או הועברו',
			'כבר קיים': 'תבנית פרמטרית למשתמש שיצר ערך חדש שכבר קיים (בשם אחר), אחרי שהדף שיצר שונה להפניה',
			'טעות': '"אם לדעתך יש טעות בערך כלשהו, יש לציין זאת בדף השיחה של הערך"',
			'חזרה על עריכה':'אזהרה: "חזרה על עריכות ששוחזרו ללא דיון בדף שיחה אינה מקובלת בוויקיפדיה"',
			'זכות הצבעה': 'אחרי הסרת הצבעה בגלל ז"ה, פרמטר: דף ההצבעה',
			'ויקיזציה': 'הפניה למדריכי עריכה שונים',
			'התנחלות': 'הסבר על החלטה שהתקבלה בפרלמנט על קווים ירוקים ואחרים',
			'העתקה': 'במקביל להחלפת תוכן הדף בתבנית הז"י',
			'הסבר': 'בקשה להסבר על עריכה. כשמציבים תבנית זו יש לעקוב אחרי דף השיחה כדי לקבל את ההסבר',
			'הנחיות תמונה': 'פרמטרים: תמונה=(התמונה או "הכל"), ועוד אחד עד שלושה פרמטרים מהרשימה הבאה: מקור,ערך,הוגן,חשבון,קישור,זרה,OTRS',
			'הזמנה': 'הזמנת אלמוני להרשם',
			'הבל': 'אזהרה עדינה',
			'בוטל': 'הסבר לביטול עריכה. פרמטר ראשון:שם הערך, פרמטר שני (אופציונלי): סיבת הביטול',
			'אזהרת תמונות2':'הסבר על העלאת תמונות',
			'אזהרה': 'אזהרת אנונימיים וחדשים (עד 4 ימים) לפני החסימה',
			'אזהרה לרשום': 'עריכה שנויה במחלוקת, לאחר שחזור',
			'אוטוביוגרפיה': 'לאדם שהעלה ערך לא ראוי על עצמו',
				'בדוק עריכות אוטומטית':'למשתמש שקיבל הרשאת בדוק עריכות'
		},
	templates_requiring_params = ['כבר קיים', 'בוטל', 'לא כאן', 'הסבר', 'מקור תמונה', 'זכות הצבעה', 'הנחיות תמונה'];

	function findUser() {
		return $('#mw-diff-ntitle2 a:first').text() || mw.config.get('wgNamespaceNumber') == 3 && mw.config.get('wgPageName').replace(/.*:|\/.*/g, '');
	}
	
	function openDialog() {
		var dialog, template, selector, needParam, paramfield, paramrow;

		function doIt() {
			var fromDiff = $('#mw-diff-ntitle2 a:first').length,
				title = fromDiff 
					? '[[' + mw.config.get('wgPageName').replace(/_/g, ' ') + ']]'
					: template,
				summary = 'תבנית ' + template,
				message = '\n== ' + title + ' ==\n' +
						'{{ס:' + template + (needParam ? '|' + paramfield.val() : '') + "}} ~~" + "~~";
			dialog.css({cursor: 'wait'});
			$.ajax({
				url: mw.util.wikiScript('api'),
				aync: false,
				type: 'post',
				data: {action: 'edit', title: 'שיחת משתמש:' + user, summary: summary, token: mw.user.tokens.get('editToken'), appendtext: message, format:'json'},
				success: function(data){
					if (data && data.edit && data.edit.result === "Success") {
						dialog.css({cursor: ''});
						dialog.dialog('close');
						if (fromDiff) 
							mw.util.jsMessage('נוספה תבנית {{' + template + '}} לדף [[שיחת משתמש:' + user + ']]');
						else 
							location.reload(true);
					} else 
						dialog.append($('<p>').css({color: 'red'}).text('כנראה אירעה תקלה. אנא בידקו ב"תרומות המשתמש" שלכם מה בדיוק קרה'));
				},
				error: function(data) {
					dialog.append($('<p>').css({color: 'red'}).text('תקלה. התבנית לא נשמרה בדף השיחה של המשתמש'));
				}
			});
		}

		mw.loader.using('jquery.ui.dialog', function() {
			var buttons = {
				'ביטול': function() {dialog.dialog('close');},
				'בצע': doIt
			};
			dialog = $('<div>').dialog({
				title:  'הוספת תבנית אזהרה לדף השיחה של ' + user,
				width: 'auto',
				height: 'auto',
				overflow: 'auto',
				closeTest: '',
				position: [$('body').width() * 0.4, $('body').height() * 0.4],
				buttons: buttons});

			function setValues() {
				template = selector.val();
				needParam = $.inArray(template, templates_requiring_params) + 1;
				paramrow.toggle(!!needParam);
				var canOK = (template.length && (! needParam || $.trim(paramfield.val()).length)) ? 'enable' : 'disable';
				$(".ui-dialog-buttonpane button:contains('בצע')").button(canOK);
			}

			selector = $('<select>')
				.append($('<option>', {text: 'אנא בחרו תבנית מהרשימה', value: ''}))
				.change(setValues);

			for (var i in tlist) {
				var t = tlist[i];
				selector.append($('<option>', {text: '==== ' + t.title + ' ====' , value: '', disabled: 1}));
				for (var j in t.templates) {
					var templ = t.templates[j];
					selector.append($('<option>', {text: '\t' + templ, label: '\t' + templ, value: templ, title:tooltips[templ]}));
				}
			}

			dialog.append(selector);
			paramfield = $('<input>').bind('paste cut drop input change', setValues);
			paramrow = $('<span>', {text: 'פרמטר לתבנית: '}).append(paramfield).toggle(false);
			dialog.append($('<p>')).append(paramrow);
			$(".ui-dialog-buttonpane button:contains('בצע')").button('disable');
			$('.ui-dialog-buttonpane').children().css({float: 'right'});
		});
	}

	if (user)
		mw.util.addPortletLink('p-tb', '#null', 'תבנית אזהרה בדף השיחה', 'warnUser', 'הוספת תבנית אזהרה לדף השיחה של ' + user)
		.onclick = openDialog;
});
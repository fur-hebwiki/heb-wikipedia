/* adds to the toolbox a list of templates to add in talkpages. */
 
var uTemplate_registered = [
	{title: 'אזהרות', templates: ['אזהרה', 'אזהרה לרשום', 'הבל', 'העתקה', 'שם פוגעני', 'נחסמת', 'לך', 'שגיאה']},
	{title: 'הודעות', templates: ['פרסומת', 'ניסויים', 'נמחק ניסויים', 'נמחק', 'בוטל', 'חזרה על עריכה', 'קישור מבוטל']},
	{title: 'תמונות', templates: ['אזהרת תמונות2',  'תמונה מוגנת', 'מחיקת תמונה', 'מקור תמונה', 'הנחיות תמונה']},
	{title: 'הסברים', templates: ['אוטוביוגרפיה', 'טעות', 'הסבר', 'נייטרליות', 'לא כאן', 'סגנון', 'שימוש בדף השיחה', 'כבר קיים', 'התנחלות', 'ויקיזציה', 'זכות הצבעה', 'מילון']},
	{title: 'תודות', templates: ['תודה לרשום', 'בדוק עריכות אוטומטית']}
]
 
var uTemplate_anon = [
	{title: 'אזהרות', templates: ['אזהרה', 'לך', 'הבל', 'העתקה', 'נחסמת', 'תלונה', 'שגיאה']},
	{title: 'הודעות', templates: ['ניסויים', 'נמחק ניסויים', 'נמחק', 'בוטל', 'חזרה על עריכה', 'קישור מבוטל']},
	{title: 'הסברים', templates: ['טעות', 'הסבר', 'לא כאן', 'נייטרליות', 'סגנון', 'שימוש בדף השיחה', 'כבר קיים', 'התנחלות', 'ויקיזציה', 'מילון']},
	{title: 'תודות', templates: ['תודה', 'הזמנה']}
]

var uTemplate_tooltips = {
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
}

var uTemplate_requires_params = ['כבר קיים', 'בוטל', 'לא כאן', 'הסבר', 'מקור תמונה', 'זכות הצבעה', 'הנחיות תמונה'];

function uTemplate_addTemplate(template) {
	if (!document.editform && !getParamValue('autoinsert_template')) {
		if (uTemplate_isDiffView()) {
			var div = document.getElementById('mw-diff-ntitle2');
			if (!div) return;
			var tools = getElementsByClassName(div, 'span', 'mw-usertoollinks');
			if (!tools || tools.length == 0) return;
			var a = tools[0].getElementsByTagName('a');
			if (!a || a.length == 0) return;
			var href = a[0].href + ((a[0].href.indexOf('?')+1) ? '&' : '?');
			document.location = href + 'action=edit&autoinsert_template=' + template + '&origpage=' + getParamValue('title');
		} else {
			var editlk = document.getElementById('ca-edit').getElementsByTagName('a')[0].href;
			document.location = editlk + '&autoinsert_template=' + template;
		}
		return;
	}
	var needParams = $.inArray(template, uTemplate_requires_params) + 1;
	var origPage = getParamValue('origpage');
	if (origPage)
		document.editform.wpTextbox1.value += "\n==[[" + origPage + "]]==\n";
	document.editform.wpTextbox1.value += "\n{{ס:" + template + (needParams?'|':'') + "}} ~~" + "~~";
	document.editform.wpSummary.value = 'הוספת תבנית "' + template + '" ליידוע המשתמש/ת.';
	if (!needParams && uTemplate_shouldsave())
		document.editform.wpSave.click();
	else 	
		document.editform.wpTextbox1.scrollTop = document.editform.wpTextbox1.scrollHeight;
}

function uTemplate_is_anon() {return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(wgTitle);}

function uTemplate_shouldsave(){return typeof template_autosave == "undefined" || template_autosave;}

function uTemplate_onload() {
	addPortletLink('p-tb', '', ''); // create a little space.
	var uTemplate = uTemplate_is_anon() ? uTemplate_anon : uTemplate_registered;
	for (var i in uTemplate) {
		var part = uTemplate[i];
		var title = addPortletLink('p-tb', 'javascript:return false;', part.title);
		refs = title.getElementsByTagName('a');
		if (refs.length > 0)
			$.extend(refs[0].style, {color:'black', cursor:'default', fontSize:'1.2em',textDecoration:'underline', fontWeight:'bold'});
		var templates = part.templates;
		for (var j in templates) {
			var t = templates[j], c = uTemplate_tooltips[t];
			addPortletLink('p-tb', 'javascript:uTemplate_addTemplate("' + t + '")', t, null, c);
		}
	}
	if (getParamValue('autoinsert_template'))
		uTemplate_addTemplate(getParamValue('autoinsert_template'));
}
 
function  uTemplate_isDiffView() {
	return wgAction == 'historysubmit' || (getParamValue('diff') && getParamValue('oldid'))
}

if (wgNamespaceNumber == 3 || uTemplate_isDiffView())  //NS_USERTALK
	addOnloadHook(uTemplate_onload);
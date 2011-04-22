/*
==Automatic user messages ==
Installing this script as described on the talk page will give you links in the toolbox
for all pages in the User talk: namespace, that say 'Please tag', 'Please name', and
'Please link' etc.

See talk for full list

Alternatively you can place some templates in a user's language. Templates marked
with an asterisk (*) use a parameter and can be translated, but cannot be localised
on the user page with the script. Click the link 'lang' and fill in a language code
to have a localised version of the template put on the talk page.

Main code by [[User:Siebrand]], derived from [[MediaWiki:Quick-delete.js]] by
[[:en:User:Jietse Niesen|Jietse Niesen]], [[User:pfctdayelise|pfctdayelise]] and
[[User:Alphax|Alphax]]

===TODO===
* Add remaining templates from [[Commons:Message templates]]:
**{{tl|speedywhat}}
* Do not add a trailing /<langcode> at the end of the subst'ed template, as they now (almost) all use the autotranslation mechanism (see [[Commons:Template_i18n/User_templates]])
*/
// <source lang="javascript">
// Configuration

// Should the edits be saved automatically?
if(window.template_autosave == false){}else{ template_autosave = true; }

// String constants
var uTemplate = new Array(33)
uTemplate[0] = 'אזהרה'
uTemplate[1] = 'הבל'
uTemplate[2] = 'ניסויים'
uTemplate[3] = 'נמחק ניסויים'
uTemplate[4] = 'נמחק'
uTemplate[5] = 'בוטל'
uTemplate[6] = 'פרסומת'
uTemplate[7] = 'חזרה על עריכה'
uTemplate[8] = 'העתקה'
uTemplate[9] = 'קישור מבוטל'
uTemplate[10] = 'לך'
uTemplate[11] = 'אוטוביוגרפיה'
uTemplate[12] = 'שם פוגעני'
uTemplate[13] = 'נחסמת'
uTemplate[14] = 'שגיאה'
uTemplate[15] = 'טעות'
uTemplate[16] = 'הסבר'
uTemplate[17] = 'נייטרליות'
uTemplate[18] = 'סגנון'
uTemplate[19] = 'שימוש בדף השיחה'
uTemplate[20] = 'אזהרת תמונות2'
uTemplate[21] = 'תמונה מוגנת'
uTemplate[22] = 'מחיקת תמונה'
uTemplate[23] = 'מקור תמונה'
uTemplate[24] = 'הנחיות תמונה'
uTemplate[25] = 'כבר קיים'
uTemplate[26] = 'התנחלות'
uTemplate[27] = 'ויקיזציה'
uTemplate[28] = 'תלונה'
uTemplate[29] = 'זכות הצבעה'
uTemplate[30] = 'מילון'
uTemplate[31] = 'לא כאן'
uTemplate[32] = 'כניסה לחשבונך'
uTemplate[33] = 'תודה'
uTemplate[34] = 'הזמנה'

var uText = new Array(33)
uText[0] = "אזהרה"
uText[1] = "הבל"
uText[2] = "ניסויים"
uText[3] = "נמחק ניסויים"
uText[4] = "נמחק"
uText[5] = "בוטל"
uText[6] = "פרסומת"
uText[7] = "חזרה על עריכה"
uText[8] = "העתקה"
uText[9] = "קישור מבוטל"
uText[10] = "לך"
uText[11] = "אוטוביוגרפיה"
uText[12] = "שם פוגעני"
uText[13] = "נחסמת"
uText[14] = "שגיאה"
uText[15] = "טעות"
uText[16] = "הסבר"
uText[17] = "נייטרליות"
uText[18] = "סגנון"
uText[19] = "שימוש בדף השיחה"
uText[20] = "אזהרת תמונות2"
uText[21] = "תמונה מוגנת"
uText[22] = "מחיקת תמונה"
uText[23] = "מקור תמונה"
uText[24] = "הנחיות תמונה"
uText[25] = "כבר קיים"
uText[26] = "התנחלות"
uText[27] = "ויקיזציה"
uText[28] = "תלונה"
uText[29] = "זכות הצבעה"
uText[30] = "מילון"
uText[31] = "לא כאן"
uText[32] = "כניסה לחשבונך"
uText[33] = "תודה"
uText[34] = "הזמנה"

var uHelp = new Array(33)
uHelp[0] = "אזהרה"
uHelp[1] = "הבל"
uHelp[2] = "ניסויים"
uHelp[3] = "נמחק ניסויים"
uHelp[4] = "נמחק"
uHelp[5] = "בוטל"
uHelp[6] = "פרסומת"
uHelp[7] = "חזרה על עריכה"
uHelp[8] = "העתקה"
uHelp[9] = "קישור מבוטל"
uHelp[10] = "לך"
uHelp[11] = "אוטוביוגרפיה"
uHelp[12] = "שם פוגעני"
uHelp[13] = "נחסמת"
uHelp[14] = "שגיאה"
uHelp[15] = "טעות"
uHelp[16] = "הסבר"
uHelp[17] = "נייטרליות"
uHelp[18] = "סגנון"
uHelp[19] = "שימוש בדף השיחה"
uHelp[20] = "אזהרת תמונות2"
uHelp[21] = "תמונה מוגנת"
uHelp[22] = "מחיקת תמונה"
uHelp[23] = "מקור תמונה"
uHelp[24] = "הנחיות תמונה"
uHelp[25] = "כבר קיים"
uHelp[26] = "התנחלות"
uHelp[27] = "ויקיזציה"
uHelp[28] = "תלונה"
uHelp[29] = "זכות הצבעה"
uHelp[30] = "מילון"
uHelp[31] = "לא כאן"
uHelp[32] = "כניסה לחשבונך"
uHelp[33] = "תודה"
uHelp[34] = "הזמנה"

template_langquery = "In which language should the message be given? " +
"Example: en for English, de for German, es for Spanish, etc. " +
"If the language does not exist for the template, a red link will be inserted. ";
template_mediaquery = "Which media is this message about? " +
"Example: \\'Image Name.ext\\' - omit namespace.";
template_mediaquery2 = "Which media is this message about? " +
"Example: \\'Image Name.ext\\' - omit namespace. Leave empty to not specify";
template_pagequery = "Which page is this message about? " +
"Example: \\'Page_Name\\'.";
template_usernamequery = "Which user should the message refer to?";


// Add the template
function template_mark(talkpage_fakeaction, message_lang) {
  //if (!message_lang) return; //User pressed cancel
  
  //Now we assume message templates to be properly autotranslated
  if (message_lang) langparam='&template_lang=' + message_lang;
  else langparam='';

  var pagename = encodeURIComponent(wgPageName);
  var editlk = document.getElementById('ca-edit').getElementsByTagName('a')[0].href;
  document.location = editlk + '&fakeaction=' + talkpage_fakeaction + langparam + '&template_type=1';
}

// Add template to user talk page
function template_addTemplate(template) {
  if (getParamValue('template_lang')) {
          template = template + '/' + getParamValue('template_lang');
  }

  var txt = '{{subst:' + template + '}}';
  document.editform.wpTextbox1.value = document.editform.wpTextbox1.value + '\n' + txt + ' ~~~~';
  //  the edit summary for when you mark the image. You can change it if you want.
  document.editform.wpSummary.value = 'מוסיף תבנית \"' + template + '\" ליידוע המשתמש.';
  if (template_autosave) document.editform.wpSave.click();
}

// Add the template
function template_mark2(talkpage_fakeaction, media_name, can_handle_empty_parameter, add_namespace) {
  if (media_name == null) return; // User pressed cancel
  if (media_name == '' && can_handle_empty_parameter != 1) return; // User did not supply parameter and template cannot handle that
  // Parameter handling for special cases
  if (add_namespace && media_name.length > 0) media_name = 'File:' + media_name;

  var pagename = encodeURIComponent(wgPageName);
  var editlk = document.getElementById('ca-edit').getElementsByTagName('a')[0].href;
  document.location = editlk + '&fakeaction=' + talkpage_fakeaction + '&media_name=' + encodeURIComponent (media_name) + '&template_type=2';
}

// Add template to user talk page
function template_addTemplate2(template) {
  if (getParamValue('media_name')) {
          template = template + '|' + getParamValue('media_name');
  }

  var txt = '{{subst:' + template + '}}';
  document.editform.wpTextbox1.value = document.editform.wpTextbox1.value + '\n' + txt + ' ~~~~';
  //  the edit summary for when you mark the image. You can change it if you want.
  document.editform.wpSummary.value = 'Adding template \"' + template + '\" to inform user.';
  if (template_autosave) document.editform.wpSave.click();
}

function template_onload() {
  if (wgNamespaceNumber == 3) { //NS_USERTALK
    addPortletLink('p-tb', 'javascript:template_mark(\'0\')', uText[0], 'mark-please', uHelp[0], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'1\')', uText[1], 'mark-please', uHelp[1], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'2\')', uText[2], 'mark-please', uHelp[2], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'3\')', uText[3], 'mark-please', uHelp[3], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'4\')', uText[4], 'mark-please', uHelp[4], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'5\')', uText[5], 'mark-please', uHelp[5], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'6\')', uText[6], 'mark-please', uHelp[6], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'7\')', uText[7], 'mark-please', uHelp[7], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'8\')', uText[8], 'mark-please', uHelp[8], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'9\')', uText[9], 'mark-welcome', uHelp[9], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'10\')', uText[10], 'mark-warn',   uHelp[10], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'11\')', uText[11], 'mark-warn', uHelp[11], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'12\')', uText[12], 'mark-warn', uHelp[12], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'13\')', uText[13], 'mark-warn',   uHelp[13], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'14\')', uText[14], 'mark-warn',   uHelp[14], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'15\')', uText[15], 'mark-warn',   uHelp[15], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'16\')', uText[16], 'mark-warn',   uHelp[16], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'17\')', uText[17], 'mark-please', uHelp[17], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'18\')', uText[18], 'mark-warn', uHelp[18], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'19\')', uText[19], 'mark-warn',   uHelp[19], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'20\')', uText[20], 'mark-warn', uHelp[20], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'21\')', uText[12], 'mark-warn', uHelp[21], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'22\')', uText[22], 'mark-warn', uHelp[22], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'23\')', uText[23], 'mark-warn', uHelp[23], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'24\')', uText[24], 'mark-warn', uHelp[24], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'25\')', uText[25], 'mark-warn', uHelp[25], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'26\')', uText[26], 'mark-please', uHelp[26], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'27\')', uText[27], 'mark-please', uHelp[27], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'28\')', uText[28], 'mark-please', uHelp[28], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'29\')', uText[29], 'mark-please', uHelp[29], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'30\')', uText[30], 'mark-please', uHelp[30], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'31\')', uText[31], 'mark-please', uHelp[31], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'32\')', uText[32], 'mark-please', uHelp[32], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'33\')', uText[33], 'mark-please', uHelp[33], null, null);
    addPortletLink('p-tb', 'javascript:template_mark(\'34\')', uText[34], 'mark-please', uHelp[34], null, null);
  }

  var fakeaction = getParamValue('fakeaction');
  var template_type = getParamValue('template_type');	// Fetch what template to add
  
  var action_idx = -1;
  try {
    action_idx = parseInt (fakeaction, 10);
  } catch (some_error) {
    action_idx = -1;    
  }
  var add_idx = -1;
  try {
    add_idx = parseInt (template_type, 10);
  } catch (some_error) {
    add_idx = -1;    
  }
  if (add_idx >= 1 && add_idx <= 2 && action_idx >= 0 && action_idx < uTemplate.length) {
    if (add_idx == 1)
      template_addTemplate (uTemplate[action_idx]);
    else
      template_addTemplate2 (uTemplate[action_idx]);
  }
}

addOnloadHook(template_onload);
// </source>
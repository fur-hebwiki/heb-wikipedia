/* הוספת רשימת תבניות בסרגל הכלים, נכתב על ידי [[משתמש:ערן]] */

var templates = ["בחרו קוד להוספה"];

var templatesText = new Array();

// add template to list of templates
function AddTemplateToList(title, before, middle, after)
{
  templates.push(title);
  templatesText[templates.length-1] = [];
  templatesText[templates.length-1][0] = before;
  templatesText[templates.length-1][1] = middle;
  templatesText[templates.length-1][2] = after;
}

// add template to list if it isn't already contained in the article text
function addSingleTemplateToList(title, before, middle, after)
{
  if ( document.getElementById("wpTextbox1") )
  {
    if ( document.getElementById("wpTextbox1").value.indexOf(before) == -1 ) AddTemplateToList (title, before, middle, after);
  }
}

//Defines the templates
function beforeListInit()
{
switch(wgNamespaceNumber){
case 6://templates for images
AddTemplateToList("מידע","{{"+"מידע\n|תיאור=","","\n|מקור=\n|תאריך יצירה=\n|יוצר=\n|אישורים והיתרים=\n}}");
AddTemplateToList("תמונה חשודה","{{ס:"+"תמונה חשודה|","ציינו סיבה","}}");
AddTemplateToList("כפילות עם תמונה מוויקישיתוף","{"+"{גם בוויקישיתוף}}","","");
AddTemplateToList("להחליף בתמונה ווקטורית","{"+"{SVG}}","","");
AddTemplateToList("הוחלף בתמונה ווקטורית","{"+"{הוחלף בווקטור|","","}}");
AddTemplateToList("רישיון CC","{"+"{Cc-by-sa-3.0}}","","");
AddTemplateToList("רישיון GFDL","{"+"{GFDL}}","","");
AddTemplateToList("ייחוס","{"+"{ייחוס}}","","");
AddTemplateToList("שימוש הוגן","{"+"{שימוש הוגן|מקור=","ציינו מקור","|ערך=}}");
break;
case 10://templates for templates
AddTemplateToList("קטגוריה","\n[" + "[קטגוריה:","שם הקטגוריה","]]");
AddTemplateToList("קטע שיופיע רק בדף התבנית","<no"+"include>","טקסט שיופיע בתבנית ולא בדפים המשתמשים בה","</no"+"include>");
AddTemplateToList("קטע שיופיע רק בדפים המכילים את התבנית","<include"+"only>","טקסט שיופיע בדפים המשתמשים בתבנית בלבד","</include"+"only>");
AddTemplateToList("פרמטר","{{{","*שם הפרמטר*|*ערך ברירת מחדל*","}}}");
AddTemplateToList("תבנית ניווט","{{ניווט"+"\n|תמונה=תמונה, כולל קישור וגודל. ברירת מחדל - ללא תמונה\n|תוכן=","","\n}}");
addSingleTemplateToList("דף הפניה","#" + "הפניה [[","שם הערך המופנה","]]");
break;
case 14://templates for categories
AddTemplateToList("קטגוריה","\n[" + "[קטגוריה:","שם הקטגוריה","]]");
AddTemplateToList("פתיח סטנדרטי לקטגוריה","{{קטגוריה|קשור|","נושא שאליו הערכים בקטגוריה קשורים|ערך ראשי","}}");
addSingleTemplateToList("הבהרת חשיבות","{" + "{ס:הבהרת חשיבות}}","","");
AddTemplateToList("תבנית מיזמים","{{מיזמים|ויקישיתוף=","שם הדף בוויקישיתוף","}}");
AddTemplateToList("תוכן עניינים","{{Category"+"TOC}}","","");
break;
default://templates for other namespaces
AddTemplateToList("קטגוריה","\n[" + "[קטגוריה:","שם הקטגוריה","]]");
addSingleTemplateToList("פירוש נוסף", "{" + "{פירוש נוסף|","נוכחי=|אחר=|ראו=","}}");
AddTemplateToList("מפנה","{" + "{מפנה|","הדף המפנה|הסבר על הדף האחר|שם הדף האחר","}}");
addSingleTemplateToList("בעבודה","\n{"+"{בעבודה}}","","\n");
addSingleTemplateToList("לקריאה נוספת","\n==לקריאה נוספת==\n","* שם סופר, '''שם ספר''', שם הוצאה, תאריך הוצאה\n","");
addSingleTemplateToList("קישורים חיצוניים","\n==קישורים חיצוניים==\n","* שם כותב, [" + "Address תיאור המאמר], שם האתר\n","");
addSingleTemplateToList("ראו גם","\n==ראו גם==\n","* [" + "[שם ערך]]\n","");
addSingleTemplateToList("הודעת קצרמר","","\n{" + "{קצרמר}}","");
addSingleTemplateToList("דף הפניה","#" + "הפניה [[","שם הערך המופנה","]]");
addSingleTemplateToList("פירושונים","\n{" + "{פירושונים|" + "\n","* [[" + "ערך 1]] - הסבר קצר על מהותו של ערך 1\n* [[" + "ערך 2]] - הסבר קצר על מהותו של ערך 2","\n}}");
AddTemplateToList("הפניה להערת שוליים","<" + 'ref name="ref-name" />',"","");
addSingleTemplateToList("כותרת הערת שוליים","\n==הערות שוליים==","\n{"+"{הערות שוליים|יישור=ימין}}","");
AddTemplateToList("הפרת זכויות יוצרים","\n{" + "{הפרת זכויות יוצרים|מקור="," המקור שממנו הועתק התוכן ","|זמן={" + "{ס:יום נוכחי}}/{" + "{ס:חודש נוכחי}}/{" + "{ס:שנה נוכחית}}(~~" + "~~" + "~)}}\n");
addSingleTemplateToList("הבהרת חשיבות","{" + "{ס:הבהרת חשיבות}}","","");
AddTemplateToList("הפניה לערך מורחב","{" + "{הפניה לערך מורחב","","}}");
AddTemplateToList("ציטוט","{" + "{ציטוט|מרכאות=כן|תוכן=","הזינו ציטוט כאן","}}");
AddTemplateToList("תבנית מיזמים","{{מיזמים|ויקישיתוף=","שם הדף בוויקישיתוף","}}");
AddTemplateToList("אין תמונה","{{אין"+" תמונה}}","","");
}
}
var templatesList ="toolbar";
function initTemplatesList() {
    if( !templatesList ) return; // user doesn't want the template list
    if( typeof editToolbarConfiguration != 'undefined' ) return;//for this case see enhancedInitTemplatesList
    if( wgAction != 'edit' && wgAction != 'submit') return; // not edit page
    var toolbar = document.getElementById( templatesList );
    if( !toolbar ) return; // no toolbar
    beforeListInit();
    var select = document.createElement("select");
    select.id = "templatesList";
    select.onchange = function() {
        insertTemplate( this.selectedIndex );
        this.selectedIndex = 0;
        return false;
    }

    for( var i = 0; i < templates.length; i++ ) {
        select = createOptionElement( select, templates[i] );
    }

    // add to toolbar
    toolbar.appendChild( select );
}


function enhancedInitTemplatesList()
{
    beforeListInit();
    var templateListAdv= {
        label: 'תבניות להוספה',
        type: 'select',
        list: { }
    };
     

    for ( var i = 1; i < templates.length; i++ ) 
{
        var addiontalMessages=new Array();
        for(var j=0;j<3;j++)
        {
           if(templatesText[i][j]!="")
              addiontalMessages[templatesText[i][j]]=templatesText[i][j];
        }
        mw.usability.addMessages(addiontalMessages);
        
        templateListAdv.list['template'+i] = 
        {
            label: templates[i],
            action: {
                type: 'encapsulate',
                options: {
                    pre: templatesText[i][0],
                    periMsg: templatesText[i][1],
                    post: templatesText[i][2]
                }
            }
        }
}
       $j( '#wpTextbox1' ).wikiEditor( 'addToToolbar', {
			'section': 'advanced',
			'group': 'heading',
			'tools': {'templateListAdv': templateListAdv}
       });
}

function insertTemplate( index ) {
    if( index > 0 ) {
        insertTags( templatesText[index][0], templatesText[index][2], templatesText[index][1] );
    }
}

if ( typeof $j != 'undefined' && typeof $j.fn.wikiEditor != 'undefined' ) {
	$j(document).ready( function() {
            enhancedInitTemplatesList();
});
}

hookEvent("load", initTemplatesList);
/* תוספות לסרגל כלים רגיל
 *
 */

/* הוספת כפתור טבלה, המעלה כלי ליצירת טבלאות */
/* גרסה 0.1, נלקח מוויקיפדיה בצרפתית, נכתב במקור על־ידי Dake */
function generateTableau( nbCol, nbRow, border, styleHeader, styleLine, styleSort ) {
    var code = "\n";
    if ( styleHeader ) {
        code += '{| class="wikitable';
        if(styleSort) code += ' sortable';
        if(border==1) code += '"\n';
        else code += '" border="' + border + '"\n';
    } else {
        code += '{| border="' + border + '"\n';
        code += "|+ כותרת הטבלה\n";
    }

    for( var i = 0; i < nbCol; i++) {
        if(i==0) code += "! כותרת " + i;
        else code += " !! כותרת " + i;
    }
    if(nbCol>0) code+="\n";
    for( var i = 0; i < nbRow; i++ ) {
        if( i %2 == 1 && styleLine ) {
            code += '|- style="background-color: #EFEFEF;"\n';
        } else {                
            code += "|-\n";
        }

        for( var j = 0; j < nbCol; j++ ) {
            if(j==0) code += "| תא " + i;
            else code += " || תא " + i;
        }
       if(nbCol>0) code+="\n";
    }

    code += "|}";
    insertTags( "", "", code );
}

function popupTableau() {
    var popup = window.open( "", "popup", "height=240,width=250" );


    popup.document.write('<html><head><title>פרמטרים לטבלה</title>');
    popup.document.write('<style type="text/css" media="screen,projection">/*<![CDATA[*/ @import "/skins-1.5/monobook/main.css"; @import "/skins-1.5/monobook/rtl.css"; /*]]>*/</style>');
    popup.document.write('<script type="text/javascript">function insertCode() {');
    popup.document.write('var row = parseInt( document.paramForm.inputRow.value ); ');
    popup.document.write('var col = parseInt( document.paramForm.inputCol.value ); ');
    popup.document.write('var bord = parseInt( document.paramForm.inputBorder.value ); ');
    popup.document.write('var styleHeader = document.paramForm.inputHeader.checked; ');
    popup.document.write('var styleLine = document.paramForm.inputLine.checked; ');
    popup.document.write('var styleSort = document.paramForm.sortedTable.checked; ');
    popup.document.write('window.opener.generateTableau( col, row, bord, styleHeader, styleLine, styleSort); ');
    popup.document.write('}</script>');
    popup.document.write('</head><body>');
    popup.document.write('<p>הזינו פרמטרים לטבלה : </p>');
    popup.document.write('<form name="paramForm">');
    popup.document.write('מספר שורות : <input type="text" name="inputRow" maxlength="3" value="3" style=\"width:50px;\"><p>');
    popup.document.write('מספר עמודות : <input type="text" name="inputCol" maxlength="3" value="3" style=\"width:50px;\"><p>');
    popup.document.write('רוחב מסגרת : <input type="text" name="inputBorder" maxlength="2" value="1" style=\"width:50px;\"><p>');
    popup.document.write('טבלה מעוצבת : <input type="checkbox" name="inputHeader" checked="1" ><p>');
    popup.document.write('שורות אפורות לסירוגין: <input type="checkbox" name="inputLine" checked="1" ><p>');
    popup.document.write('טבלה ממוינת: <input type="checkbox" name="sortedTable"><p>');
    popup.document.write('</form>');
    popup.document.write('<p><a href="javascript:insertCode(); self.close();"> הוספת הקוד לחלון העריכה</a></p>');
    popup.document.write('<p><a href="javascript:self.close()"> סגירה</a></p>');
    popup.document.write('</body></html>');
    popup.document.close();
}

/* הוספת כפתור טבלאות לסרגל הכלים */
function tableButton() {
    if( document.getElementById("toolbar") ) {
        var tableButton = document.createElement("img");
        tableButton.width = 23;
        tableButton.height = 22;
        tableButton.src = "http://upload.wikimedia.org/wikipedia/he/6/60/Button_insert_table.png";
        tableButton.border = 0;
        tableButton.alt = "הוספת טבלה";
        tableButton.title = "הוספת טבלה";
        tableButton.style.cursor = "pointer";
        tableButton.onclick = popupTableau;
        if( document.getElementById("toolbar").lastChild.id == "templatesList" ) {
            document.getElementById("toolbar").insertBefore( tableButton, document.getElementById("templatesList") );
        } else {
            document.getElementById("toolbar").appendChild( tableButton );
        }
    }
}

hookEvent("load", tableButton);

function addBtn( location, imageFile, tagOpen, sampleText, tagClose, speedTip ) {
    mwEditButtons.push( {
        "imageFile": ((location == 1) ? "http://he.wikipedia.org/" : "http://upload.wikimedia.org/" ) + imageFile,
        "tagOpen": tagOpen,
        "sampleText": sampleText,
        "tagClose": tagClose,
        "speedTip": speedTip
    } );
}

/* הרחבת סגרל הכלים */
var customButtons;
function fixToolbar() {
 var toolbar = document.getElementById('toolbar');
 if (!toolbar) return;

 mwEditButtons.splice(0, mwEditButtons.length);

// Group 1
 addBtn(1, "skins-1.5/common/images/button_bold.png", "\'\'\'", "טקסט מודגש" ,"\'\'\'" ,"טקסט מודגש");
 addBtn(1, "skins-1.5/common/images/button_italic.png", "\'\'", "טקסט נטוי (לא מומלץ בעברית)" ,"\'\'" ,"טקסט נטוי");
 addBtn(0, "wikipedia/commons/8/89/Button_bigger.png", '<big>', "טקסט מוגדל", "</big>", "טקסט מוגדל");
 addBtn(0, "wikipedia/commons/0/0d/Button_smaller.png", '<small>', "טקסט מוקטן", "</small>", "טקסט מוקטן");
 addBtn(0, "wikipedia/commons/f/fd/Button_underline.png", '<u>', "טקסט עם קו תחתי", "</u>", "טקסט עם קו תחתי");
 addBtn(0, "wikipedia/he/c/c9/Button_strike.png", "<s>", "טקסט המסומן כמחוק", "</s>", "טקסט מחוק");
 addBtn(0, "wikipedia/he/1/1e/Button_font_color.png", '<span style="color: ColorName;">', "טקסט צבוע", "</span>", "טקסט עם צבע");
 addBtn(0, "wikipedia/he/8/80/Button_upper_letter.png", "<sup>", "כתב עילי", "</sup>", "כתב עילי");
 addBtn(0, "wikipedia/he/7/70/Button_lower_letter.png", "<sub>", "כתב תחתי", "</sub>", "כתב תחתי");
 addBtn(0, "wikipedia/he/2/23/Button_code.png", '<source lang="text">\n', "טקסט", "\n<\/source>\n", "עיצוב קוד");
 addBtn(1, "/skins-1.5/common/images/button_nowiki.png", "\x3cnowiki\x3e", "טקסט לא מעוצב", "\x3c/nowiki\x3e", "טקסט לא מעוצב (התעלם מסימני ויקי)");

 // grounp 2
 addBtn(1, "skins-1.5/common/images/button_link.png","[[","קישור","]]","קישור פנימי");
 addBtn(1, "skins-1.5/common/images/button_extlink.png","[","http://www.example.com כותרת הקישור לתצוגה","]","קישור חיצוני (כולל קידומת http מלאה)");
 addBtn(0, "wikipedia/he/e/e9/Button_headline2.png","\n== ","כותרת משנית"," ==\n","כותרת – דרגה 2");

 // ground 4
 addBtn(1, "skins-1.5/common/images/button_image.png","[[קובץ:","PictureFileName.jpg|שמאל|ממוזער|250px|כיתוב תמונה","]]","קובץ המוצג בתוך הדף");
 addBtn(1, "skins-1.5/common/images/button_media.png","[[מדיה:","Example.ogg","]]","קישור לקובץ מדיה");
 addBtn(0, "wikipedia/he/1/12/Button_gallery.png", "<gallery>\n", "קובץ:PictureFileName.jpg|כיתוב תמונה\nקובץ:PictureFileName.jpg|כיתוב תמונה", "\n</gallery>", "יצירת גלריית תמונות");
 addBtn(1, "skins-1.5/common/images/button_math.png","\x3cmath\x3e","formula","\x3c/math\x3e","נוסחה מתמטית (LaTeX)");
 addBtn(1, "skins-1.5/common/images/button_hr.png","\n----\n","","","קו אופקי (השתדלו להמנע משימוש בקו)");
 addBtn(0, "wikipedia/he/1/13/Button_enter.png", "<br />", "", "", "ירידת שורה");

 // group 5:
 addBtn(0, "wikipedia/he/d/d3/Button_definition_list.png", "\n; ", "פריט", " : ", "רשימת הגדרות");
 addBtn(0, "wikipedia/he/5/5f/Button_center.png", '<div style="text-align: center;">\n', "טקסט ממורכז", "\n</div>", "מירכוז טקסט");
 addBtn(0, "wikipedia/he/e/ea/Button_align_left.png", '<div style="direction: ltr;">\n', "טקסט מיושר לשמאל", "\n</div>", "יישור טקסט לשמאל");
 addBtn(0, "wikipedia/he/a/ac/Button_ref.PNG", "<ref>", "הקלידו הערת שוליים כאן", "</ref>", "הערת שוליים");
 addBtn(1, "skins-1.5/common/images/button_sig.png","~~" + "~~","","","חתימה + שעה");
 addBtn(0, "wikipedia/he/3/34/Button_hide_comment.png", "<!-- ", "הערה מוסתרת", " -->", "הערה מוסתרת");

 // for loading custom buttons that are created in preferences scriprt (they load before this js page)
 if (customButtons != null && customButtons.length > 0) {
  for (var i = 0; i < customButtons.length; i ++) {
   mwEditButtons.push(customButtons[i]);
  }
 }
}

addOnloadHook(fixToolbar);

/* תוספות לסרגל כלים משופר
 *
 */

if ( typeof $j != 'undefined' && typeof $j.fn.wikiEditor != 'undefined' ) {
    $j(document).ready( function() {
    
        // קבוצה חדשה בתפריט ראשי:
        $j( '#wpTextbox1' ).wikiEditor( 'addToToolbar', {
            'section': 'main',
            'groups': {
                'others': {
                    'label': ""
                }
            }
        } );

        // קו חוצה
        $j( '#wpTextbox1' ).wikiEditor( 'addToToolbar', {
            'section': 'main',
            'group': 'format',
            'tools': {
                'strikethrough': {
                    label: 'קו חוצה',
                    type: 'button',
                    icon: 'http://upload.wikimedia.org/wikipedia/he/8/8d/NewInlineBtn.png',
                    action: {
                        type: 'encapsulate',
                        options: {
                            pre: "<s>",
                            peri: "טקסט מחוק",
                            post: "</s>"
                        }
                    }
                }
            }
        } );
        
        // קבוצה חדשה בתפריט מתקדם:
        $j( '#wpTextbox1' ).wikiEditor( 'addToToolbar', {
            'section': 'advanced',
            'groups': {
                'more': {
                    'label': ""
                }
            }
        } );
        
// נוסחאות
        $j( '#wpTextbox1' ).wikiEditor( 'addToToolbar', {
            'section': 'advanced',
            'group': 'more',
            'tools': {
                'formula': {
                    label: 'נוסחה מתמטית (LaTeX)',
                    type: 'button',
                    icon: 'http://upload.wikimedia.org/wikipedia/he/8/8b/EqNewBtn.png',
                    action: {
                        type: 'encapsulate',
                        options: {
                            pre: "<math>",
                            peri: "\ n^2 (example)",
                            post: "</math>"
                        }
                    }
                }
            }
        } );
    
        // צבע גופן
        $j( '#wpTextbox1' ).wikiEditor( 'addToToolbar', {
            'section': 'advanced',
            'group': 'more',
            'tools': {
                'colouredtext': {
                    label: 'טקסט צבוע',
                    type: 'button',
                    icon: 'http://upload.wikimedia.org/wikipedia/he/2/26/NewColorBtn.png',
                    action: {
                        type: 'encapsulate',
                        options: {
                            pre: '<span style="color: ColorName;">',
                            peri: "טקסט צבוע",
                            post: "</span>"
                        }
                    }
                }
            }
        } );

        // קו תחתי
        $j( '#wpTextbox1' ).wikiEditor( 'addToToolbar', {
            'section': 'advanced',
            'group': 'more',
            'tools': {
                'underline': {
                    label: 'קו תחתי',
                    type: 'button',
                    icon: 'http://upload.wikimedia.org/wikipedia/he/3/3a/NewUnderlineBtn.png',
                    action: {
                        type: 'encapsulate',
                        options: {
                            pre: '<u>',
                            peri: "טקסט עם קו תחתי",
                            post: "</u>"
                        }
                    }
                }
            }
        } );
        
        // הערה מוסתרת
        $j( '#wpTextbox1' ).wikiEditor( 'addToToolbar', {
            'section': 'advanced',
            'group': 'more',
            'tools': {
                'hiddennote': {
                    label: 'הערה מוסתרת',
                    type: 'button',
                    icon: 'http://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Gnome-document-new.svg/22px-Gnome-document-new.svg.png',
                    action: {
                        type: 'encapsulate',
                        options: {
                            pre: '<!-- ',
                            peri: "הערה מוסתרת",
                            post: " -->"
                        }
                    }
                }
            }
        } );
        
        // טקסט ממורכז
        $j( '#wpTextbox1' ).wikiEditor( 'addToToolbar', {
            'section': 'advanced',
            'group': 'more',
            'tools': {
                'center': {
                    label: 'טקסט ממורכז',
                    type: 'button',
                    icon: 'http://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Gnome-format-justify-center.svg/22px-Gnome-format-justify-center.svg.png',
                    action: {
                        type: 'encapsulate',
                        options: {
                            pre: '<center>',
                            peri: "טקסט ממורכז",
                            post: "</center>"
                        }
                    }
                }
            }
        } );
        
        // טקסט מיושר לשמאל
        $j( '#wpTextbox1' ).wikiEditor( 'addToToolbar', {
            'section': 'advanced',
            'group': 'more',
            'tools': {
                'center': {
                    label: 'טקסט מיושר לשמאל',
                    type: 'button',
                    icon: 'http://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Gnome-format-justify-left.svg/22px-Gnome-format-justify-left.svg.png',
                    action: {
                        type: 'encapsulate',
                        options: {
                            pre: '<div style="direction: ltr;">',
                            peri: "טקסט מיושר לשמאל",
                            post: "</div>"
                        }
                    }
                }
            }
        } );
        
        // תגי source
        $j( '#wpTextbox1' ).wikiEditor( 'addToToolbar', {
            'section': 'advanced',
            'group': 'more',
            'tools': {
                'sourcetags': {
                    label: 'עיצוב קוד מקור',
                    type: 'button',
                    icon: 'http://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Utilities-terminal.svg/22px-Utilities-terminal.svg.png',
                    action: {
                        type: 'encapsulate',
                        options: {
                            pre: '<source lang="text">\n',
                            peri: "טקסט",
                            post: "\n</source>\n"
                        }
                    }
                }
            }
        } );
        
        // טאב
        $j( '#wpTextbox1' ).wikiEditor( 'addToToolbar', {
            'section': 'advanced',
            'group': 'more',
            'tools': {
                'tabbutton': {
                    label: 'טאב',
                    type: 'button',
                    icon: 'http://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Gnome-object-flip-horizontal.svg/22px-Gnome-object-flip-horizontal.svg.png',
                    action: {
                        type: 'encapsulate',
                        options: {
                            pre: '\t'
                        }
                    }
                }
            }
        } );
        
        // רווח קשיח
        $j( '#wpTextbox1' ).wikiEditor( 'addToToolbar', {
            'section': 'advanced',
            'group': 'more',
            'tools': {
                'nbsp': {
                    label: 'רווח קשיח',
                    type: 'button',
                    icon: 'http://upload.wikimedia.org/wikipedia/commons/4/4b/Button_nbsp.png',
                    action: {
                        type: 'encapsulate',
                        options: {
                            pre: '&nbsp;'
                        }
                    }
                }
            }
        } );
        
        // תו כיווניות
        $j( '#wpTextbox1' ).wikiEditor( 'addToToolbar', {
            'section': 'advanced',
            'group': 'more',
            'tools': {
                'rlm': {
                    label: 'תו כיווניות',
                    type: 'button',
                    icon: 'http://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Gnome-format-text-direction-rtl.svg/22px-Gnome-format-text-direction-rtl.svg.png',
                    action: {
                        type: 'encapsulate',
                        options: {
                            pre: '&rlm;'
                        }
                    }
                }
            }
        } );

    } );
}

addOnloadHook(function() {
    if ( typeof $j != 'undefined' )
    {
        $j( '#wpTextbox1' ).bind( 'wikiEditor-toolbar-buildSection-main', function( e, section ) {
            section.groups.insert.tools.signature.action.options.post = '~~' + '~~';
        } );
    }
});
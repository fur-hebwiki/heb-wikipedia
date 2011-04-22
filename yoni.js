// כלום

var myTemplate;
var myParas = [];
var myURLselection;

function convertURLtoTemplateStep2()
{
	if (myParas[0] != null)
	{
		for (var n = 0; n < myParas.length; n++)
		{
			var splited = myParas[n].split('|');
			myTemplate += "|" + splited[1] + "=" + splited[0];
		}
		
		// clear myParas for next use
		while (myParas[0] != null)
			myParas.splice(0, 1);
	}
	myTemplate += '}}';
	document.editform.wpTextbox1.value = document.editform.wpTextbox1.value.replace(myURLselection, myTemplate);	
	document.editform.wpTextbox1.focus();
}

function convertURLtoTemplate()
{
	if (document.selection.createRange().text)
		myURLselection =  document.selection.createRange().text;
	else
	{
		alert("יש לסמן את כתובת ה-URL בתוך תיבת העריכה");
		return;
	}
	
	/* where:
	 * 'template' is template name
	 * 'url' is the primary text that should be found in selection
	 * 'get1..3' is regex to be used on selection
	 * 'set1..3' is the parameter name which should be used to enter the output of 'get1..3'
	 * 'otherpara' are other empty or optional parameters seperated by pipe.
	 */
	var templateList = [
	{
		'template': 'AMG',
		'url': 'allmusic.com/artist/',
		'get1': 'artist/(.*)',
		'set1': 'סופית',
		'otherpara': [ 'שם האומן|שם' ]
	},
	{
		'template': 'AMG',
		'url': 'allmusic.com/cg/',
		'get1': '[&?]sql=([^&]*)',
		'set1': 'id',
		'otherpara': [ 'שם האומן|שם' ]
	},
	{
		'template': 'Bizportal',
		'url': 'bizportal.co.il/shukhahon/bizprofile',
		'get1': '[&?]c_id=([^&]*)',
		'set1': '2',
		'otherpara': [ 'שם החברה|1' ]
	},
	{
		'template': 'CIA factbook',
		'url': 'cia.gov',
		'get1': 'geos/(.*)\.html',
		'set1': '1',
		'otherpara': [ 'כותרת (אופציונלי)|2' ]
	},
	{
		'template': 'Doi',
		'url': 'dx.doi.org',
		'get1': 'org/(.*)',
		'set1': '1'
	},
	{
		'template': 'Google book',
		'url': 'books.google.com',
		'get1': '[&?]id=([^&]*)',
		'set1': 'מזהה',
		'otherpara': [ 'שם הספר|שם הספר', 'כותב (אופציונלי)|כותב' ]
	},
	{
		'template': 'HebrewBooks',
		'url': 'hebrewbooks.org',
		'get1': 'org/(.*)',
		'set1': '3',
		'otherpara': [ 'שם המחבר|1', 'שם הספר|2', 'מלל נוסף (אופציונלי)|4' ]
	},
	{
		'template': 'Imdb company',
		'url': 'imdb.com/company',
		'get1': 'company/co([^/]*)',
		'set1': 'id',
		'otherpara': [ 'שם החברה|company' ]
	},
	{
		'template': 'Imdb name',
		'url': 'imdb.com/name',
		'get1': 'name/nm([^/]*)',
		'set1': 'id',
		'otherpara': [ 'שם (אופציונלי)|name' ]
	},
	{
		'template': 'Imdb title',
		'url': 'imdb.com/title',
		'get1': 'title/tt([^/]*)',
		'set1': 'id',
		'otherpara': [ 'כותרת (אופציונלי)|title' ]
	},
	{
		'template': 'TheMarker',
		'url': 'themarker.com/tmc/article.jhtml',
		'get1': '[&?]ElementId=([^&]*)',
		'set1': '3',
		'otherpara': [ 'שם המחבר|1', 'כותרת|2', 'מלל נוסף (אופציונלי)|4' ]
	}
	];

	for (var i = 0; i < templateList.length; i++)
	{
		if (myURLselection.indexOf(templateList[i].url) != -1)
		{
			myTemplate = '{{' + templateList[i].template;
			
			// get url-needed info
			if (templateList[i].get1)
			{
				var rx = new RegExp(templateList[i].get1);
				var m = rx.exec(myURLselection);
				if (m)
					myTemplate += '|' + templateList[i].set1 + '=' + m[1];
				else
					myTemplate += '|' + templateList[i].set1 + '=שגיאה';
			}
			if (templateList[i].get2)
			{
				var rx = new RegExp(templateList[i].get2);
				var m = rx.exec(myURLselection);
				if (m)
					myTemplate += '|' + templateList[i].set2 + '=' + m[1];
				else
					myTemplate += '|' + templateList[i].set2 + '=שגיאה';
			}
			if (templateList[i].get3)
			{
				var rx = new RegExp(templateList[i].get3);
				var m = rx.exec(myURLselection);
				if (m)
					myTemplate += '|' + templateList[i].set3 + '=' + m[1];
				else
					myTemplate += '|' + templateList[i].set3 + '=שגיאה';
			}
			
			// get other parameters from user
			if (templateList[i].otherpara)
			{
				var mypopup = window.open( "", "mypopup", "height=240, width=250" );
 
				var temptext = '<html><head><title>פרמטרים לתבנית</title>'
					+ '<script type="text/javascript">'
					+ 'function collectParas() {'
					+ 'var inputs = document.getElementsByTagName("input");'
					+ 'for (var j = 0; j < inputs.length; j++)'
					+ ' if(inputs[j].value != "")'
					+ ' window.opener.myParas.push(inputs[j].value + "|" + inputs[j].id);'
					+ 'window.opener.convertURLtoTemplateStep2(); }'
					+ '</script>'
					+ '</head><body style="direction: rtl; text-align: right;"><p>יש למלא את הפרמטרים הבאים:</p><form><table><tbody>';
					
				for (var q = 0; q < templateList[i].otherpara.length; q++)
				{
					var s = templateList[i].otherpara[q].split('|');
					temptext += '<tr><td>' + s[0] + ':</td><td> <input type="text" id="' + s[1] + '" /></td></tr>';
				}

				temptext +=	'</tbody></table></form>'
					+ '<p><a href="javascript:collectParas(); self.close();">סגירה והוספת התבנית</a></p>'
					+ '<p><a href="javascript:self.close()">סגירה וביטול</a></p>'
					+'</body></html>';
				mypopup.document.write(temptext);
				mypopup.document.close();
			}
			else
				convertURLtoTemplateStep2();
				
			return;
		}
	}
	alert("לא נמצאה תבנית מתאימה לקישור זה");
}

addOnloadHook(function() 
		{
			if ( wgAction == "edit") 
			{
				var tupload = document.getElementById( "t-upload" );
				if ( !tupload ) return;
 
				var link = document.createElement("a");
				link.appendChild ( document.createTextNode("הפיכת קישור חיצוני לתבנית") );
				link.href = "javascript:convertURLtoTemplate();";
				link.title = "הפיכת קישור חיצוני לתבנית";
			 
				var li = document.createElement("li");
				li.id = "t-linktotemplate";
				li.appendChild ( link );

				tupload.parentNode.insertBefore ( li, tupload );
			}
		});
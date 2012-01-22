// הוספת כפתור "בדיקה" שמבצע החלפות נפוצות של בוט ההחלפות וכן מתריע על בעיות סגנון ועיצוב שונות
// נכתב על ידי [[משתמש:ערן]] ו[[משתמש:קיפודנחש]]
// ניתן להגדיר קיצור מקלדת לכפתור הבדיקה באמצעות הגדרת checkToolKey במונובוק האישי (לדוגמה checkToolKey ='a' כשalt+shift+a  יהיה קיצור המקלדת)
// את כיתוב הכפתור ניתן לשנות מ"בדיקה" לשם הרצוי באמצעות הגדרת checkToolName במונובוק האישי. למשל checkToolName="בדיקת סגנון"
if ($.inArray(mw.config.get('wgAction'), ['edit', 'submit']) + 1)
	$(document).ready(addCheckButton);

function addCheckButton(){
	if (!window.checkToolName) checkToolName = 'בדיקה';
	$('#wpPreview').after( $('<input type="button" id="btnCheckTool" tooltip="בדיקה" value="'+checkToolName+'" />').click(chectTyTool.run));
}

var chectTyTool={
	textbox: null,
	formatReplacesConfig:[
		{from: /\[\[(.*?)\|\1([א-ת]*?)\]\]/g, to: '[[$1]]$2'},
		{from: /([א-ת]\]?\]?) ?([,\.])(\[?\[?[א-ת]{3})/g ,to: "$1$2 $3"},
		{from: /([א-ת])\( ?([א-ת])/g ,to: "$1 ($2"},
		{from: /\t/g ,to: " "},
		{from: /(\n\n)\n+/g ,to: "$1"},
		{from: /== ? ?\n\n==/g ,to:"==\n=="},
		{from: /^ ? ? \n/gm ,to:"\n"},
		{from: /[ \t][ \t]+/g ,to: ' '},
		],
	regexes: [],
	run: function() {
				if(this!=chectTyTool) {chectTyTool.run(); return;}
		var t = $('#wpTextbox1');
		this.textbox = t.length ? t[0] : null;
		if(!this.textbox || this.textbox.value.length == 0) return;
				if(!($('#checktyResults').length)) $('.editButtons').after('<div id="checktyResults" style="background:#ffEECC">הערות לבדיקה:</div>');
		//first call to remote functions than to local
		this.build_regexes();
		this.checkImages();
		this.disambigCheck();
		this.formatReplace();
		this.languageCheck();
		this.writeMsg($('<div>', {id: 'waitForDisambigs'}).text('ממתין לרשימת פירושונים מהשרת....'));
		},
		writeMsg:function(msg){
				if(msg instanceof Array){
				  if(msg.length==0) return;
				  msg='<div>'+msg.join('<br/>')+'</div>';
				}
		var x=$(msg).css('display','none').addClass('checktyMsg');
		$('#checktyResults').append(x);
		x.show('slow');
		},
		build_regexes: function(data) {
		if (/\{\{\s*ללא_בוט\s*\}\}/.test(this.textbox.value)) {
			this.writeMsg('<div>הדף מכיל תבנית "ללא בוט" ולכן לא יבוצעו החלפות</div>');
			return;
		}
		if (data) {
			var lines = data.split(/\n/);
			var clear_nowiki = /\|<nowiki>(.*)<\/nowiki>/;
			var matches;
			while (lines.length) {
				if (! (matches = lines.shift().match(/^\|(\d+)/)))
					continue;
				var num = parseInt(matches[1], 10);
				if (! (matches = lines.shift().match(clear_nowiki)))
					continue;
				try {
					var regex = new RegExp(matches[1], 'g');
				} catch(e) {
					//ignore
					continue;
				}
				if (! (matches = lines.shift().match(clear_nowiki)))
					continue;
				this.regexes[num] = [regex, matches[1]];
			}
			this.process_page();
		}
		else
			$.ajax({
				url: wgServer+mw.util.wikiScript('index')+'?title='+mw.util.wikiUrlencode('ויקיפדיה:בוט/בוט_החלפות/רשימת_החלפות_נוכחית')+'&action=raw&ctype=text/x-wiki',
				success: function(data, status){
					chectTyTool.build_regexes(data);
				}
			});
	},
	process_page: function() {
		var t = this.textbox.value,
			skip_dict = {},
			skip_ar = [],
			actual_replaced = [],
			skipmatch = t.match(/{{ללא[_ ]בוט\|\s*(\d+)\s*}}/g);
		if (skipmatch)
			for (var i = 0; i < skipmatch.length; i++) {
				var matches = skipmatch[i].match(/{{ללא[_ ]בוט\|\s*(\d+)\s*}}/);
				skip_dict[parseInt(matches[1], 10)] = true;
				skip_ar.push(matches[1]);
			}

		var specials = []; 
		while (true) { //extract inner links, inner templates and inner params - we don't want to sptit those.
			var match = t.match(/(\{\{[^{}\]\[]*\}\}|\[\[[^{}\]\[]*\]\]|\[[^{}\]\[]*\](?:[^\]]))/);
			if (! match || ! match.length)
				break;
			specials.push(match[0]);
			t = t.replace(match[0], "\0" + specials.length + "\0");
		}
		for (var i in this.regexes)
			if (! skip_dict[i] && ! isNaN(i))
				if (this.regexes[i][0].test(t)) {
					actual_replaced.push($.trim(this.regexes[i][1].replace(/\$\d*/g, '')));
					t = t.replace(this.regexes[i][0], this.regexes[i][1]);
				}
		while (true) {
			var match = t.match(/\0(\d+)\0/);
			if (! match || ! match.length)
				break;
			t = t.replace(match[0], specials[parseInt(match[1], 10)-1]);
		}
		this.textbox.value = t;
		var msg = ['‏ריצת סקריפט ההחלפות הסתיימה. אנא בצעו "הצגת שינויים" לפני שמירה, כדי לוודא שהסקריפט לא גרם נזק.‏'];
		if (skip_ar.length)
			msg.push('‏החלפות שלא התבצעו בגלל תבנית "ללא בוט": ‏' + skip_ar.join(', '));
		msg.push('');
		msg.push(actual_replaced.length
			? '‏התבצעו ההחלפות הבאות: ‏' + actual_replaced.join('‏ ,‏')
			: '‏לא התבצעו החלפות - הדף "נקי".‏');
		this.writeMsg(msg);

		if (actual_replaced.length && $('#wpSummary').val() == '')
			$('#wpSummary').val('סקריפט החלפות (' + actual_replaced.join(', ') + ') ');
	},
	formatReplace:function(){
		var txt = this.textbox.value;
		//תיקוני פורמט ויקי
		$(this.formatReplacesConfig).each(function(i,o){txt=txt.replace(o.from,o.to);})
		this.textbox.value = txt;
	},
	disambigCheck: function (){
		window.dabLinksAjaxCheck = function(res) {
			window.disambigResponse=res;
			$('#waitForDisambigs').remove();
			if (!res || !res.query || !res.query.pages || res.query.pages.length==0 || res.query.pages[0]==null) return;
				var disambigs=$('<div id="disambigWarnning">הגרסה השמורה האחרונה של הדף מקשרת לדפי פירושונים. אנא תקנו את הקישורים לדפים הבאים: </div>');
			var isFirst=true;
			for(var i=0;i<res.query.pages[0].disambiguationlinks.length;i++){
				var disTitle=res.query.pages[0].disambiguationlinks[i].title;
					//ignore purposely links to disambig pages.
					if(disTitle==mw.config.get('wgTitle')+' (פירושונים)') continue;
					if(!isFirst){ disambigs.append(', '); }
				isFirst=false;
				disambigs.append($('<a href="'+mw.util.wikiGetlink(disTitle)+'">'+disTitle+'</a>').click(function(){
					var disambigName=$(this).text();
					$.ajax({
						url: mw.util.wikiScript('index'),
						data: {
							title: disambigName,
							action: 'render'
						},
						success: function(data){
							chectTyTool.resolveDisambig(disambigName,data);
						}
					});
					return false;
				}));
			}
			//ignore disambigs warning if there is no real link to disambigs
			if(!isFirst) chectTyTool.writeMsg(disambigs);
		}
		//call to toolserver if there is no cache
		if(!$('#disambigWarnning').length){
			var pn = mw.config.get('wgPageName').replace(/^תבנית:/, "Template:"); // limitation of dablink.
			pn = mw.util.wikiUrlencode(pn);
			var urlToLoad='http://toolserver.org/~dispenser/cgi-bin/dablinks.py?lang=he&page='+pn+'&format=json&callback=dabLinksAjaxCheck';
			importScriptURI(urlToLoad);
		}
		else { dabLinksAjaxCheck(disambigResponse); }
	},
	resolveDisambig: function(name,data){
		var offset=0;
		var textbox=this.textbox;
		var linkRgx=new RegExp('(?:\\.|^)([^\\.\n]*\\[\\['+name.replace(/([\(\)\"\'\?])/g, "\\$1") +'[\\|\\]].*?)[\\.\\n]','m');
		var cSentence=$('<div>');
		var options=$('<div>').append($('li',data).map(function(){
			var a = $(this).children('a').get(0);
			if (a) {
				var storeTitle = $(this).text();
				var anchor = '', h = a.href;
				if (h.indexOf('#') + 1)
					anchor = decodeURI(h.substr(h.indexOf('#')).replace(/\./g, '%').replace(/_/g, ' '))
				$(a).text(a.title.replace(" (הדף אינו קיים)", "") + anchor);
				a.title = storeTitle;
			}
			return a || null;
		}).click(resolve));
		var disambigDialog=$('<div>').append('מה הכוונה ב "' + name + '" במשפט: ' + '<hr/>').append(cSentence).append(options.buttonset()).dialog({title: 'תיקון פירושונים'});
		findSentence();
		function findSentence(){
			var text=textbox.value.substr(offset);
			var m=text.match(linkRgx);
			if(!m) {
				disambigDialog.dialog('close');
				return;
			}
			offset+=text.indexOf(m[1]);
			var linkIndex=m[1].indexOf('[['+name)+2;
			var html=m[1].substr(0,linkIndex)+'<big>'+name+'</big>'+m[1].substr(linkIndex+name.length);
			cSentence.html(html);
		}
		function resolve(){
			var answer=$(this).text();
			var text=textbox.value;
			var startLink=text.indexOf('[['+name,offset);
			if(text.charAt(startLink+2+name.length)!='|')
				answer+='|'+name;
			offset+=answer.length+2;
			text=text.substr(0,startLink+2)+answer+text.substr(startLink+2+name.length);
			textbox.value=text;
			findSentence();
			return false;
		}
	},
	checkImages: function(data){
		if(!data){
//in case there are no images in page
		if(!mw.util.getParamValue('section') && !(/\[\[(תמונה|קובץ|File|Image):/i.test(this.textbox.value)))
		{
			var fistURL=this.fistURL({datatype:'articles',data: mw.config.get('wgPageName')});
			var msg=$('<div>',{text:'בדף זה אין תמונות. ניתן לחפש תמונות חופשיות ממקורות שונים. '}).append($('<a>',{href:fistURL,text:'חיפוש תמונות',target:'_blank'}));
			this.writeMsg(msg);
			return;
		}
		$.getJSON(mw.util.wikiScript('api'),{action:'query',generator:'images',titles:mw.config.get('wgPageName'),prop:'templates',format:'json'},
			function(data){
				if(data && data.query && data.query.pages) chectTyTool.checkImages(data.query.pages);
			});
			}
		else
		{
			var fairUsageTemplates=['תבנית:שימוש הוגן'];
			var fairUseImgs=$.map(data,function(o){
					if(!o.templates) return;
					var isFairUsage;
					$.each(o.templates,function(k,license){
						if($.inArray(license.title,fairUsageTemplates)!=-1){
							isFairUsage=true;
							return false;
						}
					});
				if (isFairUsage) return o.title;
			});
			if(fairUseImgs.length==0) return;
		//add message with fair usage images
			var fistURL=this.fistURL({data:fairUseImgs.join('%0D%0A'), datatype: 'replaceimages'});
			var msg=$('<div>',{text:'הדף מכיל תמונות בשימוש הוגן, שמומלץ להחליפן בחלופות חופשיות במידת האפשר. '}).append($('<a>',{href:fistURL,text:'חיפוש חלופות חופשיות',target:'_blank'}));
			this.writeMsg(msg);
		}
	},
	fistURL:function(p){
		return 'https://toolserver.org/~magnus/fist.php?doit=1&language=he&project=wikipedia&params[free_only]=1&params[commons_max]=5&params[flickr_max]=5&params[include_flickr_id]=1&params[flickr_new_name_from_article]=1&params[default_thumbnail_size]=250&params[jpeg]=1&params[png]=1&params[gif]=1&params[svg]=1&params[output_format]=out_html&params[min_width]=80&params[min_height]=80&sources[languagelinks]=1&sources[commons]=1&sources[flickr]=1&params[ll_max]=5&'+$.param(p);
	},
	languageCheck:function (){//בדיקות סגנון ולשון
		var remarkSuperlatives		= 'ייתכן שהערך כולל סופרלטיבים מיותרים';
		var remarkWhereWordStart	  = 'בערך מופיעות אותיות בכל\"ם בסמוך למילה ';
		var remarkWhereWordEnd		= '. מומלץ לנסח זאת מחדש עם המילים לאן או מאין';
		var remarkUnsuitableExpressionStart  = 'בערך מופיע הביטוי ';
		var remarkPossibleUnsuitableExpressionStart  = 'ייתכן ש' + remarkUnsuitableExpressionStart;
		var remarkEmoExpressionEnd	= ' שאין מקומו באנציקלופדיה, המביאה מידע בצורה מאוזנת, ואין לערב בה את רגשות הכותבים, גם אם הם מקובלים על הכול (ראו ויקיפדיה:לשון)';
		var remarkWrongConditionalExpressionEnd = 'במובן של מילת תנאי. אם זהו משפט תנאי, יש לכתוב במקומו את המילה אם.';
		var remarkObviousEnd = ". אם הפרט אכן ידוע לכול, אין טעם לציין זאת, ואם לא אז מעורר תחושת בורות אצל הקוראים (מידע נוסף ב ויקיפדיה:לשון)";
		var checks=[
			{'test':'במידה ש','remark':remarkPossibleUnsuitableExpressionStart + 'במידה ש' + remarkWrongConditionalExpressionEnd},
			{'test':'במידה ו','remark':remarkPossibleUnsuitableExpressionStart + 'במידה ו' + remarkWrongConditionalExpressionEnd},
			{'test':'בגלל ש','remark':remarkPossibleUnsuitableExpressionStart + 'בגלל ש. אם הוא אכן מופיע, מומלץ לשקול להחליפו בכיוון ש, משום ש, מאחר ש או מפני ש (מידע נוסף ב ויקיפדיה:לשון)'},
			{'test':'עובדה מעניינת היא','remark':'אל תעיד אל עיסתך! מומלץ להימנע מהביטוים עובדה מעניינת היא או יש לציין. יש לתת לקורא להחליט אם העובדה ראויה לציון. (מידע נוסף ב ויקיפדיה:לשון'},
			{'test':'יש לציין','remark':'אל תעיד אל עיסתך! מומלץ להימנע מהביטוים עובדה מעניינת היא או יש לציין. יש לתת לקורא להחליט אם העובדה ראויה לציון. (מידע נוסף ב ויקיפדיה:לשון'},
			{'test':'כידוע' ,'remark':remarkUnsuitableExpressionStart + 'כידוע' + remarkObviousEnd},
			{'test':'כמובן' ,'remark':remarkUnsuitableExpressionStart + 'כמובן' + remarkObviousEnd},
			{'test':'נולד להוריו','remark':'בערך מוזכר הצירוף נולד להוריו. מן הסתם נולד להוריו, ואין צורך לציין זאת (מידע נוסף ב ויקיפדיה:לשון)'},
			{'test':'נולדה להוריה','remark':'בערך מוזכר הצירוף נולדה להוריה. מן הסתם נולדה להוריה, ואין צורך לציין זאת (מידע נוסף ב ויקיפדיה:לשון)'},
			{'test':'למרות ש' ,'remark':remarkPossibleUnsuitableExpressionStart + 'למרות ש. אם הוא אכן מופיע, מומלץ לשקול להחליפו באף על פי ש (מידע נוסף ב ויקיפדיה:לשון)'},
			{'test':'זכה לביקורת','remark':remarkUnsuitableExpressionStart + 'זכה לביקורת. יש להעדיף את הביטוי ספג ביקורת (מידע נוסף ב ויקיפדיה:לשון)'},
			{'test':'זכתה לביקורת','remark':remarkUnsuitableExpressionStart + 'זכתה לביקורת. יש להעדיף את הביטוי ספגה ביקורת (מידע נוסף ב ויקיפדיה:לשון)'},
			{'test':'חייו המוקדמים' ,'remark':remarkUnsuitableExpressionStart + 'חייו המוקדמים. יש להעדיף ראשית חייו, ילדותו או נעוריו (מידע נוסף ב ויקיפדיה:לשון)'},
			{'test':'חייה המוקדמים' ,'remark':remarkUnsuitableExpressionStart + 'חייה המוקדמים. יש להעדיף ראשית חייה, ילדותה או נעוריה (מידע נוסף ב ויקיפדיה:לשון)'},
			{'test':'כנראה ש' ,'remark':remarkUnsuitableExpressionStart + 'כנראה ש. רצוי להחליפו בנראה ש'},
			{'test':'להיכן','remark':remarkWhereWordStart + 'היכן' + remarkWhereWordEnd},
			{'test':'מהיכן','remark':remarkWhereWordStart + 'היכן' + remarkWhereWordEnd},
			{'test':'לאיפה','remark':remarkWhereWordStart + 'איפה' + remarkWhereWordEnd},
			{'test':'מאיפה','remark':remarkWhereWordStart + 'איפה' + remarkWhereWordEnd},
			{'test':'הכי טוב','remark':remarkUnsuitableExpressionStart + 'הכי טוב. כדאי לשקול להחליפו לטוב ביותר (מידע נוסף ב ויקיפדיה:שגיאות תרגום נפוצות)'},
			{'test':'נפלא','remark':remarkSuperlatives},
			{'test':'מחריד','remark':remarkSuperlatives},
			{'test':'נהדר','remark':remarkSuperlatives},
			{'test':'למרבה הצער','remark':remarkUnsuitableExpressionStart + 'למרבה הצער' + remarkEmoExpressionEnd},
			{'test':'למרבה המזל','remark':remarkUnsuitableExpressionStart + 'למרבה המזל' + remarkEmoExpressionEnd},
			{'test':'ראה את עצמו','remark':remarkUnsuitableExpressionStart + 'ראה את עצמו. אי אפשר להיכנס לראש של אדם ואי אפשר לדעת איך הוא ראה את עצמו (ראו ויקיפדיה:לשון)'},
			{'test':'בתקופת תור','remark':remarkUnsuitableExpressionStart + 'בתקופת תור. אם פירוש המילה תור בהקשר זה הוא תקופה, זו כפילות מיותרת (ראו ויקיפדיה:לשון)'},
			{'test':'כמו לדוגמה','remark':remarkUnsuitableExpressionStart + 'כמו לדוגמה. זו כפילות מיותרת (ראו ויקיפדיה:לשון)'},
			{'test':'בשנים האחרונות','remark':remarkUnsuitableExpressionStart + 'בשנים האחרונות. ביטוי זה תלוי זמן ויש להחליפו בציון מדויק יותר של זמן (ראו ויקיפדיה:לשון)'},
			{'test':'בימים אלה','remark':remarkUnsuitableExpressionStart + 'בימים אלה. ביטוי זה תלוי זמן ויש להחליפו בציון מדויק יותר של זמן (ראו ויקיפדיה:לשון)'},
			{'test':'לאחרונה','remark':remarkUnsuitableExpressionStart + 'לאחרונה. ביטוי זה תלוי זמן ויש להחליפו בציון מדויק יותר של זמן (ראו ויקיפדיה:לשון)'},
			{'test':'כיום','remark':remarkUnsuitableExpressionStart + 'כיום. ביטוי זה תלוי זמן ויש להחליפו בציון מדויק יותר של זמן (ראו ויקיפדיה:לשון)'},
			{'test':' ז\"ל ' ,'remark':'אין להצמיד לאדם את התואר ז\"ל (מידע נוסף ב ויקיפדיה:עקרונות מיוחדים לשפה העברית)'}
		];

		var txt = this.textbox.value;
				var checkWarnings=$('<div></div>');
				var highlightStr=this.highlightString;
				var findFunc=function(){
			var toFind=unescape($(this).attr('href').substr(1));
			highlightStr(toFind);
			return false;
		};
		for(x in checks){
			if(txt.indexOf(checks[x]['test'])!=-1) {
				checkWarnings.append($('(<a href="#'+escape(checks[x]['test'])+'">חיפוש</a>)').click(findFunc));
				checkWarnings.append('&nbsp;-&nbsp;'+checks[x]['remark']+'<br/>');
			}
		}

		//בדיקות עיצוביות: רוחב אלמנטים בערך
		var largeElement= /[6789][0-9][0-9]px/;

		if(largeElement.test(txt)) checkWarnings.append('בערך קיים אלמנט גדול, רצוי להקטין כדי שיתאים לרזולוציות נמוכות <br/>');;
		var manyLi=RegExp('(?:\n\\*.*){20}');
		if(manyLi.test(txt)) checkWarnings.append('נראה כי בערך רשימה של מעל 20 פריטים. כדאי לשקול לפצלה לשני טורים באמצעות תבנית:שני טורים');
		if(checkWarnings.html().length)
			this.writeMsg(checkWarnings);
	},
	//original version from http://code.google.com/p/proveit-js/source/browse/ProveIt_Wikipedia.js#384
	//thanks to Georgia Tech Research Corporation. Atlanta, GA 30332-0415
	highlightString : function(toFind) {
		var txtArea=$('#wpTextbox1');
		var nextPlace=txtArea.val().indexOf(toFind,txtArea.textSelection('getCaretPosition')+1);
		if(nextPlace==-1) nextPlace=txtArea.val().indexOf(toFind);//start from begining
		if(nextPlace==-1) return;//not found... nothing to do
		var origText = txtArea.val();
		txtArea.val(origText.substring(0, nextPlace));
		txtArea.focus();
		txtArea.scrollTop(1000000); //Larger than any real textarea (hopefully)
		var curScrollTop = txtArea.scrollTop();
		txtArea.val(origText);
		if(curScrollTop > 0) {
			var HALF_EDIT_BOX_HEIGHT= 200;
			txtArea.scrollTop(curScrollTop + HALF_EDIT_BOX_HEIGHT);
		}
		txtArea.focus().textSelection('setSelection',
			{
				start: nextPlace,
				end: nextPlace+toFind.length
			});
	}
};

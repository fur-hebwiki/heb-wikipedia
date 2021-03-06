﻿/*Author:[[user:שמוליק]] with a lot of help from [[user:קיפודנחש]] */ 
function wikiit() {

	function dateFormat(dateArr)
	{
		var m = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
		if (dateArr instanceof Array)
		{
			if (dateArr.length != 3)
				return '';
				
			dateArr[1] = m[Number(dateArr[1])-1];
			if (Number(dateArr[2])<=50)
				dateArr[2]=20+dateArr[2];
			else if (Number(dateArr[2])>=50&&Number(dateArr[2])<100)
				dateArr[2]=19+dateArr[2];
				
			if (dateArr[0].charAt(0) == '0')
				dateArr[0] = dateArr[0].substring(1, dateArr[0].length);
			
			dateArr = dateArr[0]+" ב"+dateArr[1]+" "+dateArr[2];
		}
		return jQuery.trim(dateArr);
	}
	
	function engDateParse(engDate)
	{
		var m = ["January" , "February" , "March" , "April", "May", "June", "July", "August", "September", "October","November", "December"];
		engDate = engDate.match(/(\w+) (\d+), (\d+)/);
		return [engDate[2], (m.indexOf(engDate[1]) + 1) , engDate[3] ];
	}
 
	var ATags = [/<a .*?>/gi, /<\/a>/gi];
 
	function match (str, expr){str = str?str.match(expr):str; return (str&&str.length>1)?str[1]:''}
 
  var data = 
  [
    {
     hostname: /www\.m?ynet\.co\.il/, minimum:6,
     params:[
		{str : (location.hostname.indexOf('mynet')>=0)?'mynet':'ynet'},
		[
			{elements : ['.authorHtmlCss',' ו'] },
			{telem : 'td:has(h1:first) .text14:first', func: [function(str){return (str.length<100)?str:'';}]},
			{elem : 'font.text14 span p:last', match: /^\((.*?)\)$/},
			{telem : ".text16w" , match:/\/(.*?)$/},
			{telem : ".text16w"},
			
		],
		[
			{elem : 'h1'},
			{str : $("meta[property='og:title']").attr("content")}, //seems wrong on http://www.ynet.co.il/articles/0,7340,L-3676702,00.html
			{elem : 'head>title', match:/(?:ynet\s*-?)?([^\-]*)/}
		],
		{str : location.href, match: /L-(.*?),/},
		[
			{elem : 'td:has(h1:first) .text12g:last', match: /(\d+\.\d+\.\d+)/, split:'.', func:dateFormat},
			{elem : ".text12g + .text12g", match: /(\d+\.\d+\.\d+)/, split:'.', func:dateFormat}
		],
		{str: ''},
		{str:  location.href, match: /ynet.co.il\/[^[\/]*\/(\d+)/, defvalue: '0'},
		{str : location.href, match: /ynet.co.il\/([^[\/]*)/, defvalue: 'articles'}
     ]
	},
	{
	hostname: /^\w+\.walla\.co\.il$/, minimum:6,
	params:[
		{str : 'וואלה!'},
		{elem : 'div.wp-0-b:first span:first', match: /מאת:(.*),/, remove:ATags},
		{elem : 'h1'},
		{str : location.href, match:/w=\/\d*\/(\d+)/},
		[ {elem:["h1","parent","children","eq,2"], match:/,(.*),/}, {telem: ".w2.txt-w:last", match:/, (\d+ ב.*? \d+),/ }],
		{str : ''},
		{str : location.href, match:/w=\/(\d*)\/\d+/}
     ]
    },
    {
    hostname: /^\w+\.nana10\.co\.il$/i, minimum:6,
     params:[
      {str : 'נענע10'},
      {telem: '.Author:first', remove:['תרבות ובידור נענע 10','נענע 10']},
      {telem: '#ArtTitle'},
      {str : location.href, match:/ArticleID=(\d+)/i},
      {elem: '.ArticleDate:first', match:/ (.*)$/, split:'/', func:dateFormat},
      {str :''},
      {str : location.href, match:/(\w+)\.nana/i}
     ]
    },
    {
    hostname: "www.haaretz.co.il", 
     params:[
      {str : 'הארץ'},
      {telem: "#content  .author-bar li:eq(0)",  remove:['מאת ',/צילום: .*?(?:(?:[,])|(?:$))/m] },
      {telem:'h1.mainTitle'},
      {str : location.href, match:/(\d\.\d+)$/},
	  {telem: '.prsnlArticleEnvelope .author-bar li:eq(1)', match:/(\d+\.\d+\.\d+)/, split:'.' , func:dateFormat}
	  ]
    },
    {
    hostname: "www.inn.co.il", hrefmatch:/www\.inn\.co\.il.*Besheva/i,
     params:[
      {str : 'בשבע'},
      {elem:'.Author:first', match:/<\/div>(.*)$/},
      {elem:'h3:last'},
      {str : location.href, match: /^.*\/(.*)$/},
      {elem:'.Date:first', match:/^(.*),/, split:'/' ,func:dateFormat}
     ]
    },
    {
    hostname: "www.inn.co.il",
     params:[
      {str : 'ערוץ7'},
      {elem:'.Author:first', match:/<\/div>(.*)$/},
      {elem:'h2:first'},
      {str : location.href, match: /^.*\/(.*)$/},
      {elem:'.Date:first', match:/:(.*),/, split:'/', func:dateFormat}
     ]
    },
    {
    hostname: "www.globes.co.il",
     params:[
      {str : 'גלובס'},
      {elem:'#coteret_Writer, .g_Article_Author, #F_Author' , remove:[/<.*?>/gmi , /&nbsp;/gmi,'מאת '] },
      {elem:'#F_Title, .mainArticletitle' },
      {str : location.href, match: /=(\d+)/},
      {elem:'#coteret_Modified, #F_Modified_on, .g_Article_DateTime', match:/^(.*),/, split:'/', func:dateFormat}
     ]
    },
    {
    hostname: "www.the7eye.org.il",
     params:[
      {str : 'העין השביעית'},
      {elem: '#ctl00_PlaceHolderMain_ArticleAuthor_m_EditModePanel_Disp span', remove:["מאת:"].concat(ATags)},
      {elem: "a[name='1']"},
      {str : location.href, match: /^.*?Pages\/(.*?)\.aspx/},
      {elem: "#ctl00_PlaceHolderMain_PublishDate_m_EditModePanel_Disp span", remove:["תאריך פרסום: "], func:dateFormat, split:'/'},
      {str : location.href, match:/il\/(.*?)\/Pages/}
     ]
    },
    {
    hostname: "www.xnet.co.il", minimum:6,
     params:[
      {str : 'xnet'},
      {elem: '.author_name_link:visible'},
      {elem: "h1"}, //can use ".colorTitle:first>.right" for descrition or join them to one long title
      {str : location.href, match: /L-(.*?),/},
      {elem: ".author.clearFix cite", match: /(\d+\.\d+\.\d+)/ ,func:dateFormat, split:'.'},
      {str :''},
      {str : location.href, match: /articles\/(\d+),/, defvalue: '0'}
     ]
    }, 
    {
    hostname: "www.bhol.co.il",
     params:[
      {str : 'בחדרי חרדים'},
      {elem: '#author', match:/^\s*(.*?)\s*,/},
      {elem: '.mainTitle'},
      {str : location.href, match: /id=(\d+)/},
      {elem: '#author', match:/(\d+\/\d+\/\d+)/, split:'/', func:dateFormat}
     ]
    },
    {
    hostname: "actv.haifa.ac.il",
     params:[
      {str : 'הערוץ האקדמי'},
      {elements: ["#ctl00_ContentPlaceHolder_Content_Repeater_Humans_ctl00_HyperLink_Human_Name", ' ו']},
      {elem: '#ctl00_ContentPlaceHolder_Content_Label_Title'},
      {str : location.href, match: /it=(\d+)/},
      {elem: "#ctl00_ContentPlaceHolder_Content_Label_DateBroadcast" , remove:["תאריך הקלטה:"] ,split:'/', func:dateFormat}
     ]
    },
    {
    hostname: "www.mouse.co.il", //only "CM.articles" have a template!
     params:[
      {str : 'עכבר העיר'},
      {elem: "p.katava-info:first", match: /מאת:(.*?)(?:$|,)/, remove:[", עכבר העיר אונליין"]},
      {telem: ".katava-box.box h1"},
      {str : location.href, match: /item,(.*?),\.aspx$/},
      {elem: "p.katava-info:first", match: /^\W+ (\d+ \W+ \d+)/}
     ]
    },
    {
    hostname: "www.nrg.co.il", condition: function(){return ($("h1:first").length > 0)},  minimum:8,
     params:[
      {str : 'nrg'},
      {elem: "#articleCBar span:first, .cdat.small.bold", match: [/<!-- ARTICLE_WRITER_START --> (.*?)<!-- ARTICLE_WRITER_END -->/ , /(.*?)&nbsp;\|/] , remove:ATags.concat(["<span>"])},
      {telem: "h1:first"},
      {str : location.href, match: /(\d+\/\d+)\.html/},
      {elem: "#articleCBar span:first", match: /(\d+\/\d+\/\d+)/, split:'/',  func:dateFormat},
      {str : ''},
      {str : location.href, match: /online\/(.*?)\/ART/},
      {str : location.href, match: /ART(\d+)/}
     ]
    },
    {
    hostname: "www.nrg.co.il", condition: function(){return ($("h1:first").length == 0)},  minimum:8,
     params:[
      {str : 'nrg'},
      [
		{telem: "font.newsVitzCredit", remove:["NRG מעריב"]},
		{elem: "td.newsVitzCredit", match:/^(.*?)<br>/ ,remove:["NRG מעריב"]},
		{telem: "font.newsVitzBody:first", match:/^(.*)/ ,remove:["NRG מעריב"]}
      ],
      {telem: "#titleS1"},
      {str : location.href, match: /(\d+\/\d+)\.html/},
      [
		{telem: "font.newsVitzCredit:last, .opinionMainVitzBody", match: /(\d+\/\d+\/\d+)/, split:'/',  func:dateFormat},
		{elem: "td.newsVitzCredit",  match: /(\d+\/\d+\/\d+)/, split:'/',  func:dateFormat}
	  ],
      {str : ''},
      {str : location.href, match: /online\/(.*?)\/ART/},
      {str : location.href, match: /ART(\d+)/}
     ]
    },
    {
    hostname: "www.one.co.il",
     params:[
      {str : 'one'},
      {elem: ".f11.rtl.right", remove:["מאת מערכת ONE","מאת "]},
      {elem: "#_ctl0_Main_ucFullArticle_lblCaption"},
      {str: location.href, match:[/Article\/\d\d\-\d\d\/\d,\d+,\d,\d\/(\d+)/ ,/Article\/(\d+)/,/id=(\d+)/]},
      {elem: ".f10.left" ,match: /(\d+\/\d+\/\d+)/, split:'/',  func:dateFormat}
     ]
    },
    {
    hostname: "www.israelhayom.co.il",
     params:[
      {str : 'ישראל היום'},
      {elem: ".normal14 .normal"},
      {elem: ".h2"},
      {str: location.href, match:/\?id=(\d+)/},
      {elem: ".newsletter_title_date" , split:'.',  func:dateFormat}
     ]
    },
   {
    hostname: "www.mako.co.il",
     params:[
      {str : 'mako'},
      {telem: ".writerData *:visible:first", shouldnt:/\d+\/\d+\/\d+/},
      {telem: "h1"},
      {str: location.href, match:/Article-(.*?).htm/},
      {str: location.href, match:/www\.mako\.co\.il\/(.*?)\/Article/},
      {elem:".writerData *:last", match:/(\d+\/\d+\/\d+)/, split:'/',  func:dateFormat}
     ]
    },
   {
    hostname: /^\w+\.themarker\.com$/i,
     params:[
      {str : 'TheMarker1'},
      {telem: ".author-bar li:eq(2), .h3_author",  remove:["מאת:"]},
      {elem: "h1.mainTitle, h2"},
      {str: location.href, match:/com\/(.*?)$/},
      {telem:".author-bar li:eq(1), .h3_date", match:/(\d+\.\d+\.\d+)/, split:'.',  func:dateFormat},
      {str: location.href, match:/\/\/(.*?).themarker/i , defvalue:"www"}
     ]
    },
	{
    hostname: "www.calcalist.co.il", minimum:6,
     params:[
      {str : 'כלכליסט'},
      {telem: "h3:first"},
      {elem: "h1"},
      {str: location.href, match:/L\-(\d+)/},
      {elem:"table[style^=w] span:first", match:/(\d+\.\d+\.\d+)/m, split:'.',  func:dateFormat},
      {str:''},
      {str: location.href, match:/les\/(\d+)\,/i, defvalue:"0"}
     ]
    },
	{
    hostname: "www.news1.co.il",
     params:[
      {str : 'NFC'},
      {telem: "#ctl00_ContentMain_UcArticle1_lnkWriterName, #ctl00_ContentMain_UcArticle1_lblTopWriterName", remove:["מחלקה ראשונה"]},
      {telem: "#ctl00_ContentMain_UcArticle1_lblHead1, #ctl00_ContentMain_UcArticle1_lblSpecialTitle"},
      {str: location.href, match:/ve\/(.*?)\.html/},
      {telem:"#ctl00_ContentMain_UcArticle1_lblCreateDate", match:/(\d+\/\d+\/\d+)/m, split:'/',  func:dateFormat}
     ]
    },
    { //even this is not exactly "External Link Template"
	hostname: "aleph.nli.org.il",
     params:[
      {str : 'מאמר'},
      {telem: "#fullRecordView th:contains(מחבר):first + td", func:function(str){var strs = str.match(/^(.*?), (.*?)$/); return (strs.length==3)?(strs[2]+" "+strs[1]):str;}},
      {telem: "#fullRecordView th:contains(כותר):first + td", match:/^(.*?)\.?[\s\u202c]*$/},
      {telem: "#fullRecordView th:contains(בתוך):first + td", match:/^(.*?) \(/},
      {str:''},
      {telem: "#fullRecordView th:contains(בתוך):first + td", match:/\((.*?)\)/, func:function(yh){return yh.substring(0,yh.length-1) + '"' + yh.substr(yh.length-1);}},
      {telem: "#fullRecordView th:contains(בתוך):first + td", match:/(\d+\-\d+)/},
      {telem: "#fullRecordView th:contains(מס' מערכת):first + td", prefix: "רמבי="}
     ]
    },
    { // for [[user:Ofekalef]]
	hostname: "www.rollingstone.com",
     params:[
      {str : 'רולינג סטון'},
      {telem: ".author", remove:["By"]},
      [{telem: "h1"}, {elements:["h3:first, h4"," - ", true]}],
      {str: location.href, match:/rollingstone.com\/(.*)$/},
      {telem:".date", match:/(\w+ \d+, \d+)/m, func:[engDateParse, dateFormat]}
     ]
    },
    {
	hostname: "www.yeshiva.org.il",  hrefmatch:/\/midrash\/shiur\.asp\?id=\d+/i,
     params:[
      {str : 'אתרישיבה1'},
      {telem: ".trav", remove:["הרב"]},
      {telem: "h1"},
      {str: location.href, match:/\?id=(\d+)/}
     ]
    },
    {
	hostname: "www.yeshiva.org.il",
     params:[
      {str : 'אתרישיבה'},
      {telem: ".trav", remove:["הרב"], prefix:"הרב="},
      {telem: "h1", prefix:"נושא="},
      {str: location.href, prefix:"קישור="}
     ]
    },
    {
	hostname: "www.sport5.co.il",
     params:[
      {str : 'ספורט 5'},
      {telem: "span#lblWriter2, #tdAuthorDateTime font", remove:["מערכת אתר ערוץ הספורט"]},
      {telem: "h1#divTopTitle"},
      [
		{str: location.href, match: /Article\.\d+\.(\d+)\.html/},
		{str: location.href, match: /docID=(\d+)/}
	  ],
      [
		{str: location.href, match: /Article\.(\d+)\.\d+\.html/},
		{str: location.href, match: /FolderID=(\d+)/}
	  ],
      {telem: "#lblDate2", split:'/',  func:dateFormat}
     ]
    },
	{
		hostname: "britishpathe.com",
		hrefmatch: /britishpathe\.com/i,
		params:[
			{str : 'British Pathe'},
			{telem: "#record-container>h1", remove:["video newsreel film"]},
			{str: location.href, match: /id=(\d+)/},
			{telem: "#researcher-stats td:eq(0)", split: '/', func:dateFormat}
		]
	}
  ];
 
  var isFound = false;
  for (var i in data)
  {
    if (location.hostname.match(data[i].hostname)
    && (!data[i].hrefmatch || location.href.match(data[i].hrefmatch))
    && (!data[i].condition || data[i].condition())
    )
    {

      var params = [];
      var k = 0;
      for (var j = 0; j < data[i].params.length; j++)
		try {
			var curParam = (data[i].params[j] instanceof Array)?(data[i].params[j][k]):(data[i].params[j]);
			
			params[j] = '';
			if (typeof curParam.str != "undefined")
			  params[j] = curParam.str;
			else if (typeof curParam.elem != "undefined")
			{
			  if (curParam.elem instanceof Array)
			  {
				params[j] = $(curParam.elem[0]);
				for(var elemIdx = 1; elemIdx < curParam.elem.length; elemIdx++)
				{
				  var func = curParam.elem[elemIdx].split(',');
				  params[j] = params[j][func[0]](func.length>0?func[1]:null);
				}
				params[j] = params[j].html();
			  }    
			  else
				params[j] = $(curParam.elem).html();
			}
			else if (typeof curParam.elements != "undefined")
			{
			  params[j] = $(curParam.elements[0]).map(function(el){return $(this).html();}).toArray().join(curParam.elements[1]);
			}
			else if (typeof curParam.telem != "undefined")
			{
				params[j] = $(curParam.telem).first().text();
			}
	 
			if (typeof curParam.match != "undefined")
			{
			  if (!(curParam.match instanceof Array))
				params[j] = match(params[j], curParam.match);
			  else for (patIdx = 0; patIdx < curParam.match.length; patIdx++)
			  {
				temp = match(params[j], curParam.match[patIdx]);
				if (temp != '')
				{
				  params[j] = temp;
				  break;
				}
			  }
			}
	 
	 
			if (typeof curParam.remove != "undefined")
			  for (var removeIdx = 0; removeIdx < curParam.remove.length; removeIdx++)
				params[j] =  params[j].replace(curParam.remove[removeIdx],"");
	 
			if (typeof curParam.split != "undefined")
			  params[j] =  params[j].split(curParam.split);
	 
	 
			if (typeof curParam.func != "undefined")
			{
			  if (!(curParam.func instanceof Array))
				curParam.func = [curParam.func];
			  for (var funcIdx = 0; funcIdx < curParam.func.length; funcIdx++)
			  {
				params[j] = curParam.func[funcIdx](params[j]);
			  }
			}
			
			if (typeof curParam.prefix != "undefined")
				params[j] = curParam.prefix + params[j];

			params[j] = jQuery.trim(unescape(params[j].replace(/&nbsp;|\u202B|\u202C/gm," ").replace(/\s+|\|/gm, ' ')));
			if (typeof curParam.defvalue != "undefined" && params[j] == curParam.defvalue)
				params[j] = '';
			
			if (typeof curParam.shouldnt != "undefined" && typeof params[j] == "string" && params[j].match(curParam.shouldnt))
				params[j] = '';
				
			
			if ((params[j] == '') && (data[i].params[j] instanceof Array) && (k < data[i].params[j].length - 1))
			{
				k++;
				j--;
				continue;
			}
				
			k = 0;
		}
			catch(e) {}
				
		
		var minimum = (typeof data[i].minimum != "undefined") ? (data[i].minimum) : (0);
			
		while (params[params.length-1]=="" && params.length > minimum) //remove all last empty params
			params.pop();
		
		prompt("Your template:", '{{' + params.join('|') + '}}');
		isFound = true;
		break;
	}
  }
  
  if (!isFound)  alert("This site\\page isn't supported by the bookmarklet.");
}
(function ()
{
	if (typeof(jQuery)!="undefined")
		window.$ = jQuery;
	var s=document.createElement('script');
	s.setAttribute('src',"http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js");
	s.onload=wikiit;
	document.getElementsByTagName('body')[0].appendChild(s);
})();

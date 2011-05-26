/*Author:[[user:שמוליק]]*/
function wikiit() {

	function dateFormat(dateArr)
	{
		var m = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
		if (dateArr instanceof Array)
		{
			dateArr[1] = m[Number(dateArr[1])-1];
			if (Number(dateArr[2])<=50) dateArr[2]=20+dateArr[2];
			else if (Number(dateArr[2])>=50&&Number(dateArr[2])<100) dateArr[2]=19+dateArr[2];
			dateArr =dateArr[0]+" ב"+dateArr[1]+" "+dateArr[2];
		}
		return jQuery.trim(dateArr);
	}

	var ATags = [/<a .*?>/gi, /<\/a>/gi];

	function match(str, expr) {str = str.match(expr); return str?str[1]:''}
	
	function extractParam(rule) {
	{
		var result = rule.str; //may be null.
		if (rule.elem)
		{
			if (!(rule.elem instanceof Array))
				rule.elem = [rule.elem];
			result = $(rule.elem[0]);
			for(var elemIdx = 1; elemIdx < rule.elem.length; elemIdx++)
			{
				var func = rule.elem[elemIdx].split(',');
				result = result[func[0]](func.length>0?func[1]:null);
			}
			result = result.html();
		} 
		else if (rule.elements)
			result = $(rule.elements[0]).map(function(el){return $(this).html();}).toArray().join(rule.elements[1]);

		if (rule.match)
			result = match(result, rule.match);

		if (rule.remove)
			for (var removeIdx = 0; removeIdx < rule.remove.length; removeIdx++)
				result =  result.replace(rule.remove[removeIdx],"");

		if (rule.split)
			result =  result.split(rule.split);

		if (rule.func)
		{
			if (!(rule.func instanceof Array))
				rule.func = [rule.func];
			for (var funcIdx = 0; funcIdx < rule.func.length; funcIdx++)
				result = rule.func[funcIdx](result);
		}
		return jQuery.trim(result);
	}
	
  var data = 
  [
    {
     hostname: 'www.ynet.co.il',
     params:[
      {str : 'ynet'},
      {elem : 'td:has(h1:first) .text14:first', func: [function(str){return (str.length<100)?str:'';}], remove:ATags },
      {elem : 'h1:first'},
      {str : location.href, match: /L-(.*?),/},
      {elem : 'td:has(h1:first) .text12g:last', match: /^(.*?),/, split:'.', func:dateFormat }
     ]
    },
    {
     hostname: 'news.walla.co.il',
     params:[
      {str : 'וואלה!'},
      {elem : 'div.wp-0-b:first span:first', match: /מאת:(.*),/, remove:ATags},
      {elem : 'h1'},
      {str : location.href, match:/w=\/\d*\/(\d+)/},
      {elem:["h1","parent","children","eq,2"], match:/,(.*),/},
      {str:''},
      {str : location.href, match:/w=\/(\d*)\/\d+/}
     ]
    },
    {
    hostname: /^\w+\.nana10\.co\.il$/i,
     params:[
      {str : 'נענע10'},
      {elem: '.Author:first', remove:ATags},
      {elem: 'ArtTitle'},
      {str : location.href, match:/ArticleID=(\d+)/i},
      {elem: '.ArticleDate:first', match:/^[^]* (.*)$/, split:'/', func:dateFormat},
      {str :''},
      {str : location.href, match:/(\w+)\.nana/i},
     ]
    },
    {
    hostname: "www.haaretz.co.il",
     params:[
      {str : 'הארץ'},
      {elem:'.t12:eq(4) .tUbl2'},
      {elem:'.t18B:first', func:function(str){return str.replace('|',' - ')}},
      {str : location.href, match:/^.*\/(\d+)/},
      {elem: '.t11:eq(3)', match:/^.* (.*?)$/, split:'/' , func:dateFormat}
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
      {elem:'#coteret_Writer, .g_Article_Author, #F_Author' , remove:[/<.*?>/gmi , /&nbsp;/gmi] },
      {elem:'#F_Title, .mainArticletitle' },
      {str : location.href, match: /=(.*?)$/},
      {elem:'#coteret_Modified, #F_Modified_on, .g_Article_DateTime', match:/^(.*),/, split:'/', func:dateFormat}
     ]
    },
    {
    hostname: "www.the7eye.org.il",
     params:[
      {str : 'העין השביעית'},
      {elem: '#ctl00_PlaceHolderMain_ArticleAuthor_m_EditModePanel_Disp span', remove:["מאת:"].concat(ATags) ,},
      {elem: "a[name='1']"},
      {str : location.href, match: /^.*\/(.*)\./},
      {elem: "#ctl00_PlaceHolderMain_PublishDate_m_EditModePanel_Disp span", remove:["תאריך פרסום: "], func:dateFormat, split:'/'},
      {str : location.href, match:/il\/(.*)\/P/}
     ]
    },
    {
    hostname: "www.xnet.co.il",
     params:[
      {str : 'xnet'},
      {elem: '.author_name_link:visible'},
      {elem: "h1"}, //can use ".colorTitle:first>.right" for descrition or join them to one long title
      {str : location.href, match: /L-(.*?),/},
      {elem: ".author.clearFix cite", match: /(\d+\.\d+\.\d+)/ ,func:dateFormat, split:'.'},
      {str :''},
      {str : location.href, match: /articles\/(\d+),/}
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
      {elem: "#ctl00_ContentPlaceHolder_Content_Label_DateBroadcast" , remove:"תאריך הקלטה:" ,split:'/', func:dateFormat}
     ]
    },
    {
    hostname: "www.mouse.co.il", //only "CM.articles" have a template!
     params:[
      {str : 'עכבר העיר'},
      {elem: "p.katava-info:first", match: /מאת: (.*)$/},
      {elem: "h1:not(:empty):[class!=ttl-gallery]:first"},
      {str : location.href, match: /item,(.*?),\.aspx$/},
      {elem: "p.katava-info:first", match: /^\W+ (\d+ \W+ \d+)/},
     ]
    },
    {
    hostname: "www.nrg.co.il", condition: function(){return ($("h1:first").length > 0)},
     params:[
      {str : 'nrg'},
      {elem: "#articleCBar span:first", match: /<!-- ARTICLE_WRITER_START --> (.*?)<!-- ARTICLE_WRITER_END -->/ , remove:ATags},
      {elem: "h1:first"},
      {str : location.href, match: /(\d+\/\d+)\.html/},
      {elem: "#articleCBar span:first", match: /<!-- ARTICLE_DATE_START -->(.*?) .*<!-- ARTICLE_DATE_END -->/, split:'/',  func:dateFormat},
      {str : ''},
      {str : location.href, match: /online\/(.*?)\/ART/},
      {str : location.href, match: /ART(\d+)/}
     ]
    },
    {
    hostname: "www.nrg.co.il", condition: function(){return ($("h1:first").length == 0)},
     params:[
      {str : 'nrg'},
      {elem: ".newsVitzCredit", match: /^(.*?)<br>/ , remove:["NRG מעריב"]},
      {elem: "#titleS1"},
      {str : location.href, match: /(\d+\/\d+)\.html/},
      {elem: ".newsVitzCredit", match: /<br>(.*?) /, split:'/',  func:dateFormat},
      {str : ''},
      {str : location.href, match: /online\/(.*?)\/ART/},
      {str : location.href, match: /ART(\d+)/}
     ]
    },
  ];

	for (var i in data)
	{
		if (location.hostname.match(data[i].hostname)
		&& (!data[i].hrefmatch || location.href.match(data[i].hrefmatch))
		&& (!data[i].condition || data[i].condition())
		)
		{
			var params = [];
			for (var j in data[i].params)
				params[j] = extractParma(data[i].params[j]);
			prompt("Your template:", '{{' + params.join('|') + '}}');
			break;
		}
	}
}

(function ()
{
	if (typeof(jQuery) != "undefined") {
		window.$ = jQuery; 
		wikiit();
		return;
	}
	var s = document.createElement('script');
	s.setAttribute('src',"http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js");
	s.onload = wikiit;
	document.getElementsByTagName('body')[0].appendChild(s);
})();
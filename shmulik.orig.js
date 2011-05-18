/*Author:[[user:שמוליק]]*/
function wikiit() {
  var m = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
  var title,date,url=location.href,template,author,misc="";
  switch (location.hostname)
  {
    case "www.ynet.co.il":
      var h1 = $("h1").first();
      title = h1.html();
      author = h1.parent().find(".text14").html();
      if (author.length>=100)author = "";
      date = h1.parent().find(".text12g").last().html();
      date = date.substr(0,date.indexOf(',')).split('.');
      url = url.substr(url.indexOf('L-')+2);
      url = url.substr(0,url.indexOf(','));
      template = "ynet";
      break;
    case "news.walla.co.il":
      var h1 = $("h1").first();
      title = h1.html();
      author = h1.parent().find("span").first().html();
      author = author.substring("מאת: ".length,author.lastIndexOf(","));
      date = h1.parent().children().eq(2).html();
      date = date.substring(date.indexOf(",")+1,date.lastIndexOf(","));
      misc = url.substring(0,url.lastIndexOf("/"));
      misc = "|"+misc.substring(misc.lastIndexOf("/")+1);
      url = url.substring(url.lastIndexOf("/")+1);
      template = "וואלה!";
      break;
    case "www.nrg.co.il":
      title = $("h1").first().html();
      if (title!=null)
      {
        titile = title.replace(/\n/g,"");
        var acb = $("#articleCBar span:first").html();
        author = acb.substr("<!-- ARTICLE_WRITER_START --> ".length);
        author = author.substr(0,author.indexOf("<!-- ARTICLE_WRITER_END -->"));
        date = acb.substr(acb.indexOf("<!-- ARTICLE_DATE_START -->")+"<!-- ARTICLE_DATE_START -->".length);
        date = date.substr(0,date.indexOf("<!-- ARTICLE_DATE_END -->"));
        date = date.substr(0,date.indexOf(' ')).split('/');
      }
      else
      {
        title = $("#titleS1").html();
        var nvc = $(".newsVitzCredit").html();
        author = nvc.substring(0,nvc.indexOf("<br>"));
        date = nvc.substring(nvc.indexOf("<br>")+4);
        date = date.substring(0, date.indexOf(" ")).split("/");
      }
      var serCode = url.substring(url.indexOf('online/')+7,url.indexOf('/ART'));
      var artCode = url.substr(url.lastIndexOf('ART')+3,1);
      url = url.substring(url.substr(0,url.lastIndexOf("/")).lastIndexOf("/")+1,url.lastIndexOf("."));
      misc = "|"+serCode+"|"+artCode;
      template = "nrg";
      break;
    case "www.nana10.co.il":case "bidur.nana10.co.il":case"net.nana10.co.il":case "mymoney.nana10.co.il":case "gamer.nana10.co.il":case "news.nana10.co.il":
      title = $("#ArtTitle").html().replace(/&nbsp;/g,"");
      author = $(".Author:first").html();
      date = $(".ArticleDate:first").html();
      date = date.substring(date.lastIndexOf(" ")).split("/");
      template = "נענע10";
      misc = "|"+url.substring(url.indexOf("//")+2,url.indexOf("."));
      url = url.substring(url.lastIndexOf("=")+1);
      break;
    case "www.haaretz.co.il":
      date=$(".t11:eq(3)").html();
      title=$(".t18b:first").html();
      author=$(".t12:eq(4)").html();
      date = date.split(" ");
      date = date.length>4?date[5].split("/"):"";
      author = author.substr(author.indexOf(" ")+1);
      url = url.substr(url.lastIndexOf('/')+1);
      url = url.substr(0,url.lastIndexOf('.'));
      if (url=="ShArt")
        url = location.href.substring(location.href.lastIndexOf("=")+1);
      else if (url=="ShArtPE")
        {url=location.search;url=url.substring(url.indexOf("itemNo=")+"itemNo=".length);if (url.indexOf("&")>0)url=url.substr(0,url.indexOf("&"));}
      template = "הארץ";
      break;
    case "www.inn.co.il":
      title = $("h1:first").html();
      author = $(".Author:first").html();
      author = author.substring(author.indexOf("</div>")+6);
      date = $(".Date:first").html();
      if (url.indexOf("Besheva")>=0)
      {
        date = date.substring(0,date.indexOf(",")).split("/");
        template = "בשבע";
      }
      else
      {
        date = date.substring(date.indexOf(":")+1,date.lastIndexOf(",")).split("/");
        template = "ערוץ7";
      }
      url = url.substring(url.lastIndexOf("/")+1);
      break;
    case "www.globes.co.il":
      title = document.getElementById("F_Title").innerHTML;
      date = document.getElementById("F_Modified_on").innerHTML;
      date = date.substring(0,date.indexOf(",")).split("/");
      author = document.getElementById("F_Author").innerHTML.replace(/<.*?>/gmi,"");
      url = url.substr(url.lastIndexOf('=')+1);
      template = "גלובס";
      break;
    case "www.mouse.co.il":
      title = $("h1:not(:empty):[class!=ttl-gallery]:first").html();
      var ki = $("p.katava-info:first").html();
      date = ki.substring(0,ki.indexOf("מאת")).split(" ");
      date = date[2]+" "+date[3]+" "+date[4];
      author = ki.substring(ki.indexOf("מאת")+5);
      if(url.indexOf("CM.articles")==-1)alert("אין תבנית לכתבות מסוג זה, ראה דף הבוקמרקלט");
      url = url.substring(url.indexOf("item,")+5,url.lastIndexOf(",.aspx"));
      template = "עכבר העיר";
      break;
    case "actv.haifa.ac.il":
      title=$("#ctl00_ContentPlaceHolder_Content_Label_Title").html();
      date = $("#ctl00_ContentPlaceHolder_Content_Label_DateBroadcast").html().replace("תאריך הקלטה:","").split("/");
      author = $("#ctl00_ContentPlaceHolder_Content_Repeater_Humans_ctl00_HyperLink_Human_Name").html();
      if ($("#ctl00_ContentPlaceHolder_Content_Repeater_Humans_ctl01_HyperLink_Human_Name").length>0)
        author += " ו" + $("#ctl00_ContentPlaceHolder_Content_Repeater_Humans_ctl01_HyperLink_Human_Name").html();
      url = url.substring(url.lastIndexOf("=")+1);
      template = "הערוץ האקדמי";
      break;
    case "www.the7eye.org.il":
      title=$("a[name='1']").html();
      date = $("#ctl00_PlaceHolderMain_PublishDate_m_EditModePanel_Disp span").html().replace("תאריך פרסום: ","").split("/");
      author = $("#ctl00_PlaceHolderMain_ArticleAuthor_m_EditModePanel_Disp span").html().replace("מאת:","");
      misc=url;
      misc = url.substring(26);
      misc = misc.substring(0,misc.indexOf("/"));
      url = url.substring(url.lastIndexOf("/")+1,url.lastIndexOf("."));
      template = "העין השביעית";
  }
  title = title.replace('|',' - ');
  if (date instanceof Array)
  {
    date[1] = m[Number(date[1])-1];
    if (Number(date[2])<=15) date[2]=20+date[2];
    else if (Number(date[2])>=50&&Number(date[2])<1999) date[2]=19+date[2];
    date =date[0]+" ב"+date[1]+" "+date[2];
  }
  date = jQuery.trim(date);
  author = author.replace(/<a .*?>/g,'');
  author = jQuery.trim(author.replace(/<\/a>/g,''));
  prompt("Your requested template", ("{{"+template+"|"+author+"|"+title+"|"+url+"|"+date+"|"+misc+"}}").replace(/\s+/g, ' '));
}
(function ()
{
  if (typeof(jQuery)!="undefined")
  {window.$ = jQuery;wikiit();return;}
  var s=document.createElement('script');
  s.setAttribute('src',"http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js");
  s.onload=wikiit;
  document.getElementsByTagName('body')[0].appendChild(s);
})();
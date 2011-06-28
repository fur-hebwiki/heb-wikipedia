/* הסקריפט מוסיף לשוניות "מחיקה", "הגנה" ו"חסימה" על מנת שאפשר יהיה לבקש מחיקת דפים, הגנת דפים וחסימת משתמשים באמצעות דף בקשות ממפעילים. */
function wbm_save_topage(title, summary, content, section, next) {

	function doneSave(data) {
		if (data && data.error) 
			alert('error saving: ' + data.error['info']);
		else if (data && data.edit && data.edit.result == 'Success' && typeof next == 'function')
			next();
	}
	
	function tokenReceived(token) {
		var param = {action: 'edit', title: title, summary: summary, token: token, section: section || '0', appendtext: content, format: 'json'};
		$.post(wgScriptPath + '/api.php?', param, doneSave);
	}

	function doneGetToken(data) {
		for (var page in data.query.pages) {
			tokenReceived(data.query.pages[page].edittoken);
			break;
		}
	}

	riwt_get_json({action: 'query', prop: 'info', intoken: 'edit', titles: title}, doneGetToken);
}

function wbm_add_menus() {
	function add_one(caption, tooltip, section, message, summary) {
		var a = $('<a>', {href: '#', text: title, title: tooltip});
		a.click(function() {
			var reason = prompt("הסיבה לבקשה");
			if ($.trim(reason) == '')
				return;
			message += ' סיבה: ' + reason + ' ~~' + '~~';
			wbm_save_topage('משתמש:קיפודנחש/ארגח 5', summary, message, section, function() { alert('בקשתך נשמרה ב-וק:במ')});
		}
		$('#ca-history').before($('<li>').append($('<span>').append(a)));
	}
	if ($('#t-contributions').length) {
		var badUser = wgTitle.split('/')[0];
		add_one('חסימה', 'בקשה לחסום משתמש ' + wgTitle, 2, "\n* {" + "{לחסום|" + badUser + "}}", );
	}
}


function addExtraJS_Tabs()
{
    function addTab ( modelTab, type, text, title, target, section )
    {
        var newtab = modelTab.cloneNode ( true );
        newtab.id = "ca-js-" + type;
        newtab.className = "";

        var link = newtab.firstChild;
        while (link.nodeName != "A") {
                 link =link.firstChild; 
                if(link==null) return; // should never happen
        }

        link.href = "#";
        link.title = title;
        link.onclick = function() {
            var reason = prompt ( "סיבה לבקשת ה" + text );
            if ( reason )
                window.location.href = "http://he.wikipedia.org/w/index.php?title=" + encodeURIComponent("ויקיפדיה:בקשות_ממפעילים") +
                                       "&action=edit&section=" + section + "&ExtraJSTabReq=" + type + "&target=" + encodeURIComponent(target) +
                                       "&reason=" + encodeURIComponent(reason);
        }

        if ( link.firstChild.nodeName == "SPAN" ) link.firstChild.firstChild.nodeValue = text;
         else link.firstChild.nodeValue = text;

        modelTab.parentNode.insertBefore ( newtab, skin == "vector" ? modelTab : modelTab.nextSibling );
        return newtab;
    }

 try {
    var x = null;
    
    if ( document.getElementById("ca-history") )
    {
        x = addTab ( document.getElementById("ca-history"), "delete", "מחיקה", "מחיקת דף זה",
                     ( wgNamespaceNumber == 14 || wgNamespaceNumber == 6 ? ":" : "" ) + wgPageName, 1 );

        x = addTab ( x, "protect", "הגנה", "הגנה על דף זה",
                     ( wgNamespaceNumber == 14 || wgNamespaceNumber == 6 ? ":" : "" ) + wgPageName, 3 );
    }

    if ( document.getElementById("t-contributions") )
        addTab ( x || document.getElementById("ca-addsection") || document.getElementById("ca-edit") || document.getElementById("ca-nstab-user"),
                 "block", "חסימה", "חסימת משתמש זה", wgTitle, 2 );
  }
 catch (e)
  {
    return;
  }
}

if ( /&ExtraJSTabReq=/.test(location.href) ) addOnloadHook ( function () {
 try {
        if ( getParamValue("ExtraJSTabReq") == "block" )
        {
            document.getElementById("wpSummary").value += " [" + "[משתמש:" + getParamValue("target") + "]]" +
                                                          " ([" + "[שיחת משתמש:" + getParamValue("target") + "]])";
            document.getElementById("wpTextbox1").value += "\n* {" + "{לחסום|" + getParamValue("target") + "}} - " + getParamValue("reason") + " ~~" + "~~";
        }
         else
        {
            document.getElementById("wpSummary").value += " [" + "[" + getParamValue("target") + "]]";
            document.getElementById("wpTextbox1").value += "\n* [" + "[" + getParamValue("target") + "]] - " + getParamValue("reason") + " ~~" + "~~";
        }
        document.getElementById("wpSave").click();
  }
 catch (e)
  {
    return;
  }
});

if ( wgTitle != "בקשות ממפעילים" && wgNamespaceNumber >= 0 ) addOnloadHook ( addExtraJS_Tabs );
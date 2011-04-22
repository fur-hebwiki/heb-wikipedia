/* known problems:

* highly unlikely: using a global search for the site name regexp will cause misrecognitions if:
  - the sitename appears twice in the line -and-
  - there is one or more words/dates between the sitenames that can be both a pre-site and a post-site word

   for example:              wordA sitename  wordB  sitename wordC  [...
   should be recognized as:  wordA sitename <wordB  sitename wordC> [...
   but is recognized as:     wordA sitename  wordB <sitename wordC> [...
   because <wordA sitename wordB> is also a match
*/
//---
/* handling of capitalization and encoding of [http://url xxx]:

1. * decode http URLs:                            [http://site/ab%2Fxy%28%D7%90%D7%95%29 aa%28aa] --> [http://site/ab/xy(או) aa%28aa]
   * decapitalized the site part in http URLs:    [http://Site.NAME.com/PATH/Dir1 TEXT]           --> [http://site.name.com/PATH/Dir1 TEXT]
2. case sensitive: search for http URLs that need to be replaced with templates
3. ignore case: search for site name and date
*/

var extLinkAutoPlaceButtonObject = null;
var extLinkAutoPlaceTextBox = null;
var extLinkAutoPlaceUserSummary = { value : "" };     // summary message for the user

function externalLinkAutoPlaceButtonFunc ( event )
{
 try {
    if ( !document.getElementById("wpTextbox1") || !document.getElementById("wpSummary") ) return;

    if ( event )
    {
        extLinkAutoPlaceTextBox = document.getElementById("wpTextbox1");
        extLinkAutoPlaceUserSummary = document.getElementById("wpSummary");
        externalLinkAutoPlace ( extLinkAutoPlaceTextBox.value );   // get the text from the textbox and send it to the externalLinkAutoPlace function
        extLinkAutoPlaceTextBox = null;
        extLinkAutoPlaceUserSummary = { value : "" };
        return;
    }

    extLinkAutoPlaceButtonObject = addSystemButton ( "EXTLINK", externalLinkAutoPlaceButtonFunc, "externalLinkAutoPlaceButton", "EXTLINK", "" );
  }
 catch ( e )
  {
    return;      // lets just ignore what's happened
  }
}

function externalLinkAutoPlace ( text )
{
    var originalUserSummary = "";
    var counters = [], linksLeft = [];
    var totalReplaced = 0;
    var decodedHttpToEncodedArr = [];

    function reportUserMessage ( action, tname, info )                        // deliver message to the user in the summary field
    {
//        if ( action == "DEBUG" ) return extLinkAutoPlaceUserSummary.value += tname;
        if ( action == "INTERNALERROR" ) throw ( tname );
        if ( action == "CRASH" )
        {
            extLinkAutoPlaceUserSummary.value += tname;                       // output the crash message
                                                                              // mark button in color - "CRASH!"
            if ( extLinkAutoPlaceButtonObject ) extLinkAutoPlaceButtonObject.style.backgroundColor = "red";
            return "**** " + extLinkAutoPlaceUserSummary.value + " ****";
        }

        if ( action == "INIT" )
        {
            if ( extLinkAutoPlaceButtonObject )
            {
                extLinkAutoPlaceButtonObject.disabled = true;
                extLinkAutoPlaceButtonObject.style.backgroundColor = "blue";  // mark button in color - "I'm working!"
            }
            originalUserSummary = extLinkAutoPlaceUserSummary.value;          // save original summary
            extLinkAutoPlaceUserSummary.value += "סקריפט רץ ";
            return extLinkAutoPlaceUserSummary.value;
        }

        if ( action == "COUNT" )
        {
            counters[tname] = ( counters[tname] || 0 ) + 1;
            totalReplaced++;
            if ( totalReplaced % 20 == 0 ) extLinkAutoPlaceUserSummary.value += ".";
            return extLinkAutoPlaceUserSummary.value;
        }

        if ( action == "LEFT" )
        {
            linksLeft[tname] = info;
            return extLinkAutoPlaceUserSummary.value;
        }

    //---                                                  output summary
        var reporttext = "";
        if ( action == "ERROR" ) reporttext += tname;
         else
        {
            var s = "";
            for ( var n in counters ) s += "{" + "{" + n + "}}\u200Fx\u200F" + counters[n] + ", ";
            if ( s ) reporttext += "מכניס " + ( totalReplaced == 1 ? "תבנית" : "תבניות" ) + ": " + s.substring ( 0, s.length - 2 ) + " [JS]";

            s = "";
            for ( var n in linksLeft ) s += "\u200F" + n + ":\u200F " + linksLeft[n] + ", ";
            if ( s ) reporttext += " **** נשארו קישורים: " + s.substring ( 0, s.length - 2 ) + " ****";
        }

        extLinkAutoPlaceUserSummary.value = originalUserSummary + ( reporttext ? ( /[^/ ] *$/.test(originalUserSummary) ? " +" : "" ) + " " + reporttext : "" );

        if ( extLinkAutoPlaceButtonObject )
        {
            extLinkAutoPlaceButtonObject.style.backgroundColor = "#FFBBBB";    // color the button - "done working!"
            extLinkAutoPlaceButtonObject.disabled = false;
        }

        return extLinkAutoPlaceUserSummary.value;
    }

    function multiSurround ( surroundRxStrArr, rxStr )
    {
        var out = [];
        for ( var i in surroundRxStrArr )
            out.push ( surroundRxStrArr[i].blank ? rxStr :
                       ( surroundRxStrArr[i].prepositionAllowed ? boundaryWPreposition + "?" : wordBoundary + "?" ) +
                       surroundRxStrArr[i].pre +
                       ( surroundRxStrArr[i].spaceAllowed ? "" : spaceNotAllowed ) +
                       rxStr +
                       ( surroundRxStrArr[i].spaceAllowed ? wordBoundary + "?" : "\xFF*" ) +
                       surroundRxStrArr[i].post );
        return "(" + out.join("|") + ")";
    }

    function word ( word )                            // [boundary]word
    {
        return "(" + wordBoundary + word + ")";
    }

    function versatileWord ( word )                   // [boundary](from)word / ([boundary](from))'''(from)word'''
    {
        return multiSurround ( [ noSurround, boldSurround ], boundaryWPreposition + word );
    }

    function versatileHttp ( name, httplink )         // ([boundary](from))[http://httplink name] / ([boundary](from))'''(from)[http://httplink name]'''
    {
        return multiSurround ( [ noSurround, boldSurround ],
                               boundaryWPreposition + "?" + "\\[http:\\/\\/" + httplink +                // [http://httplink
                               "((?= )" + versatileWord ( name ) + "+" + wordBoundary + "?)? *]" );      //  ( (from)name...( ))]
    }

    function siteNameRxStr ( name, httplink )
    {
        var stage1 = "(" + versatileWord ( name ) + "|" + versatileHttp ( name, httplink ) + ")+";      // (from)name / (from)[http://httplink name]
        var stage2 = multiSurround ( [ noSurround, anyGereshSurround, parenthesesSurround ], stage1 );  // stage1 / "stage1" / (stage1)
        var stage3 = multiSurround ( [ noSurround, boldSurround ], stage2 ) + "+";                      // stage2 / '''stage2'''
        return multiSurround ( [ noSurround, parenthesesSurround ], stage3 );                           // stage3 / (stage3)
    }

    function getTwinSegmentRx ( rxStr, rxType )       // segment[endBoundary] / (segment)[endBoundary]
    {
        var segmentRxStr = linkEdge + "?" + multiSurround ( [ noSurround, parenthesesSurround ], rxStr ) + segmentEndBoundary;

        return { g : new RegExp ( segmentRxStr, "gi" ),
                 r : new RegExp ( segmentRxStr,  "i" ),
                 rxType : rxType                        };     // b = beginning of segment, e = end of segment
    }

    function noInvisibles ( str )
    {
        return str.replace ( new RegExp(invisible,"g"), "" );
    }

    function getNumberOfMatches ( str, rx )
    {
        rx.exec("");               // dummy action to flush the regexp memory.
                                   // this fixes chrome's weird behaviour by which every time "getNumberOfMatches('x',/regexp/)"
                                   // is executed the regexp is the same object from the previous time.
                                   // (firefox creates a new regexp object each time)
        return rx.test(str) ? str.match(rx).length : 0;
    }

    function splitOnFirstMatch ( str, rx )
    {
        if ( !rx.test(str) ) return null;

        var m = str.match ( rx )[0];
        return { pre  : str.substring ( 0, str.indexOf(m) ),
                 body : m,
                 post : str.substring ( str.indexOf(m) + m.length ) };
    }

    function splitOnLastMatch ( str, rx )
    {
        if ( !rx.test(str) ) return null;

        var lastmatch = splitOnFirstMatch ( str, rx );
        for ( var nextmatch = splitOnFirstMatch ( lastmatch.post, rx ) ; nextmatch && nextmatch.body ; )
        {
            lastmatch = nextmatch;
            nextmatch = splitOnFirstMatch ( lastmatch.post, rx );
        }

        return { pre  : str.substring ( 0, str.lastIndexOf(lastmatch.body) ),
                 body : lastmatch.body,
                 post : str.substring ( str.lastIndexOf(lastmatch.body) + lastmatch.body.length ) };
    }

    function splitOnSiteName ( before, after, rxArr, segmentType )
    {
        var str = "\xFF" + before + "\xFF\xFF\xFF" + after + "\xFF";                            // insert special marker and fake spaces
        var matches = null;

        for ( var r in rxArr )
            if ( rxArr[r].rxType.test ( segmentType ) )                                         // if this RX is relevant for this segment type:
                if ( matches = str.match ( rxArr[r].g ) )                                       // find matches with global regexp
                    for ( var i in matches )
                        if ( /\xFF\xFF\xFF/.test ( matches[i] ) )                               // check for the special marker
                            return { pre  : str.substring ( 0, str.indexOf(matches[i]) ).replace ( /^\xFF/, "" ),
                                     body : matches[i],
                                     post : str.substring ( str.indexOf(matches[i]) + matches[i].length ).replace ( /\xFF$/, "" ),
                                     rx   : rxArr[r].r };                                       // return non-global regexp for later use

        return null;
    }

    function checkHebRefStatus ( status, str )
    {
        var splitd = splitOnFirstMatch ( str, /^(.|\n)*?(\{\{|}})/ );
        while ( status && splitd )
        {
            if ( splitd.body.indexOf("}}") != -1 ) status--;
                                              else status++;
            if ( status ) splitd = splitOnFirstMatch ( splitd.post, /^(.|\n)*?(\{\{|}})/ );
        }

        return { status : status,
                 post   : splitd ? splitd.post : null };
    }

    function decodeHttpLinkUrl ( line )
    {
        function processHttpLink ( httplink )
        {
            function decodeUrl ( url )                                             // remove invisibles and decode the URL part in httplink
            {
                url = noInvisibles ( url ).substring ( 1 );                        // [{{d}}http://{{d}}url --> http://url

                try { url = decodeURIComponent ( url ); }                          // try normal decoding
                catch ( e )                         // url may include encoded unicodes ("%u05e8%u05d5%u05de%u05df") - let's try to unescape
                    {
                        try { url = decodeURIComponent ( unescape ( url ) ); }
                        catch ( e )                                                // ok, I give up
                            { reportUserMessage ( "INTERNALERROR", "decodeHttpLinkUrl: unable to decode " + url + "] ERROR: " + e.message ); }
                    }

                return "[" + url.replace ( / /g, "%20" ).replace ( /\[/g, "%5B" ).replace ( /]/g, "%5D" );
            }

            var decoded = httplink.replace ( /\[http:\/\/[^ \[\]\n]+/, decodeUrl )
                                  .replace ( /\[http:\/\/[^ \[\]\n\/]+/, function(m) { return m.toLowerCase(); } );
                                             // 2 different encoded http addresses having the same decoded http address will cause a conflict
                                             // that's why all http addresses are stored in the array, even if no decoding is needed
            if ( decodedHttpToEncodedArr[decoded] && decodedHttpToEncodedArr[decoded] != httplink )
                reportUserMessage ( "INTERNALERROR", "decodeHttpLinkUrl: found conflicting http links in: " + line );

            decodedHttpToEncodedArr[decoded] = httplink;
            return decoded;
        }

        decodedHttpToEncodedArr = [];

        return line.replace ( new RegExp ( "\\[" + invisible + "*http:\\/\\/([^\\[\\]\n]|" + invisible + ")*]", "g" ), processHttpLink );
    }

    function restoreHttpLinkUrl ( line )
    {
        return line.replace ( /\[http:\/\/[^\[\]\n]*]/g, function (m) { return decodedHttpToEncodedArr[m]; } );
    }

    function cleanSequence ( str )                  // prepare the string to be searched by simplified regular expressions
    {
        str = noInvisibles ( str )                                                          // remove invisibles
                  .replace ( /\t/g, " " )                                                   // replace tabs with spaces
                  .replace ( /([\"()>.!?]|\'{1,3}|\{\{|}})(?![^\[\]]*]])/g, "$1\xFF" )      // insert a fake space after characters that can be
                                                                                            // followed by a word, but not inside [[brackets]]
                  .replace ( /\[\[ *([^\[\]]+?) *([(#|][^\[\]]*)?]]/g, "\xFF$1\xFF" );      // [[aaa (bbb)#ccc|ddd]] --> [fake space]aaa[fake space]
        return str.replace ( /\xFF+/g, "\xFF" )                                             // replace subsequent fake spaces with one fake space
                  .replace ( /\[http:\/\/[^ \[\]\n]+(?=[^\[\]\n]*])/g,                      // remove fake spaces in http URLs
                             function(m) { return m.replace(/\xFF+/g,""); } );
    }

    function restoreSequenceFromLeft ( newstr, oldstr )
    {
        var irx = new RegExp ( "^" + invisible + "+" );
        var out = "";
        var inBracket = false;
        newstr = newstr.replace ( /\xFF+/g, "" );                                           // remove fake spaces

        for ( var n = 0, tmp = null ; n < newstr.length || inBracket ; )
            if ( n < newstr.length && ( oldstr[0] == newstr[n] && ( !inBracket || newstr[n] != " " || !/^ *([(#|][^\[\]]*)?]]/.test(oldstr) ) ||
                                        oldstr[0] == "\t" && newstr[n] == " " ) )           // copy the original sequence, if it matchs the new one
            {
                out += oldstr[0];
                oldstr = oldstr.substring ( 1 );
                n++;
            }
             else                                                                           // restore invisibles and brackets
            {
                if ( !inBracket && ( tmp = splitOnFirstMatch ( oldstr, /^\[\[ */ )               ) ||
                      inBracket && ( tmp = splitOnFirstMatch ( oldstr, /^ *([(#|][^\[\]]*)?]]/ ) )    ) inBracket = !inBracket;
                 else if ( !( tmp = splitOnFirstMatch ( oldstr, irx ) ) )
                          reportUserMessage ( "INTERNALERROR", "restoreSequenceFromLeft: '" + newstr + "' / '" + out + "' + '" + oldstr + "'" );
                out += tmp.body;
                oldstr = tmp.post;
            }

        return out;
    }

    function restoreSequenceFromRight ( newstr, oldstr )
    {
        var irx = new RegExp ( invisible + "+$" );
        var out = "";
        var inBracket = false;
        newstr = newstr.replace ( /\xFF+/g, "" );                                           // remove fake spaces

        for ( var n = newstr.length - 1, tmp = null ; n >= 0 || inBracket ; )
            if ( n >= 0 && ( oldstr[oldstr.length-1] == newstr[n] ||
                             oldstr[oldstr.length-1] == "\t" && newstr[n] == " " ) )        // copy the original sequence, if it matchs the new one
            {
                out = oldstr[oldstr.length-1] + out;
                oldstr = oldstr.substring ( 0, oldstr.length - 1 );
                n--;
            }
             else                                                                           // restore invisibles and brackets
            {
                if (  inBracket && ( tmp = splitOnLastMatch ( oldstr, /\[\[ *$/ )               ) ||
                     !inBracket && ( tmp = splitOnLastMatch ( oldstr, / *([(#|][^\[\]]*)?]]$/ ) )    ) inBracket = !inBracket;
                    else if ( !( tmp = splitOnLastMatch ( oldstr, irx ) ) )
                        reportUserMessage ( "INTERNALERROR", "restoreSequenceFromRight: '" + newstr + "' / '" + oldstr + "' + '" + out + "'" );
                out = tmp.body + out;
                oldstr = tmp.pre;
            }

        return out;
    }

    function cleanDate ( str )
    {
        str = str.replace ( /^.*\((.+)\)$/, "$1" )                                                        // remove surrounding parentheses
                                                                                                  // remove beginning preposition and boundary
                 .replace ( new RegExp ( "^" + word ( datePrefixRxStr ) + "*" + dateWPreposition1 + "(?=(\\d{1,2}|" + monthsNames + "))", "i" ), "" )
                 .replace ( new RegExp ( segmentEndBoundary + "$" ), "i" )                                // remove end boundary
                                                                               // remove preposition and boundary of the month number (if it exists)
                 .replace ( new RegExp ( dateWPreposition2 + "(?=\\d+\\D+\\d+$)", "i" ), function(m) { return m[0]; } );

        str = str.replace ( new RegExp ( dateWPreposition2 + "(?=" + monthsNames + ")", "i" ),            // remove preposition and boundary
                            function(m) { return m[0] + ( /^\d(?!.*[a-z])/i.test(str) ? "ב" : "" ); } )   // of the month text (if it exists)
                 .replace ( new RegExp ( yearWPreposition + "(?=\\d+$)", "i" ),                           // remove preposition and boundary
                            function(m) { return /^\d/.test(str) ? str.match(/\d+(.)/)[1] : m[0]; } )     // of the year
                 .replace ( /\xFF+/g, " " );                                                              // replace fake spaces with real spaces
                                                              // add directionality code if the date includes a month name in english
        return ( /[a-z]/i.test(str) ? "{" + "{D}}" : "" ) + str;
    }

    function getLonelyAuthor ( str )
    {                                                                            // get "hebname," that doesn't begin with "see ", and
        var m = str.match ( /^((?!(ראו|ראיון|כתבה|דיווח)[ ,–־-])(?=[א-ת].+[א-ת.\'][ ,]*$)([ א-ת–־-]|[א-ת]\'?(\. )?)+) *, *$/ );
        return m && getNumberOfMatches(m[1],/ +/g) < 5 ? m[1] : "";              // is 5 words long at most
    }

    function getFirstBoundary ( str, maxlength )
    {
        var d = splitOnFirstMatch ( str, new RegExp ( "^" + getLeftSideBoundary(maxlength) ) );
        return d ? d.body : "";
    }

    function getLastBoundary ( str, maxlength )
    {
        var d = splitOnLastMatch ( str, new RegExp ( getRightSideBoundary(maxlength) + "$" ) );
        return d ? d.body : "";
    }

    function oneSpaceOnLeft ( str )
    {
        return str ? str.replace ( new RegExp("^( |" + invisible + ")*"),
            new RegExp("^( |" + invisible + ")*[,.]").test(str) || new RegExp("^" + invisible + "*[;:|(){}\\[\\]!?]").test(str) ? "" : " " ) : "";
    }

    function oneSpaceOnRight ( str )
    {
        return str ? str.replace ( new RegExp("( |" + invisible + ")*$"),
                                   new RegExp("[\"\'|\\]}]" + invisible + "*$").test(str) ? "" : " " ) : "";
    }

    function processTextPart ( line, template, standalone )
    {
        var linkBody = line.match ( template.linkRx )[0];
        var linkParts = template.linkRx.exec ( linkBody );

        var pre = cleanSequence ( line.substring ( 0, line.indexOf(linkBody) ) );
        var dirtyLinkText = linkParts[linkParts.length - 1];
        var linkText = cleanSequence ( dirtyLinkText );
        var post = cleanSequence ( line.substring ( line.indexOf(linkBody) + linkBody.length ) );
        var author = "";
        var extratext = "";
        var removedText = [];

                                                                              // --- remove external geresh/gershayim ---
        if ( /\'\'\'\xFF*$/.test(pre) && /^\xFF*\'\'\'/.test(post) )
        {
            pre  = pre .replace ( /\'\'\'\xFF*$/, "\xFF" );
            post = post.replace ( /^\xFF*\'\'\'/, "\xFF" );
        }
         else if ( /\'\'\xFF*$/.test(pre) && /^\xFF*\'\'/.test(post) )
        {
            pre  = pre .replace ( /\'\'\xFF*$/, "\xFF" );
            post = post.replace ( /^\xFF*\'\'/, "\xFF" );
        }
         else if ( /\"\xFF*$/.test(pre) && /^\xFF*\"/.test(post) || /\'\xFF*$/.test(pre) && /^\xFF*\'/.test(post) )
        {
            pre  = pre .replace ( /[\"\']\xFF*$/, "\xFF" );
            post = post.replace ( /^\xFF*[\"\']/, "\xFF" );
        }

                                                                              // --- remove site name from left and right ---
        var splitLeft = splitOnSiteName ( pre, linkText, template.nameRx, "b" );            // remove site name from the line's left side
        if ( splitLeft && splitLeft.post )
        {
            if ( pre != splitLeft.pre ) pre = splitLeft.pre ? splitLeft.pre + getFirstBoundary ( splitLeft.body, pre.length - splitLeft.pre.length  ) : "";
            linkText = splitLeft.post;
            dirtyLinkText = restoreSequenceFromRight ( linkText, dirtyLinkText );
            removedText.push ( splitLeft );
        }

        var splitRight = splitOnSiteName ( linkText, post, template.nameRx, "e" );          // remove site name from the line's right side
        if ( splitRight && splitRight.pre )
        {
            linkText = splitRight.pre;
            dirtyLinkText = restoreSequenceFromLeft ( linkText, dirtyLinkText );
            if ( post != splitRight.post ) post = splitRight.post ? getLastBoundary ( splitRight.body, post.length - splitRight.post.length ) + splitRight.post : "";
            removedText.push ( splitRight );
        }

        dirtyLinkText = dirtyLinkText.replace ( /^(\"|\'{1,3}) *((.|\n)+?) *\1$/, "$2" )    // "linktext" --> linktext / '''linktext''' --> linktext
                                     .replace ( /\|/g, "&#124;" );                          // encode "|"
        pre = pre.replace ( /\xFF/g, "" );                                                  // fake spaces are no longer needed
        post = post.replace ( /\xFF/g, "" )                                                 // fake spaces are no longer needed
                   .replace ( /^ *\. *$/, "" );                                             // remove very lonely "."

                                                                              // --- get author ---
        if ( template.getauthor && standalone )
            if ( !post )                                                                    // there's nothing after the link
            {
                if ( author = restoreSequenceFromLeft ( getLonelyAuthor ( pre ), line.substring ( 0, line.indexOf(linkBody) ) ) )
                    pre = "";
            }
             else if ( !pre && /^ *[,\/] */.test(post) )                                    // there's nothing before the link and there's a comma after
            {
                var splitPost = splitOnSiteName ( post, "", template.nameRx, "e" );         // remove site name from the end of the post part
                if ( splitPost && ( author = getLonelyAuthor ( splitPost.pre.replace(/^ *[,\/] */,"") + "," ) ) )
                {
                    author = restoreSequenceFromLeft ( author, restoreSequenceFromRight ( post, line.substring ( line.indexOf(linkBody) + linkBody.length ) )
                                                                   .replace(new RegExp("^( |" + invisible + ")*[,/]( |" + invisible + ")*"),"") );
                    post = "";
                    removedText.push ( splitPost );
                }
            }

        if ( template.keepdate )                                              // --- get date ---
            for ( var x in removedText )
                if ( new RegExp(dateRxStr,"i").test(removedText[x].body) )
                    for ( var pieces = removedText[x].body.match(removedText[x].rx), i = 1 ; i < pieces.length ; i++ )
                        if ( pieces[i] && onlyDateRx.test(pieces[i]) )
                            if ( !extratext ) extratext = cleanDate(pieces[i]);
                             else if ( extratext != cleanDate(pieces[i]) ) reportUserMessage ( "INTERNALERROR", "found conflicting dates in: " + line );

                                                                              // --- report and output ---
        reportUserMessage ( "COUNT", template.name );
        return oneSpaceOnRight ( restoreSequenceFromLeft ( pre, line.substring ( 0, line.indexOf(linkBody) ) ) ) +
               "{" + "{" + template.prase ( linkParts, dirtyLinkText, author, extratext ) + "}}" +
               oneSpaceOnLeft ( restoreSequenceFromRight ( post, line.substring ( line.indexOf(linkBody) + linkBody.length ) ) );
    }

    function preposition ( from )                        // from(( )-)( )<no space>
    {
        return "(" + from + "( ?[–־-])? ?\xFF*" + spaceNotAllowed + ")";
    }

    function langRxStr ( lang )
    {
        return multiSurround ( [ noSurround, parenthesesSurround, templateSurround, smallSurround ], versatileWord ( lang ) );
    }

    function getLeftSideBoundary ( maxlength )                     // maxlength >= 1
    {
        return softSpace + "{0," + maxlength + "}";
    }

    function getRightSideBoundary ( maxlength )                    // maxlength >= 1
    {
        return "(" + softSpace + "{0," + (maxlength-1) + "}" + segmentWall + "|" + softSpace + "{0," + maxlength + "})";
    }

    function buildNameRx ( name, httplink, getdate, primaryPre, secondaryPre, primaryPost, secondaryPost, languages )
    {
        var pre  = "(" + word(primaryPre) + "+" + word(ofRxStr) + "?" + (secondaryPre ? "(" + word (secondaryPre) + word(ofRxStr) + "?)*" : "") + ")";
        var post = "(" + word(ofRxStr) + "?" + word(primaryPost) + "+" + (secondaryPost ? "(" + word(ofRxStr) + "?" + word (secondaryPost) + ")*" : "") + ")";
        var site = siteNameRxStr ( name ,httplink );
        var lang = languages ? langRxStr(languages) : "";

        if ( getdate ) return [ getTwinSegmentRx ( pre + "*" + site + post + "*" + dateRxStr + post + "*" + ( lang ? lang + "?" : "" ), /./ ),
                                getTwinSegmentRx ( "(" + pre + "*" + dateRxStr + word(ofRxStr) + "?)?" +
                                                   pre + "*" + site + post + "*" + ( lang ? lang + "?" : "" ), /./ ),
                                getTwinSegmentRx ( "(" + dateRxStr + ( lang ? lang + "?|" + lang : "" ) + ")" + lineEndsHere, /e/ ) ];
        if ( lang )    return [ getTwinSegmentRx ( pre + "*" + site + post + "*" + lang + "?", /./ ),
                                getTwinSegmentRx ( lang + lineEndsHere, /e/ ) ];
                  else return [ getTwinSegmentRx ( pre + "*" + site + post + "*", /./ ) ];
    }

    function buildLinkRx ( rxStr )
    {
        return new RegExp ( "\\[http:\\/\\/" + rxStr + "[ \t]+([^\\[\\]\n]+?)[ \t]*]" );
    }

    function getLeftoverRx ( rxStr, type )
    {
        return new RegExp ( type == "OPEN" ? "http:\\/\\/" + rxStr :
                            "\\[http:\\/\\/" + rxStr + "[^ \\[\\]\n]*" +
                            ( type == "NOTEXT" ? " *" : " +(?! )" + ( type == "GOOD" ? "[^\\[\\]\n]+" : "[^\\]\n]*\\[[^\\]\n]*" ) ) +
                            "]", "gi" );
    }


 try {                              // ****************** externalLinkAutoPlace() function body starts *******************
    var invisible = "(\\{\\{[ \n]*[כdD][ \n]*}}|[\u200E\u200F\u2028])";   // includes invisible LTR (\u200E) and RTL (\u200F)
    var realSpace   =     "[ ,:;&–־-]";                                   // empty characters between words
    var softSpace   = "[\xFF ,:;&–־-]";                                   // empty characters between words, including the fake space
    var segmentWall = "[\"\'|(){}\\[<.!?]";                               // right side wall for a segment: a segment cannot continue
                                                                          // after reaching a wall
    var spaceNotAllowed = "(?!\xFF*" + realSpace + ")";
    var lineEndsHere = "(?=" + softSpace + "*(" + segmentWall + "|$))";
    var linkEdge = "(( *\\/ *)?\xFF\xFF\xFF( *\\/ *)?)";

// word boundaries are associated to the word following it. segment boundaries are associated to the segment preceding it.
// example: <<[wordBoundary]word><[wordBoundary]word><[wordBoundary]word>segmentEndBoundary>
    var wordBoundary = "(" + softSpace + "+)";                                                     // boundary between words and/or surroundings
    var boundaryWPreposition = "(" + softSpace + "+" + preposition("[במ]") + "?)";                 // [wordBoundary](from)
    var segmentEndBoundary = "(" + softSpace + "*" + segmentWall + "|" + softSpace + "+)";         // boundary at the end of a segment

    var noSurround          = { blank : true };
    var boldSurround        = { spaceAllowed : false, prepositionAllowed : true,  pre : "'''",      post : "'''"      };
//    var gereshSurround      = { spaceAllowed : false, prepositionAllowed : true,  pre : "''?",      post : "''?"      };
//    var gershayimSurround   = { spaceAllowed : false, prepositionAllowed : true,  pre : '"',        post : '"'        };
    var anyGereshSurround   = { spaceAllowed : false, prepositionAllowed : true,  pre : "(''?|\")", post : "(''?|\")" };
    var parenthesesSurround = { spaceAllowed : true,  prepositionAllowed : false, pre : "\\(",      post : "\\)"      };
    var templateSurround    = { spaceAllowed : true,  prepositionAllowed : false, pre : "\\{\\{",   post : "}}"       };
    var smallSurround       = { spaceAllowed : true,  prepositionAllowed : false, pre : "\\< *(small|sub) *\\>", post : "\\<\\/ *(small|sub) *\\>" };

//---
    var dateBoundary = "((" + softSpace + "|[.\\\\/])+)";                           // boundary between date elements
                                                                                    // normal boundary with preposition for a day or a month element
    var dateWPreposition1 = "(" + softSpace + "+" + preposition("([בהלמ]|מה)(יום( +ה)?|חודש)?") + "?)";
                                                                                    // date boundary with preposition for a month element
    var dateWPreposition2 = "((" + softSpace + "|[.\\\\/])+" + preposition("(([בהלמ]|מה)(חודש)?|חודש)") + "?)";
                                                                                    // date boundary with preposition for a year element
    var yearWPreposition  = "((" + softSpace + "|[.\\\\/])+" + preposition("[בלמ](שנ[הת])?") + "?)";
    var datePrefixRxStr = "(רא[והי]|(ב|מ?ה?)?תאריך|([במ]ה?|את ה)?פי?רסום|ש?(פורס|התפרס)(מה|ם))";
    var monthsNames = "(" + "ינואר|פברואר|מר[סץ]|אפריל|מאי|יוני|יולי|אוגוסט|ספטמבר|אוקטובר|נובמבר|דצמבר|" +
                            "January|February|March|April|May|June|July|August|September|October|November|December" + ")";
    var dateRxStr = multiSurround ( [ noSurround, parenthesesSurround ],
                                    word ( datePrefixRxStr ) + "*" +
                                    dateWPreposition1 + "(\\d{1,2}" +                                // ((from)00)
                                    dateWPreposition2 + ")?" + "(\\d{1,2}|" + monthsNames + ")" +    // (from)00 / (from)month
                                    yearWPreposition + "(\\d{4}|\\d{2})" );                          // (from)00 / (from)0000
    var onlyDateRx = new RegExp( "^" + dateRxStr + "$", "i" );

//---
    var ofRxStr = "של";
    var forFreeRxStr = "(ב?חינם|ה?חינמית?)";
    var newsTypes = "([במ]?(חדשות|כלכלה|עסקים|תרבות|יהדות|ספורט|בריאות)|" +
                    multiSurround ( [ parenthesesSurround ], word ( "(חדשות|כלכלה|עסקים|תרבות|יהדות|ספורט|בריאות)" ) ) + ")";

    var generalPrefixRxStr = "(מ?תוך|רא[והי]|([במ]|מ?ה|את +ה)?(אתר|מגזין|כתב([התי]|ות)?|מאמר|אינטרנט|רשת))";
    var newsPrefixRxStr = "(" + generalPrefixRxStr + "|[בהמ]?(עי?תון|חדשות|מערכת)|כתבת +וו?ידאו)";
    var encyclopediaPrefixRxStr = "(" + generalPrefixRxStr + "|ערך|[הב]?אנצי?קלופדיי?[הת]?)";

    var generalSuffixRxStr = "(([בהמ]|מה)?(אינטרנט|רשת))";
    var encyclopediaSuffixRxStr = "(" + generalSuffixRxStr + "|" + forFreeRxStr + ")";

//---
    var templates = new Array();

    templates.push ( { name     : "אנציקלופדיה ynet",  //                                  1           2                                   3
                       linkRx   : buildLinkRx  ( "www\\.ynet\\.co\\.il\\/yaan\\/0,7340,L-(\\d+)-([a-zA-Z0-9]+)-FreeYaan,00\\.html([?#][^ \\[\\]\n]*)?" ),
                       leftover : "www\\.ynet\\.co\\.il(:\\d+)?(?=[^ \\[\\]\n]*FreeYaan)",
                       nameRx   : buildNameRx ( "(([הב]?אנצי?קלופדיי?[הת]( +של +)?)?(ynet|וואי[ -]?נט))",
                                                "www\\.ynet\\.co\\.il\\/yaan\\/",
                                                false,
                                                encyclopediaPrefixRxStr, forFreeRxStr,
                                                encyclopediaSuffixRxStr, null ),
                       prase    : function ( linkParts, articlename, author, extratext ) {
                                      var t = "אנציקלופדיה ynet" +
                                              "|" + articlename +
                                              "|" + linkParts[1] +
                                              "|" + linkParts[2] +
                                              "|" + extratext;
                                      return t.replace ( /\|+$/, "" );
                                  }
                       } );

    templates.push ( { name     : "רשת ynet",  //    1                                         2                3           4            5     6              7                                      8
                       linkRx   : buildLinkRx  ( "(www\\.)?reshet\\.ynet\\.co\\.il(\\/חדשות\\/[Nn][eE][wW][sS])?(\\/([^ =\\[\\]\n]+))?\\/(([a-zA-Z]+),)?([a-zA-Z]?\\d+)?\\.[aA][sS][pP][xX]([/?#][^ \\[\\]\n]*)?" ),
                       leftover : "(www\\.)?reshet\\.ynet\\.co\\.il(:\\d+)?",
                       nameRx   : buildNameRx ( "(רשת|ynet|וו?איי?[ -]?נט|(חדשות( ערוץ)?|ערוץ) 2)",
                                                "(www\\.)?reshet\\.ynet\\.co\\.il(\\/|\\/חדשות\\/News\\/Main\\/[^ \\[\\]\n\\\\/#?&]*\\.aspx([/?#][^ \\[\\]\n]*)?)?",
                                                true,
                                                newsPrefixRxStr, null,
                                                generalSuffixRxStr, null ),
                       keepdate : true,
                       getauthor : true,
                       prase    : function ( linkParts, articlename, author, extratext ) {
                                      var t = "רשת ynet" +
                                              "|" + author +
                                              "|" + articlename +
                                              "|" + ( linkParts[7] || "" ) +
                                              "|" + extratext +
                                              "|" + ( linkParts[2] ? "*" : "" ) +
                                              "|" + ( linkParts[4] || "" ) +
                                              "|" + ( linkParts[2] && !/^Article$/i.test(linkParts[6] || "") || !linkParts[2] ? linkParts[6] || "" : "" );
                                      return t.replace ( /\|+$/, "" );
                                  }
                       } );

    templates.push ( { name     : "אנצ דעת",  //    1                                                         2           3
                       linkRx   : buildLinkRx ( "(www\\.)?daat\\.ac\\.il\\/encyclopedia\\/value\\.asp\\?id1=(\\d+)(#[^ \\[\\]\n]*)?" ),
                       leftover : "(www\\.)?daat\\.ac\\.il(:\\d+)?\\/encyclopedia\\/value",
                       nameRx   : buildNameRx ( "(אנציקלופדיה ה?יהודית|דעת)",
                                                "(www\\.)?daat\\.ac\\.il(:\\d+)?(\\/|\\/encyclopedia\\/index\\.asp)?",
                                                false,
                                                generalPrefixRxStr, null,
                                                generalSuffixRxStr, null ),
                       prase    : function ( linkParts, articlename, author, extratext ) {
                                      return "אנצ דעת" +
                                             "|" + linkParts[2] +
                                             "|" + articlename;
                                  }
                       } );
/*
    templates.push ( { name     : "דעת",  //        1                             2
                       linkRx   : buildLinkRx ( "(www\\.)?daat\\.ac\\.il\\/([^ \\[\\]\n]+)" ),
                       leftover : "(www\\.)?daat\\.ac\\.il(:\\d+)?\\/?",
                       nameRx   : buildNameRx ( "(דעת( +לימודי +יהדות +ורוח)?)",
                                                "(www\\.)?daat\\.ac\\.il(:\\d+)?(\\/(index.html?)?)?",
                                                false,
                                                generalPrefixRxStr, null,
                                                generalSuffixRxStr, null ),
                       getauthor : true,
                       prase    : function ( linkParts, articlename, author, extratext ) {
                                      return "דעת" +
                                             "|" + author +
                                             "|" + ( /=/.test(linkParts[2]) ? "2=" : "" ) + linkParts[2] +
                                             "|" + ( /=/.test(linkParts[2]) ? "3=" : "" ) + articlename;
                                  }
                       } );
*/
    templates.push ( { name     : "imdb title",  //     1                              2           3
                       linkRx   : buildLinkRx ( "(www\\.|us\\.)?imdb\\.com\\/title\\/tt(\\d+(\\/[a-zA-Z#]+)?)\\/?" ),
                       leftover : "(www\\.|us\\.)?imdb\\.com(:\\d+)?\\/title\\/tt",
                       nameRx   : buildNameRx ( "(imdb)",
                                                "(www\\.|us\\.)?imdb\\.com(:\\d+)?\\/title\\/tt\\/?",
                                                false,
                                                "(" + generalPrefixRxStr + "|ה?סרטים|[במ]?מסד[ ־-]+ה?נתונים( +ה?קולנועי?ים)?)", null,
                                                generalSuffixRxStr, null,
                                                "אנגלית" ),
                       prase    : function ( linkParts, articlename, author, extratext ) {
                                      return "imdb title" +
                                             "|id=" + linkParts[2] +
                                             "|title=" + articlename.replace ( /^ה?(סרט|סדרה) *(?=[^ ])/, "" );
                                  }
                       } );

    templates.push ( { name     : "imdb name",  //      1                             2            3
                       linkRx   : buildLinkRx ( "(www\\.|us\\.)?imdb\\.com\\/name\\/nm(\\d+(\\/[a-zA-Z#]+)?)\\/?" ),
                       leftover : "(www\\.|us\\.)?imdb\\.com(:\\d+)?\\/name\\/nm",
                       nameRx   : buildNameRx ( "(imdb)",
                                                "(www\\.|us\\.)?imdb\\.com(:\\d+)?\\/name\\/nm\\/?",
                                                false,
                                                "(" + generalPrefixRxStr + "|ה?סרטים|[במ]?מסד[ ־-]+ה?נתונים( +ה?קולנועי?ים)?)", null,
                                                generalSuffixRxStr, null,
                                                "אנגלית" ),
                       prase    : function ( linkParts, articlename, author, extratext ) {
                                      return "imdb name" +
                                             "|id=" + linkParts[2] +
                                             "|name=" + articlename.replace ( /^ה?(שחקן|שחקנית) *(?=[^ ])/, "" );
                                  }
                       } );

    templates.push ( { name     : "AMG",  //        1                                                     2                    3               4
                       linkRx   : buildLinkRx ( "(www\\.)?allmusic\\.com\\/cg\\/amg\\.dll\\\?p=amg(&[^ \\[\\]\n]+)?&sql=([0-9a-zA-Z:-]+)(~[0-9a-zA-Z]+)?" ),
                       leftover : "(www\\.)?allmusic\\.com(:\\d+)?\\/cg\\/amg\\.dll",
                       nameRx   : buildNameRx ( "(All ?music(\\.com| Guide)?|AMG)",
                                                "(www\\.)?allmusic\\.com",
                                                false,
                                                generalPrefixRxStr, null,
                                                generalSuffixRxStr, null,
                                                "אנגלית" ),
                       prase    : function ( linkParts, articlename, author, extratext ) {
                                      return "AMG" +
                                             "|id=" + linkParts[3] +
                                             "|שם=" + articlename;
                                  }
                       } );

    templates.push ( { name     : "דבר",  //        1                         2                                     3                        4               5         6                     7                   8                               9                                         10             11
                       linkRx   : buildLinkRx ( "(www\\.)?jpress\\.org\\.il\\/(Repository|Default\\/(Scripting|Layout\\/Includes\\/TAUHe))\\/(getFiles|Art(icle)?Win(_TAU)?)\\.asp\\?([^ \\[\\]\n]*?&)?(BaseHref|Key|Path)=DAV\\/\\/?(\\d{4}\\/\\d{2}\\/\\d{2})[^ \\[\\]\n]*?[=/]([Aa][rRdD]|[Pp][cC])(\\d{5,})[^ \\[\\]\n]*" ),
                       leftover : "(www\\.)?jpress\\.org\\.il(:\\d+)?[^ \\[\\]\n]*(BaseHref|Key|Path)=DAV",
                       nameRx   : buildNameRx ( "(עי?תון[ -]+)?(דבר|davar|עי?תונות[ -]+יהודית[ -]+היסטורית)",
                                                "(www\\.)?jpress\\.org\\.il(\\/|\\/view-(hebrew|english)\\.asp|\\/publications\\/davar-(he|en)\\.asp)?",
                                                true,
                                                newsPrefixRxStr, null,
                                                generalSuffixRxStr, null ),
                       getauthor : true,
                       prase    : function ( linkParts, articlename, author, extratext ) {
                                      var t = "דבר" +
                                              "|" + author +
                                              "|" + articlename +
                                              "|" + linkParts[9] +
                                              "|" + linkParts[11] +
                                              "|" + extratext +
                                              "|" +
                                              "|" + ( !/^Ar$/i.test(linkParts[10]) ? linkParts[10] : "" );
                                      return t.replace ( /\|+$/, "" );
                                  }
                         } );

    templates.push ( { name     : "ynet",  //                           1                                        2           3              4       5                                 6
                       linkRx   : buildLinkRx ( "www\\.ynet\\.co\\.il\\/(articles|Ext\\/Comp\\/CdaNewsFlash|([a-zA-Z]+))\\/(\\d),\\d+,L-([\\d-]+)(_\\d+)?,[a-zA-Z\\d]+\\.html([?#][^ \\[\\]\n]*)?" ),
                       leftover : "www\\.ynet\\.co\\.il(:\\d+)?(?![^ \\[\\]\n]*FreeYaan)",
                       nameRx   : buildNameRx ( "(וו?איי?[ -]*נט|ynet|ידיעות[ -]+אחרונות)",
                                                "(www\\.)?ynet\\.co\\.il\\/?",
                                                true,
                                                newsPrefixRxStr, null,
                                                generalSuffixRxStr, null ),
                       keepdate : true,
                       getauthor : true,
                       prase    : function ( linkParts, articlename, author, extratext ) {
                                      return "ynet" +
                                             "|" + author +
                                             "|" + articlename +
                                             "|" + linkParts[4] +
                                             "|" + extratext +
                                             "|" +
                                             ( linkParts[2] || linkParts[3] != "0" ? "|" + linkParts[3] : "" ) +
                                             ( linkParts[2] ? "|" + linkParts[2] : "" );
                                  }
                       } );

    templates.push ( { name     : "nrg",  //     1                    2    3-4                    5-6                                                 7               8             9                     10
                       linkRx   : buildLinkRx ( "(192\\.118\\.0\\.136|(((www|news)\\.)?nrg|((www[123]?|news)\\.)?maariv)\\.co\\.il)\\/online\\/(\\d+|archive)\\/ART(\\d+|)\\/(\\d+\\/?\\d*).html([?#][^ \\[\\]\n]*)?" ),
                       leftover : "(192\\.118\\.0\\.136|(((www|news)\\.)?nrg|((www[123]?|news)\\.)?maariv)\\.co\\.il)(:\\d+)?",
                       nameRx   : buildNameRx ( "(" + "(" + newsTypes + wordBoundary + ")?" +
                                                      "(מעריב([ -]*nrg)?|nrg([ -]*מעריב)?)" +
                                                      "((" + wordBoundary + "|(?=\\())" + newsTypes + ")?" + ")",
                                                "((www\\.|news\\.)?nrg|(www[123]?\\.|news\\.)?maariv)\\.co\\.il\\/?",
                                                true,
                                                newsPrefixRxStr, null,
                                                generalSuffixRxStr, null ),
                       keepdate : true,
                       getauthor : true,
                       prase    : function ( linkParts, articlename, author, extratext ) {
                                      return "nrg" +
                                             "|" + author +
                                             "|" + articlename +
                                             "|" + linkParts[9] +
                                             "|" + extratext +
                                             "|" +
                                             ( linkParts[7] != "1" || linkParts[8] != "1" ? "|" + linkParts[7] : "" ) +
                                             ( linkParts[8] != "1" ? "|" + linkParts[8] : "" );
                                  }
                       } );

    templates.push ( { name     : "הארץ",  //       1                     2                3           4                             5                         6                      7               8
                       linkRx   : buildLinkRx ( "(www\\.)?haaretz\\.co(\\.il|m)\\/hasite\\/(spages\\/(\\d+)\\.html|pages\\/ShArt(SR|PE|Win)?\\.jhtml\\?([^ \\[\\]\n]*?&)?itemNo=\\/?(\\d+))([?#&][^ \\[\\]\n]*)?" ),
                       leftover : "(www\\.)?haaretz\\.co(\\.il|m)(:\\d+)?",
                       nameRx   : buildNameRx ( "((מוסף[ -]+)?הארץ|haaretz)([ -]*Online)?",
                                                "(www\\.)?haaretz\\.co(\\.il|m)\\/?",
                                                true,
                                                newsPrefixRxStr, null,
                                                generalSuffixRxStr, null ),
                       keepdate : true,
                       getauthor : true,
                       prase    : function ( linkParts, articlename, author, extratext ) {
                                      return "הארץ" +
                                             "|" + author +
                                             "|" + articlename +
                                             "|" + ( linkParts[4] || linkParts[7] ) +
                                             ( extratext ? "|" + extratext : "" );
                                  }
                       } );

    templates.push ( { name     : "TheMarker",// 1     2                          3                          4         5                           6       7      8          9                                                                            10                   11          12                    13                   14
                       linkRx   : buildLinkRx ( "(([a-zA-Z]+)\\.themarker\\.co(\\.il|m)\\/tmit\\/article\\/(\\d+)|([a-zA-Z]+\\.)?themarker\\.co(\\.il|m)\\/(tmc\\/(article(Small)?|archive\\/arcSimplePrint)|ibo\\/misc\\/printFriendly)\\.jhtml\\?([^ \\[\\]\n]*?&)?ElementId=(\\/([^ \\[\\]\n]*?\\/)?)?([a-zA-Z]+\\d+_\\d+)([#&.][^ \\[\\]\n]*)?)" ),
                       leftover : "([a-zA-Z]+\\.)?themarker\\.co(\\.il|m)(:\\d+)?",
                       nameRx   : buildNameRx ( "((Caf[ée]|קפה)[ ,-]*)?(The[ -]*Marker|ד[הא][ -]*מא?רקר)([ ,-]*(Caf[ée]|קפה))?",
                                                "([a-zA-Z]+\\.)?themarker\\.co(\\.il|m)\\/?",
                                                true,
                                                newsPrefixRxStr, null,
                                                generalSuffixRxStr, null ),
                       keepdate : true,
                       getauthor : true,
                       prase    : function ( linkParts, articlename, author, extratext ) {
                                      return "TheMarker" +
                                             "|" + author +
                                             "|" + articlename +
                                             "|" + ( linkParts[4] || linkParts[13] ) +
                                             ( extratext || linkParts[2] ? "|" + extratext : "" ) +
                                             ( linkParts[2] ? "|" + linkParts[2] : "" );
                                  }
                       } );

    templates.push ( { name     : "גלובס",  //      1                                          2                           3               4             5
                       linkRx   : buildLinkRx ( "(www\\.)?globes\\.co\\.il\\/news\\/(article|home|docView)\\.aspx\\?([^ \\[\\]\n]+&)?did=(\\d+)([&#][^ \\[\\]\n]*)?" ),
                       leftover : "(www\\.)?globes\\.co\\.il(:\\d+)?",
                       nameRx   : buildNameRx ( "(globes|גלובס)",
                                                "(www\\.)?globes\\.co\\.il\\/?",
                                                true,
                                                newsPrefixRxStr, null,
                                                generalSuffixRxStr, null ),
                       keepdate : true,
                       getauthor : true,
                       prase    : function ( linkParts, articlename, author, extratext ) {
                                      return "גלובס" +
                                             "|" + author +
                                             "|" + articlename +
                                             "|" + linkParts[4] +
                                             ( extratext ? "|" + extratext : "" );
                                  }
                       } );

    templates.push ( { name     : "סרט בסינמטק תל אביב", // <--1                                               2
                       linkRx   : buildLinkRx ( "(www\\.)?cinema\\.co\\.il\\/movies\\/movie\\.asp\\?movieId=(\\d+)" ),
                       leftover : "(www\\.)?cinema\\.co\\.il(:\\d+)?",
                       nameRx   : buildNameRx ( "ה?סינמטק( +ב?תל +אביב)?",
                                                "(www\\.)?cinema\\.co\\.il\\/?",
                                                false,
                                                generalPrefixRxStr, null,
                                                generalSuffixRxStr, null ),
                       prase    : function ( linkParts, articlename ) {
                                      return "סרט בסינמטק תל אביב" +
                                             "|id=" + linkParts[2] +
                                             "|title=" + articlename;
                                }
                       } );

//---
    if ( wgNamespaceNumber == 10 )
        for ( var t in templates )
            if ( wgTitle.toLowerCase() == templates[t].name.toLowerCase() )
            {
                templates.splice ( t, 1 );
                break;
            }

    text += "\n";                                     // put a connector at the end

    reportUserMessage ( "INIT" );

// --------------------------------------------- break the text to text parts and connectors

                                                             // get connectors - there is at least one (the one I put at the end)
    var connectors = text.match ( new RegExp ("([ \t]|" + invisible + ")*((\\{\\{[ \n]*ש[ \n]*}}|\\<\\/?ref( [^<>]*)?\\>|\\{\\{[ \n]*הערה[ \n]*\\|([ \n]*שם[ \n]*=[^|\\[\\]{}]*\\||)*([ \n]*1[ \n]*=)?|(^|\n)[*#:]*|\\<\\/? *br *\\/?\\>)+([ \t]|" + invisible + ")*)+", "ig") );
    var textparts = new Array();                             // get the text parts between the connectors
    for ( var i = 0 ; i < connectors.length ; i++ )
    {
        textparts.push ( text.substring(0,text.indexOf(connectors[i])) );
        text = text.substring ( text.indexOf(connectors[i]) + connectors[i].length );
    }

// --------------------------------------------- auto place external link templates and put the text back together

    var splitd = null;
    var refCounter = 0;                                                                   // <ref> and </ref> counter
    var hebRefStatus = 0;                                                                 // {-{הערה| ... }}
    var bulletedLine = false;

    for ( var i = 0 ; i < textparts.length ; i++ )
    {
        if ( /\[http:\/\//.test ( noInvisibles(textparts[i]) ) &&
             hebRefStatus &&                                                              // textpart is inside an hebrew reference
             !checkHebRefStatus ( hebRefStatus, textparts[i] ).status )                   // and it exits the reference in this textpart
        {                                                                                 // then let's split " ... }} ... " to 2 text parts
            textparts.splice ( i + 1, 0, checkHebRefStatus ( hebRefStatus, textparts[i] ).post );
            connectors.splice ( i, 0, "}}" );
            textparts[i] = textparts[i].substring ( 0, textparts[i].lastIndexOf("}}" + textparts[i+1]) );
        }

        if ( /\[http:\/\/[^\[\]\n]+]/.test ( noInvisibles(textparts[i]) ) )
        {
            if ( /\xFF/.test(textparts[i]) ) reportUserMessage ( "INTERNALERROR", "ERROR: there is a fake space in:" + textparts[i] );
            textparts[i] = decodeHttpLinkUrl ( textparts[i] );

            for ( var t in templates )
                while ( splitd = splitOnFirstMatch ( textparts[i], templates[t].linkRx ) )
                    textparts[i] = processTextPart ( textparts[i], templates[t],
                                       bulletedLine || refCounter % 2 || checkHebRefStatus(hebRefStatus,splitd.pre).status );

            textparts[i] = restoreHttpLinkUrl ( textparts[i] );
        }

        text += textparts[i] + connectors[i];

        refCounter += getNumberOfMatches ( connectors[i], /\<\/?ref(?![^<>]*\/\>)( [^<>]*)?\>/g );

        hebRefStatus = checkHebRefStatus ( hebRefStatus, textparts[i] ).status;
        if ( hebRefStatus && connectors[i] == "}}" ) hebRefStatus--;
         else if ( /\{\{[ \n]*הערה[ \n]*\|/.test(connectors[i]) )
                  if ( !hebRefStatus && getNumberOfMatches(connectors[i],/\{\{[ \n]*הערה[ \n]*\|/g) == 1 ) hebRefStatus = 1;
                   else reportUserMessage ( "INTERNALERROR", "mismatched hebrew reference found at: " + textparts[i] + connectors[i] );

        bulletedLine = /[*#:] *$/.test(noInvisibles(connectors[i]));
    }

// ----------------------------------------------- report and output text

    var cleantext = noInvisibles ( text.replace ( /\t/g, " " ) );             // replace tabs with spaces and remove invisibles
    var leftover = null;
    for ( var t in templates )                                                // find all leftover links:  http / [http] / [http ..[.. ] / [http xx]
        if ( leftover = getNumberOfMatches ( cleantext, getLeftoverRx(templates[t].leftover, "OPEN") ) )
        {
            var notext   = getNumberOfMatches ( cleantext, getLeftoverRx(templates[t].leftover, "NOTEXT"  ) );   // closed leftover links: [http]
            var brackets = getNumberOfMatches ( cleantext, getLeftoverRx(templates[t].leftover, "BRACKETS") );   // leftover links with brackets: [http ..[.. ]
            var good     = getNumberOfMatches ( cleantext, getLeftoverRx(templates[t].leftover, "GOOD"    ) );   // good leftover links: [http xx]
            reportUserMessage ( "LEFT", templates[t].name,
                                ( leftover - notext - brackets - good ) + "<" + notext + ">[[" + brackets + "]][" + good + "]" );
        }

    if ( extLinkAutoPlaceTextBox ) extLinkAutoPlaceTextBox.value = text.replace(/\n$/,"");

    return reportUserMessage ( "DONE" );
  }
 catch ( e )
  {
    return reportUserMessage ( "CRASH", typeof(e) == "string" ? e : e.message );
  }
}   //  ********************** end of externalLinkAutoPlace() function ********************


if ( wgContentLanguage == "he" && wgNamespaceNumber % 2 == 0 && ( wgAction == "edit" || wgAction == "submit" ) ) addOnloadHook ( externalLinkAutoPlaceButtonFunc );
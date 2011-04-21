//
// סקריפט 16: נלקח מ[[ויקיפדיה:סקריפטים/16]]
// הקוד בודק אחוזי תמיכה בהצבעות. יש לסמן לפחות 2 תיבות סימון ואז לחיצה על תיבת סימון כלשהי תבדוק את אחוז התמיכה של שתי הרשימות.
// נכתב על ידי [[משתמש:Yonidebest]]
//
function checkVotingStatus() {
 var inputs = document.getElementById('bodyContent').getElementsByTagName('INPUT');
 var ols = document.getElementById('bodyContent').getElementsByTagName('OL');
 var firstCatch = true;
 var firstOL;
 var secondOL;

 for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].getAttribute('name') != 'VoteOption' || !inputs[i].checked) continue;
    if (firstCatch) {
      firstOL = ols[Number(inputs[i].getAttribute('value'))];
      firstCatch = false;
    } else {
      secondOL = ols[Number(inputs[i].getAttribute('value'))];
      break;
    }
 }

 if (firstOL && secondOL) {
   var li1Length = firstOL.getElementsByTagName('LI').length;
   var li2Length = secondOL.getElementsByTagName('LI').length;
   var result1 = ( (li1Length / (li1Length + li2Length))*100 ).toFixed(2);
   var result2 = ( (li2Length / (li1Length + li2Length))*100 ).toFixed(2);
   alert('אחוז תמיכה רשימה ראשונה: ' + result1 + '%\nאחוז תמיכה רשימה שנייה: ' + + result2 + '%');
 } else alert('הייתה בעיה. האם סימנת שתי תיבות סימון?');
}

function addCheckVotingStatus() {
 if (wgPageName.indexOf('ויקיפדיה:פרלמנט') != 0 &&
     wgPageName.indexOf('ויקיפדיה:רשימת_מועמדים_למחיקה/') != 0 &&
     wgPageName.indexOf('ויקיפדיה:רשימת_ערכים_במחלוקת/') != 0) return;
 
 var ols = document.getElementById('bodyContent').getElementsByTagName('OL');

 if (!ols) return;
 
 for (var i = 0; i < ols.length; i++) {
    var checkbox = document.createElement('INPUT');
    checkbox.type = "checkbox";
    checkbox.name = "VoteOption";
    checkbox.value = i;
    checkbox.oncontextmenu = function(){checkVotingStatus();return false;}
    ols[i].parentNode.insertBefore(checkbox, ols[i]);
    ols[i].parentNode.insertBefore(document.createTextNode('השווה רשימה זו'), ols[i]);
    ols[i].parentNode.insertBefore(document.createElement('BR'), ols[i]);
 }
}
addOnloadHook(addCheckVotingStatus);
// עד כאן סקריפט 16

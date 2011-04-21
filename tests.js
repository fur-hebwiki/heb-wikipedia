if (!String.prototype.endsWith)
	String.prototype.endsWith = function(what) { 
		return what && what.length && this.length >= what.length && (this.lastIndexOf(what) == this.length - what.length) 
	}
	
function monitorPatrolRemoveAuto() {
	var uls = document.getElementById('bodyContent').getElementsByTagName('ul');
	for (uli = 0; uli < uls.length; uli++) {
		var ul = uls[uli];
		var lis =  getElementsByClassName(ul, 'li', 'mw-logline-patrol');
		for (var lii = 0; lii < lis.length; lii++) {
			var li = lis[lii];
			if (li.innerHTML.endsWith(' כבדוקה (אוטומטית) ‏  '))
				ul.removeChild(li);
		}
	}
}

function monitorPatrolIsItCheckedPage() {
	var optionElems = document.getElementById('bodyContent').getElementsByTagName('option');
	for (var elemi = 0; elemi < optionElems.length; elemi++) {
		var elem = optionElems[elemi];
		if (elem.value == 'patrol' && elem.innerHTML == 'יומן שינויים בדוקים')
			return elem.selected;
	}
	return false;
}

function monitorPatrolAddButton() {
	var inputs = document.getElementById('bodyContent').getElementsByTagName('input');
	for (var inputi = 0; inputi < inputs.length; inputi++)
		var input = inputs[inputi];
		if (input.type == 'submit' && input.value == 'הצגה') {
			var papa = input.parentNode;
			var nextNode = input.nextSibling;
			if (papa) {
				var filterButton = document.createElement('input');
				filterButton.type = 'button';
				filterButton.value = 'הסתר בדיקות אוטומטיות';
				filterButton.onclick = monitorPatrolRemoveAuto;
				if (nextNode) {
					if (nextNode.value != input.value) //avoid inserting this button more than once.
						papa.insertBefore(filterButton, nextNode);
				} else
					papa.appendChild(filterButton);
			}
			return;
		}
}

if (wgCanonicalSpecialPageName == 'Log' && monitorPatrolIsItCheckedPage())
 	monitorPatrolAddButton();
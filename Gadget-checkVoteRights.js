// check voting rights
 

function cvr_pad(i, len) {
	var s = '00000' + i;
	return s.substring(s.length - len);
}

function cvr_timestamp(d) {
	function p2(i){ return cvr_pad(i, 2); }
	d = new Date(d);
	return '' + d.getFullYear() + p2(d.getMonth()+1) + p2(d.getDate()) + p2(d.getHours()) + p2(d.getMinutes()) + '00';
}

function cvr_ts2date(ts) {
	var a = ts.split(/[^\d]/);
	return new Date(a[0],parseInt(a[1])-1,a[2],a[3],a[4],a[5]);
}

function cvr_get_json(params, func) {
	params.format = 'json';
	$.getJSON(wgScriptPath + '/api.php?', params, func);
}

function cvr_analyze_edit_count(data, startDate, label) {
	var starttime = startDate.getTime();
	var milisperday = 1000 * 60 * 60 * 24;
	var ok = false;
	if (data && data.query && data.query.usercontribs) 
		for (var i = 3; !ok && i < 13; i++) {
			var timespan = i * 30;
			var numedits = parseInt(i * 100 / 3) - 1;
			if (numedits < data.query.usercontribs.length) {
				var dateOfEdit = cvr_ts2date(data.query.usercontribs[numedits].timestamp);
				ok = dateOfEdit.getTime() > starttime - timespan * milisperday;
			}
		}
	label.innerText = label.textContent = ok ? ' (עבר) ' : ' (נכשל - לא מספיק עריכות) ';
	label.style.color = ok ? 'green' : 'red';
}

function cvr_check_enough_edits(startDate, label) {
	var params = {action: 'query', list: 'usercontribs', ucprop: 'timestamp', ucuser: label.userName, 
				usnamespace: '0|6|8|10|12|14|100', ucstart: cvr_timestamp(startDate), uclimit: 400};
	cvr_get_json(params, function(data){cvr_analyze_edit_count(data, startDate, label)});
}

function cvr_check_seniority(startDate, label) {
	var from = cvr_timestamp(startDate - 30 * 24 * 60 * 60 * 1000)
	var params = {format: 'json', action: 'query', list: 'usercontribs', ucprop: 'timestamp', 
					ucstart: from, ucuser: label.userName, uclimit: 1}
	cvr_get_json(params, function(data){
		if (data && data.query && data.query.usercontribs && data.query.usercontribs.length)
			cvr_check_enough_edits(startDate, label);
		else {
			label.innerText = label.textContent =  ' (נכשל - לא מספיק ותיק) ';
			label.style.color = 'red';
		}
	});
}

function cvr_bad_num(num, min, max) {
	return isNaN(num) || num < min || max < num;
}

function cvr_get_vote_startDate() {
	var ts = document.getElementById('checkTime').value.replace(':', '');
	if (ts == 'hhmm') ts = '0000';
	var ds = document.getElementById('checkDate').value;
	if (ts == 'ddmmyyyy') 
		return alert("יש להזין את תאריך הבדיקה (בדרך כלל תאריך תחילת ההצבעה) בתיבה המתאימה."); // type check date in the appropriate textbox
	var year = parseInt(ds.substr(4),10), month = parseInt(ds.substr(2,2),10), day = parseInt(ds.substr(0,2),10), 
		hour = parseInt(ts.substr(0,2),10), minute = parseInt(ts.substr(2,2),10);
	if (cvr_bad_num(year, 2001, 2066) || cvr_bad_num(month, 1, 12) || cvr_bad_num(day, 1, 31))
		return alert('התאריך שהוזן אינו תקין. יש להזין יום ב-2 ספרות, לאחר מכן חודש ב-2 ספרות ולאחר מכן שנה ב-4 ספרות.');
	if (cvr_bad_num(hour, 0, 23) || cvr_bad_num(minute, 0, 59))
		return alert('הזמן שהוזן אינו תקין: יש להזין שעה בין 0-23, ודקה בין 0-59');
	return new Date(year, month-1, day, hour, minute, 0);
}

function cvr_check_user() {
	var startDate = cvr_get_vote_startDate();
	if (!(startDate instanceof Date))
		return;
	this.innerText = this.textContent = 'בודק...';
	this.style.color = 'orange';
	cvr_check_seniority(startDate, this);
}

function cvr_init() {
	function addBoxes() {
		var tool = document.getElementById('t-showvoterights');
		var td = document.createElement('input');
		$.extend(td, {size: '10', id: 'checkDate', value: 'ddmmyyyy'})
		tool.parentNode.insertBefore(td, tool);
		tt = document.createElement('input');
		$.extend(tt, {size: '10', id: 'checkTime', value: 'hh:mm'})
		tool.parentNode.insertBefore(tt, tool);
		var lists = document.getElementById('bodyContent').getElementsByTagName('li');
		for (var i = 0; i < lists.length; i++) {
			var s = lists[i].innerHTML;
			if (s.indexOf('תחילת ההצבעה') + 1) {
				var match = s.match(/(\d{2}):(\d{2})/);
				if (match)
					tt.value = match[1] + ':' + match[2];
				var months = ['בינואר','בפברואר','במרץ','באפריל','במאי','ביוני','ביולי','באוגוסט','בספטמבר','באוקטובר','בנובמבר','בדצמבר'];
				var regex = /(\d{1,2})[, ]*(MONTHS)[, ]*(20\d{2})/;
				regex = new RegExp(regex.source.replace('MONTHS', months.join('|')));
				match = s.match(regex);
				if (match)
					td.value = cvr_pad(match[1], 2) + cvr_pad($.inArray(match[2], months) + 1, 2) + match[3];
			}
		}
		tool.parentNode.removeChild(tool);
	}
	
	function addLinks() {
		var links = document.getElementById('bodyContent').getElementsByTagName('a');
		for (var i = 0; i < links.length; i++) {
			var link = links[i], title = link.title;
			if (title.indexOf('משתמש:') != 0 || title.indexOf('/') + 1) 
				continue;
			var username = title.replace('משתמש:', '').replace(' (הדף אינו קיים)', '');
			var label = document.createElement('label');
			label.innerText = label.textContent = '[±] ';
			$.extend(label.style, {color: 'blue', cursor: 'pointer'});
			$.extend(label, {userName: username, onclick: cvr_check_user, title: 'בדוק זכות הצבעה של ' + username});
			link.parentNode.insertBefore(label, link);
		}
	}
	
	addBoxes();
	addLinks();
}


if (wgNamespaceNumber == 4 || wgNamespaceNumber % 2 == 1)
	addPortletLink('p-tb', "javascript:cvr_init()", 'בדוק זכות הצבעה', 't-showvoterights', 'בדוק זכות הצבעה של משתמשים בדף זה', "", 't-specialpages');
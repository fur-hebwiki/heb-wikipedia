
function whatsit(data) {
		var i = 7;
}



function fhid_test1() {
	var params = {
		action: 'parse',
		page: 'User%20Talk:%D7%A7%D7%99%D7%A4%D7%95%D7%93%D7%A0%D7%97%D7%A9/tests',
		format: 'json'
	}
	$.getJSON('http://en.wikipedia.org/w/api.php?', params, function(data){
		whatsit(data);
	}
	);
}




addPortletLink('p-tb', 'javascript:fhid_test1()', 'for hidro');
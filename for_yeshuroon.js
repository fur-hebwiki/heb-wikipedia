/* adds to the toolbox a list of templates to add in talkpages. */
 

function riwt_do_the_work() {
	alert('hah?');
}
 
 
 
 
function riwt_add_menu_item() {		
	var title = addPortletLink('p-tb', 'javascript:riwt_do_the_work()', 'תבניות "בעבודה"');
}
 

addOnloadHook(riwt_add_menu_item);
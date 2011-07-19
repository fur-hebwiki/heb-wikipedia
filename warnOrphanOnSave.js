if (wgNamespaceNumber == 0 && getParamValue('action') == 'edit') 
	$.getJSON(wgScriptPath + '/api.php?', {format: 'json', action: 'query', list: 'backlinks', bltitle: wgTitle, blnamespace: 0}, 
		function(data) {
			if (data && data.query && typeof data.query.backlinks != "undefined" && data.query.backlinks.length == 0) 
				$('#wpSave').click(function(){alert('הערך ' + wgTitle + ' "יתום": אין ערך אחר המקשר אליו.\nאנא נסו למצוא ערכים קיימים שיכולים לקשר לערך זה, ולהוסיף קישורים כאלו.');});
		});
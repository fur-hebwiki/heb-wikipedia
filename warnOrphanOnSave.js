if (wgNamespaceNumber == 0 && $.inArray(getParamValue('action'), ['edit', 'submit']) + 1) 
	hookEvent("load", function() {
		$.getJSON(
			wgScriptPath + '/api.php?', 
			{format: 'json', action: 'query', list: 'backlinks', bltitle: wgTitle, blfilterredir: 'nonredirects',  blnamespace: "0|100"}, 
			function(data) {
				if (data && data.query && typeof data.query.backlinks != "undefined" && data.query.backlinks.length == 0)
					if ($('#wpTextbox1').text().indexOf('#הפניה')) {
						var reminder = 'הערך ' + wgTitle + ' "יתום": אין ערך אחר המקשר אליו.\nאנא נסו למצוא ערכים קיימים שיכולים לקשר לערך זה, ולהוסיף קישורים כאלו.'
						if (! $('input[name=wpSection]').length && $('#wpTextbox1').text().indexOf('{{ערך יתום') == -1)
							reminder += '<br>' + 'עד שייתווספו קישורים כאלו, יש להוסיף לערך את התבנית {{ערך יתום}}';
						$('#wpTextbox1').after($('<p>').css({backgroundColor: 'pink', width: '100%'}).html(reminder));
					}
			});
		});
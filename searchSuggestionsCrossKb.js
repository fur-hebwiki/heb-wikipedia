$(document).ready(function() {
	mediaWiki.loader.using('jquery.suggestions', function () {
		$('#searchInput, #searchInput2, #powerSearchText, #searchText').suggestions({
			fetch:function(query) {
				var $this=$(this);
				var request = $.ajax({url:wgScriptPath+'/api.php',
					data:{'action':'opensearch', 'search': query, 'namespace':0, 'suggest':''},
					dataType:'json',
					success: function(data){
						if (data && 1 in data) {
							$this.suggestions('suggestions',data[1]);
							if (data[1].length < 8) {
								var orig = data[1];
								var hes = "qwertyuiopasdfghjkl;zxcvbnm,./'קראטוןםפשדגכעיחלךףזסבהנמצתץ";
								var alt = '';
								for (var i = 0; i < query.length; i++) {
									var c = query[i].toLowerCase();
									var ic = hes.indexOf(c);
									alt += ic + 1 ? hes[(ic + 29) % 58] : c;
								}
								$.ajax({url:wgScriptPath+'/api.php',
									data:{'action':'opensearch','search': alt, limit: 12 - orig.length, 'namespace': 0, 'suggest': ''},
									dataType:'json',
									success: function(data){
										if (data && 1 in data) 
											$this.suggestions('suggestions', orig.concat(data[1]));
									}
								});
							}
						}
					}
				});
				$(this).data('request',request);
			},
			cancel: function() {
				var request=$(this).data('request');
				if (request && typeof request.abort=='function') {
					request.abort();
					$(this).removeData('request');
				}
			},
			result: {
				select: function ($input) {
					$input.closest('form').submit();
				}},
			delay: 120,
			positionFromLeft: $('body').is('.rtl'),
			highlightInput:true
		}).bind('paste cut drop', function(e) {
			$(this).trigger('keypress');
		});
	});
});

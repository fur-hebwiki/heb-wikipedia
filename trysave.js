


function tryEdit(title, summary, type, text, next) {
	function tokenReceived(token) {
		var param = {action: 'edit', title: title, summary: summary, token: token, format: 'json'};
		param[type] = text;
		$.post(
			wgScriptPath + '/api.php?',
			param,
			function(data) {
				if (data && data.edit && data.edit.result == 'Success' && typeof next == 'function')
					next();
			}
		);
	}
	
    $.getJSON(
        wgScriptPath + '/api.php?',
        {
            action: 'query',
            prop: 'info',
            intoken: 'edit',
            titles: title,
            indexpageids: '',
            format: 'json'
        },
        function( data ) {
            if ( data.query.pages && data.query.pageids ) {
                var pageid = data.query.pageids[0];
                token = data.query.pages[pageid].edittoken;
				tokenReceived(token);
            }
        }
    );
}

// tryEdit('משתמש:קיפודנחש/ארגח', 'נה נה נבובו', 'text', '?זה המידע שיכתב בדף', function(){alert('success');});
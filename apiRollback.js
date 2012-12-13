// License: PD
"use strict";
if (
	mw.config.get( 'wgAction' ) === 'history' 
	|| ( $.inArray( mw.config.get( 'wgCanonicalSpecialPageName' ), ['RecentChanges', 'Watchlist', 'Contributions'] ) + 1 )
	|| mw.util.getParamValue( 'diff' )
	)
$(function() {
	var	storageKey = 'rollback summary',
		historyDepth = 20;
		
	$( 'a[href *= "action=rollback"]' ).on( 'click contextmenu', function(e) {
		var $this = $(this),
			href = $this.attr( 'href' ),
			token = decodeURIComponent( href.replace( /.*[&\?]token=/, '' ).replace( /&.*/, '' ) ),
			title = decodeURIComponent( href.replace( /.*[&\?]title=/, '' ).replace( /&.*/, '' ).replace(/_/g, ' ') ),
			from = decodeURIComponent( href.replace( /.*[&\?]from=/, '' ).replace( /&.*/, '' ).replace( /\+/g, ' ' ) ),
			rbParams = { action: 'rollback', token: token, title: title, user: from },
			rollback = function() {
				if ( mw.config.get( 'watchOnRollback' ) )
					rbParams.watchlist = 'watch';
				$.post( mw.util.wikiScript( 'api' ), rbParams, function() {
					var match = $this.text().match( /:(.*)/ ),
						edits = 'edit',
						userLink = $this.closest('span').parent().find( '.mw-usertoollinks' );
					if ( match.length > 1 )
						edits = match[1];
					mw.util.jsMessage('Successfully rolled back ' + edits + ' by ' + from);
					$this.remove();
					if ( userLink.length ) {
						var a = userLink.find( 'a' ).filter( function(){ return $( this ).text() == 'talk'; } ),
							href = a.attr( 'href' ),
							encodeTitle = mw.util.encode
						a.css( { fontWeight: 'bold' } );
						href += ( /\?/.test( href ) ? '&' : '?' ) + 'vanarticle=' + mw.util.rawurlencode( title );
						a.attr( 'href', href );
					}
				} );
			};
		
		e.preventDefault();
		mw.loader.using( [ 'jquery.ui.dialog', 'jquery.jStorage' ], function() {
			if ( e.type == 'contextmenu' ) {
				var dialog,
					summary,
					options = $.jStorage.get( storageKey ) || [],
					inputbox = $( '<input>', { width: '40em' } ).val( options[ 0 ] || '' ),
					selector = $( '<select>' ).change( function() { inputbox.val( this.value ) } );
				$( options ).each( function( index, item ) { selector.append( $( '<option>', { value: item, text: item } ) ); } );
				dialog = $( '<div>' ).dialog( {
					title: 'Rollback summary',
					width: 'auto',
					modal: true,
					buttons: [
						{text: 'OK', click: function() {
							summary = $.trim( inputbox.val() );
							if ( !summary )
								return;
							var old = $.inArray( summary, options );
							if ( old + 1 )
								options.splice( old, 1 );
							options.unshift( summary );
							if ( options.length > 20 )
								options.pop();
							$.jStorage.set( storageKey, options );
							rbParams.summary = summary.replace(/\$1/g, title).replace(/\$2/g, from);
							rollback();
							$(this).dialog( 'close' );
						} },
						{ text: 'Cancel', click: function() { $( this ).dialog( 'close' ); } }
					]
				 } )
					.append($('<p>').html('Pleace enter rolllback summary.<br />' 
						+ '$1 will be replaced by page name (' + title + '),<br />' 
						+ '$2 will be replaced by user name (' + from + ').')
					)
					.append( inputbox )
					.append( $( '<p>' ) )
					.append( selector );
				inputbox.focus().select().keypress( function( e ) { 
					if ( e.which == 13 ) 
						dialog.siblings( '.ui-dialog-buttonpane' ).find( 'button:Contains(OK)' ).click();
				} );
			} // e.type == contextmenu
			else // left-click
				rollback();
		} ); // using
	} ); // on
} );

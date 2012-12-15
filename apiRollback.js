//<source lang="javascript">
// License: PD
// rollback "in place", using API
"use strict";

"use strict";
if (
	mw.config.get( 'wgAction' ) === 'history' 
	|| ( $.inArray( mw.config.get( 'wgCanonicalSpecialPageName' ), ['Recentchanges', 'Watchlist', 'Contributions'] ) + 1 )
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
						edits = ( match && match.length > 1 ) ? match[1] : $this.text(),
						userLink = $this.closest('span').parent().find( '.mw-usertoollinks' );
					mw.util.jsMessage( i18n( 'success', edits, from ) );
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
		
		function i18n() {
			var str = arguments[0];
			switch ( mw.config.get( 'wgUserLanguage' ) ) {
				case 'he':
					switch ( str ) {
						case 'description': 
							str = 'אנא הזינו תקציר עריכה לשחזור.<br />'
								+ '$1 יוחלף בשם הדף (%1),<br />' 
								+ '$2 יוחלף בשם המשתמש (%2)';
							break;
						case 'dialogtitle':
							return 'תקציר לשחזור';
						case 'success':
							str = '%1 של %2 בוצע';
							break;
						case 'ok':
							return 'אישור';
						case 'cancel':
							return 'ביטול';
					}
					break;
				default: 
					switch ( str ) {
						case 'description': 
							str = 'Please enter rolllback summary.<br />' 
								+ '$1 will be replaced by page name (%1),<br />' 
								+ '$2 will be replaced by user name (%2).';
							break;
						case 'dialogtitle' :
							return 'Rollback summary';
						case 'success':
							str = 'Successfully rolled back %1 by %2';
							break;
						case 'ok':
							return 'OK';
						case 'cancel':
							return 'Cancel';
					}
					break;
			}
			for ( var arg = 1; arg < arguments.length; arg++ ) 
				str = str.replace( new RegExp( '%' + arg, 'g' ), arguments[ arg ] );
			return str;
		}
		
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
					title: i18n( 'dialogtitle' ),
					width: 'auto',
					modal: true,
					buttons: [
						{ text: i18n('ok'), click: function() {
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
						{ text: i18n('cancel'), click: function() { $( this ).dialog( 'close' ); } }
					]
				 } )
					.append($('<p>').html()
					)
					.append( inputbox )
					.append( $( '<p>' ).html( i18n( 'description', title, from ) ) )
					.append( selector );
				inputbox.focus().select().keypress( function( e ) { 
					if ( e.which == 13 ) 
						dialog.siblings( '.ui-dialog-buttonpane' ).find( 'button:Contains(' + i18n('ok') + ')' ).click();
				} );
			} // e.type == contextmenu
			else // left-click
				rollback();
		} ); // using
	} ); // on
} );
//</source>

// <source lang="javascript">
// License: PD
// rollback "in place", using API
"use strict";
if (
	mw.config.get( 'wgAction' ) === 'history'
	|| ( $.inArray( mw.config.get( 'wgCanonicalSpecialPageName' ), ['Recentchanges', 'Watchlist', 'Contributions'] ) + 1 )
	|| mw.util.getParamValue( 'diff' )
	)
mw.loader.using( [ 'jquery.ui.dialog', 'jquery.jStorage', 'mediawiki.api', 'mediawiki.user' ], function() { $(function() {
	var	summaryStorageKey = 'rollback summary',
		userTalkStorageKey = 'rollback user talk message',
		historyDepth = 20,
		api = new mw.Api(),
		onRollbackClick = function(e) {
			var $this = $(this),
				href = $this.attr( 'href' ),
				token = decodeURIComponent( href.replace( /.*[&\?]token=/, '' ).replace( /&.*/, '' ) ),
				title = decodeURIComponent( href.replace( /.*[&\?]title=/, '' ).replace( /&.*/, '' ).replace(/_/g, ' ') ),
				from = decodeURIComponent( href.replace( /.*[&\?]from=/, '' ).replace( /&.*/, '' ).replace( /\+/g, ' ' ) ),
				talkPageMessage,
				rbParams = { action: 'rollback', token: token, title: title, user: from },
				rollback = function( watchArticle, watchTalk ) {
					if ( watchArticle )
						rbParams.watchlist = 'watch';
					api.post( rbParams, function() {
						var match = $this.text().match( /:(.*)/ ),
							edits = ( match && match.length > 1 ) ? match[1] : $this.text(),
							userLink = $this.closest('span').parent().find( '.mw-usertoollinks' ),
							talkPageLink = $this.closest( 'span' ).parent()
								.find( '.mw-usertoollinks a' )
								.filter( function() { return $( this ).text() == "Talk" } ),
							talkHref = talkPageLink.attr( 'href' ),
							vanarticle = 'vanarticle=' + mw.util.rawurlencode( title );

						talkPageLink
							.attr( 'href',  talkHref + ( /\?/.test( talkHref ) ? '&' : '?' ) + vanarticle )
							.css( 'font-weight', 'bold' );

						mw.util.jsMessage( i18n( 'success', edits, from ) );
						$this.remove();
						if ( talkPageMessage )
							api.post(
								{ action: 'edit',
									token: mw.user.tokens.get( 'editToken' ),
									appendtext: talkPageMessage,
									title: i18n('user talk', from),
									watchlist: watchTalk ? 'watch' : 'preferences'
								},
								function() { mw.util.jsMessage( i18n( 'talk success', talkPageMessage, from ) ); }
							);
					} );
				};

			e.preventDefault();

			if ( e.type == 'click' ) // left click
				rollback( mw.config.get( 'watchOnRollback' ) );
			else { // right click.
				var dialog,
					summary,
					summaries = $.jStorage.get( summaryStorageKey ) || [],
					talkPageMessages = $.jStorage.get( userTalkStorageKey ) || {},
					summaryInputbox = $( '<input>', { width: '40em' } ).val( summaries[ 0 ] || '' ),
					summarySelector = $( '<select>' ).change( function() { summaryInputbox.val( this.value ); } ),
					watchArticleCheckbox = $( '<input>', { type: 'checkbox' }).prop( 'checked', mw.config.get( 'watchOnRollback' ) ),
					talkPageInputbox = $( '<input>', { width: '40em' } ),
					talkPageTextbox = $( '<textarea>', { rows: 5 } ),
					talkPageSelector = $( '<select>' ).change( function() {
						talkPageInputbox.val( this.value );
						talkPageTextbox.val( talkPageMessages[this.value] || '' )
					} ),
					watchTalkpageCheckbox = $( '<input>', { type: 'checkbox' }).prop( 'checked', mw.config.get( 'watchTalkpageOnRollbackMessage' ) ),
					prepareTalkpageSelector = function() {
						talkPageSelector.find( '*' ).remove();
						talkPageSelector.append( $( '<option>' ) );
						for ( var talkMessageName in talkPageMessages )
							talkPageSelector.append( $( '<option>', { value: talkMessageName, text: talkMessageName } ) );
						talkPageInputbox.val( '' );
						talkPageTextbox.val( '' );

					};

				$( summaries ).each( function( index, item ) { summarySelector.append( $( '<option>', { value: item, text: item } ) ); } );
				prepareTalkpageSelector();
				dialog = $( '<div>' ).dialog( {
					title: i18n( 'dialogtitle' ),
					modal: true,
					buttons: [
						{ text: i18n('ok'), click: function() {
							summary = $.trim( summaryInputbox.val() );
							talkPageMessage = $.trim( talkPageTextbox.val() );
							if ( !summary && !talkPageMessage )
								return;
							if ( summary ) {
								var old = $.inArray( summary, summaries );
								if ( old + 1 )
									summaries.splice( old, 1 );
								summaries.unshift( summary );
								if ( summaries.length > 20 )
									summaries.pop();
								$.jStorage.set( summaryStorageKey, summaries );
								rbParams.summary = summary.replace( /\$1/g, title ).replace( /\$2/g, from ).replace( /\$3/g, $this.text() );
							}
							var talkPageMessageName = $.trim( talkPageInputbox.val() );
							if ( talkPageMessageName ) {
								if ( talkPageMessage )
									talkPageMessages[ talkPageMessageName ] = talkPageMessage;
								else
									delete talkPageMessages[ talkPageMessageName ];
								$.jStorage.set( userTalkStorageKey, talkPageMessages );
							}
							if ( talkPageMessage )
								talkPageMessage = '\n' + talkPageMessage.replace( /\$1/g, title ).replace( /\$2/g, from ).replace( /\$3/g, $this.text() );
							rollback( watchArticleCheckbox.prop( 'checked' ), watchTalkpageCheckbox.prop( 'checked' ) );
							$(this).dialog( 'close' );
						} },
						{ text: i18n( 'read boilerplate button' ), click: function() {
							var source = prompt( i18n( 'enter boilerplate source' ) );
							if ( source ) {
								$.ajax( {
									url: mw.util.wikiScript(),
									data: {title: source, action: 'raw', ctype: 'text/x-wiki'},
									success: function( data ) {
										try {
											eval( 'talkPageMessages = ' + data );
											prepareTalkpageSelector();
											$.jStorage.set( userTalkStorageKey, talkPageMessages );
										} catch(e) {
											alert( i18n( 'exception reading boilerplates', source, e ) );
										}
									}
								} );
							}
						} },
						{ text: i18n( 'cancel' ), click: function() { $( this ).dialog( 'close' ); } }
					]
				} )
					.append( $( '<p>' ).html( i18n( 'description', title, from, $this.text() ) ) )
					.append( $( '<table>' )
						.append( $('<tr>' )
							.append( $( '<td>', { text: i18n( 'summary' ) } ) )
							.append( summaryInputbox )
						)
						.append( $('<tr>' )
							.append( $( '<td>', { text: i18n( 'summaryhist' ) } ) )
							.append( summarySelector )
						)
						.append( $('<tr>' )
							.append( $( '<td>', { text: i18n( 'watch article', title ) } ) )
							.append( watchArticleCheckbox )
						)
						.append( $('<tr>' )
							.append( $( '<td>', { text: i18n( 'talkpagename' ) } ) )
							.append( talkPageInputbox )
						)
						.append( $('<tr>' )
							.append( $( '<td>', { text: i18n( 'talkpagemessage', from ) } ) )
							.append( talkPageTextbox )
						)
						.append( $('<tr>' )
							.append( $( '<td>', {text: i18n( 'talkpagemessagehist' ) } ) )
							.append( talkPageSelector )
						)
						.append( $('<tr>' )
							.append( $( '<td>', { text: i18n( 'watch talkpage', from ) } ) )
							.append( watchTalkpageCheckbox )
						)
					);
				dialog.dialog( 'option', { width: 'auto', height: 'auto' } );
				dialog.dialog( 'option', { position: { my: 'center', at: 'center', of: window } } );
				dialog.dialog( 'option', { width: '100', height: '100' } ); // this perversion is for rtl: we need to force a redraw.
				dialog.dialog( 'option', { width: 'auto', height: 'auto' } );
				dialog.dialog( 'option', { position: { my: 'center', at: 'center', of: window } } ); // ditto.
			} // e.type == contextmenu
		}, // onRollbackClick

		i18n = function () {
			var str = arguments[0];
			switch ( mw.config.get( 'wgUserLanguage' ) ) {
				case 'he':
					switch ( str ) {
						case 'description':
							str = 'ניתן (אין חובה) להזין תקציר עריכה לשחזור, ו/או הודעה שתישמר בדף השיחה של %2.<br />'
								+ '$1 יוחלף בשם הדף (%1),<br />'
								+ '$2 יוחלף בשם המשתמש (%2)<br />'
								+ '$3 יוחלף בכותרת הקישור (%3)'

							break;
						case 'dialogtitle':
							return 'שחזור עריכה';
						case 'success':
							str = '%1 של %2 בוצע';
							break;
						case 'ok':
							return 'אישור';
						case 'cancel':
							return 'ביטול';
						case 'rightclick':
							return 'לחיצה בכפתור ימני מאפשרת להוסיף תקציר.'
						case 'summary':
							return 'תקציר עריכה:';
						case 'summaryhist':
							return 'תקצירים קודמים:';
						case 'talkpagename':
							return 'שם ההודעה בדף שיחה:';
						case 'talkpagemessagehist':
							return 'הודעות דף שיחה קודמות:';
						case 'talkpagemessage':
							str = 'הודעה לדף השיחה של %1:';
							break;
						case 'talk success':
							str = 'ההודעה:\n%1\nנשמרה בהצלחה בדף השיחה של %2';
							break;
						case 'read boilerplate button':
							return 'קריאת ההודעות מדף';
						case 'enter boilerplate source':
							return 'הזינו את שם הדף בו נמצאות ההודעות המוכנות';
						case 'exception reading boilerplates':
							str = 'שגיאה בניסיון לקריאת תבניות מדף "%1". השגיאה היא: %2';
							break;
						case 'watch article':
							str = 'הוסף את הדף %1 לרשימת המעקב';
							break;
						case 'watch talkpage':
							str = 'הוסף את דף השיחה של משתמש:%1 לרשימת המעקב';
							break;
						case 'user talk':
							str = 'שיחת משתמש:%1';
							break;
						case 'talk success':
							str = 'ההודעה:<br />%1<br />נשמרה בהצלחה בדף "שיחת משתמש:%2"';
							break;
					}
					break;
				default:
					switch ( str ) {
						case 'description':
							str = 'You can enter a summary for the rollback instead of the default, '
								+ 'and an optional message to be added to %2 talk page<br />'
								+ '$1 will be replaced by page name (%1),<br />'
								+ '$2 will be replaced by user name (%2),<br />'
								+ '$3 will be replaced by rollover text (%3).';
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
						case 'rightclick':
							return 'Use right mouse button to add summary.'
						case 'summary':
							return 'Summary:';
						case 'summaryhist':
							return 'Summary history:';
						case 'talkpagename':
							return 'Talk page message name:';
						case 'talkpagemessagehist':
							return 'Talk page message name history:';
						case 'talkpagemessage':
							return 'Talk page message:';
						case 'read boilerplate button':
							return 'Read messages';
						case 'enter boilerplate source':
							return 'Please enter page name from which to read boilerplate messages';
						case 'exception reading boilerplates':
							str = 'Exception trying to interpret Page "%1". Exception is: %2';
							break;
						case 'watch article':
							str = 'Add page "%1" to your watchlist';
							break;
						case 'watch talkpage':
							str = 'Add "User talk:%1" to your watchlist';
							break;
						case 'user talk':
							str = 'User talk:%1';
							break;
						case 'talk success':
							str = 'Successfuly added<br />%1<br />To page User talk:%2';
							break;
					}
					break;
			}
			for ( var arg = 1; arg < arguments.length; arg++ )
				str = str.replace( new RegExp( '%' + arg, 'g' ), arguments[ arg ] );
			return str;
		};

	$( 'a[href *= "action=rollback"]' ).on( 'click contextmenu', onRollbackClick );
	var tries = 0,
		timer = setInterval( function() {
			if ( window.removeTooltip ) {
				$( 'a[href *= "action=rollback"]' ).each( function() {
					window.removeTooltip( this );
					this.title += " \n" + i18n( 'rightclick' );
				})
				clearInterval( timer );
			} else if ( tries++ > 30 )
				clearInterval( timer );
		}, 100 );
} ); // document ready
} ); // using
//</source>

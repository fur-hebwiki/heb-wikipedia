// <source lang="javascript">
//
// Cat-A-Lot
// Changes category of multiple files (or pages)
//
// Originally by Magnus Manske
// RegExes by Ilmari Karonen
// Completely rewritten by DieBuche
//
// Modified to work on regular pages instead of files + Hebrew translation: קיפודנחש
//
// READ THIS PAGE IF YOU WANT TO TRANSLATE OR USE THIS ON ANOTHER SITE: 
// http://commons.wikimedia.org/wiki/MediaWiki_talk:Gadget-Cat-a-lot.js/translating
//
var catALot = {
    apiUrl: wgScriptPath + "/api.php",
    searchmode: false,
	version: 2.15,

	init: function () {
		$("body")
		.append('<div id="cat_a_lot">' + '<div id="cat_a_lot_data"><div>' + '<input type="text" id="cat_a_lot_searchcatname" placeholder="' + this.i18n.enterName + '"/>' 
		+ '</div><div id="cat_a_lot_category_list"style="white-space:nowrap;"></div>' + '<div id="cat_a_lot_mark_counter"> </div>' + '<div id="cat_a_lot_selections">' + this.i18n.select 
		+ ' <a id="cat_a_lot_select_all">' + this.i18n.all + '</a> / ' + '<a id="cat_a_lot_select_none">' + this.i18n.none + '</a>' 
		+ '</div></div><div id="cat_a_lot_head">' + '<a id="cat_a_lot_toggle">Cat-a-lot</a></div></div>');

		if (!this.searchmode) $('#cat_a_lot_selections').append('<br><a id="cat_a_lot_remove"><b>' + this.i18n.removeFromCat + '</b></a>');

		$('#cat_a_lot_searchcatname').keypress(function (e) {
			if (e.which == 13) catALot.updateCats($(this).val());
		});
		$('#cat_a_lot_remove').click(function () {
			catALot.remove();
		});
		$('#cat_a_lot_select_all').click(function () {
			catALot.toggleAll(true);
		});
		$('#cat_a_lot_select_none').click(function () {
			catALot.toggleAll(false);
		});
		$('#cat_a_lot_toggle').click(function () {
			$(this).toggleClass('cat_a_lot_enabled');
			catALot.run();
		});

		importStylesheet('MediaWiki:Gadget-Cat-a-lot.css');
		this.localCatName = mw.config.get('wgFormattedNamespaces')[14];
	},
	findAllLabels: function () {
		if (this.searchmode) this.labels = $('#mw-pages').find('li');
		else this.labels = $('#mw-pages').find('li');
		var links = $('#mw-pages').find('li>a');
		for (var a in links)
			links[a].href = null;
	},

	getMarkedLabels: function () {
		var marked = [];
		this.selectedLabels = this.labels.filter('.cat_a_lot_selected');
		this.selectedLabels.each(function () {
			var file = $(this).find('a[title]');
			marked.push([file.attr('title'), $(this)]);
		});
		return marked;
	},

	updateSelectionCounter: function () {
		this.selectedLabels = this.labels.filter('.cat_a_lot_selected');
		$('#cat_a_lot_mark_counter').show().html(this.selectedLabels.length + this.i18n.filesSelected );
	},

	makeClickable: function () {
		this.findAllLabels();
		this.labels.click(function () {
			$(this).toggleClass('cat_a_lot_selected');
			catALot.updateSelectionCounter();
		});
	},

	toggleAll: function (select) {
		this.labels.toggleClass('cat_a_lot_selected', select);
		this.updateSelectionCounter();
	},

	getSubCats: function (cmcontinue) {
		var data = {
			action: 'query',
			list: 'categorymembers',
			cmnamespace: 14,
			cmlimit: 50,
			cmtitle: this.localCatName + ':' + this.currentCategory
		};
		if (cmcontinue) 
			data.cmcontinue = cmcontinue;
		else
			this.subCats = [];
			
		this.doAPICall(data, function (result) {

			var cats = result.query.categorymembers;

			for (var i = 0; i < cats.length; i++) {
				catALot.subCats.push(cats[i].title.replace(/^[^:]+:/, ""));
			}
			if (result['query-continue'])
				catALot.getSubCats(result['query-continue'].categorymembers.cmcontinue);
			else {
				catALot.catCounter++;
				if (catALot.catCounter == 2) catALot.showCategoryList();
			}
		});
	},


	getParentCats: function () {
		var data = {
			action: 'query',
			prop: 'categories',
			limit: 50,
			titles: this.localCatName + ':' + this.currentCategory
		};
		this.doAPICall(data, function (result) {
			catALot.parentCats = new Array();
			var pages = result.query.pages;
			if (pages[-1] && pages[-1].missing == '') {
				catALot.catlist.html('<span id="cat_a_lot_no_found">' + catALot.i18n.catNotFound + '</span>');
				document.body.style.cursor = 'auto';
				
				catALot.catlist.append('<ul></ul>');
				catALot.createCatLinks("→", [catALot.currentCategory]);
				return;
			}
			// there should be only one, but we don't know its ID
			for (var id in pages) {
				var cats = pages[id].categories;
			}
			for (var i = 0; i < cats.length; i++) {
				catALot.parentCats.push(cats[i].title.replace(/^[^:]+:/, ""));
			}

			catALot.catCounter++;
			if (catALot.catCounter == 2) catALot.showCategoryList();
		});
	},
	regexBuilder: function (category) {
		var catname = ( this.localCatName == 'Category' ) ? this.localCatName : this.localCatName + '|Category';
		catname = '(' + catname + ')';
		
		// Build a regexp string for matching the given category:
		// trim leading/trailing whitespace and underscores
		category = category.replace(/^[\s_]+/, "").replace(/[\s_]+$/, "");

		// escape regexp metacharacters (= any ASCII punctuation except _) 
		category = category.replace(/([!-\/:-@\[-^`{-~])/g, '\\$1');

		// any sequence of spaces and underscores should match any other         
		category = category.replace(/[\s_]+/g, '[\\s_]+');

		// Make the first character case-insensitive:
		var first = category.substr(0, 1);
		if (first.toUpperCase() != first.toLowerCase()) category = '[' + first.toUpperCase() + first.toLowerCase() + ']' + category.substr(1);

		// Compile it into a RegExp that matches MediaWiki category syntax (yeah, it looks ugly):
		// XXX: the first capturing parens are assumed to match the sortkey, if present, including the | but excluding the ]]
		return new RegExp('\\[\\[[\\s_]*' + catname + '[\\s_]*:[\\s_]*' + category + '[\\s_]*(\\|[^\\]]*(?:\\][^\\]]+)*)?\\]\\]', 'ig');
	},

	getContent: function (file, targetcat, mode) {

		var data = {
			action: 'query',
			prop: 'info|revisions',
			rvprop: 'content|timestamp',
			intoken: 'edit',
			titles: file[0]
		};

		this.doAPICall(data, function (result) {
			catALot.editCategories(result, file, targetcat, mode);
		});
	},

	editCategories: function (result, file, targetcat, mode) {

		if (result == null) {
			//Happens on unstable wifi connections..
			this.connectionError.push(file[0]);
			this.updateCounter();
			return;
		}
		var pages = result.query.pages;

		// there should be only one, but we don't know its ID
		for (var id in pages) {
			// The edittoken only changes between logins
			this.edittoken = pages[id].edittoken;
			var otext = pages[id].revisions[0]['*'];
			var starttimestamp = pages[id].starttimestamp;
			var timestamp = pages[id].revisions[0]['timestamp'];
		}


		var sourcecat = wgTitle;

		// Check if that file is already in that category
		if (mode != "remove" && this.regexBuilder(targetcat).test(otext)) {
			//If the new cat is already there, just remove the old one.
			if (mode == 'move') {
				mode='remove';
			} else {
				this.alreadyThere.push(file[0]);
				this.updateCounter();
				return;
			}
		}

		var text = otext;
		var comment;
		
		// Fix text
		switch (mode) {
		case 'add':
			text += "\n[[" + this.localCatName + ":" + targetcat + "]]\n";
			comment = this.i18n.summaryAdd + targetcat + "]]";
			break;
		case 'copy':
			text = text.replace(this.regexBuilder(sourcecat), "[[" + this.localCatName + ":" + sourcecat + "$2]]\n[[" + this.localCatName + ":" + targetcat + "$2]]");
			comment = this.i18n.summaryCopy + sourcecat + "]] " + this.i18n.to + targetcat + "]]";
			break;
		case 'move':
			text = text.replace(this.regexBuilder(sourcecat), "[[" + this.localCatName + ":" + targetcat + "$2]]");
			comment = this.i18n.summaryMove + sourcecat + "]] " + this.i18n.to + targetcat + "]]";
			break;
		case 'remove':
			text = text.replace(this.regexBuilder(sourcecat), "");
			comment = this.i18n.summaryRemove + sourcecat + "]]";
			break;
		}

		if (text == otext) {
			this.notFound.push(file[0]);
			this.updateCounter();
			return;
		}

		var data = {
			action: 'edit',
			summary: comment,
			title: file[0],
			token: this.edittoken,
			starttimestamp: starttimestamp,
			basetimestamp: timestamp,
			text: text
		};
		this.doAPICall(data, function (ret) {
			catALot.updateCounter();
		});
		this.markAsDone(file[1], mode, targetcat);
	},
	markAsDone: function (label, mode, targetcat) {
		
		label.addClass('cat_a_lot_markAsDone');
		switch (mode) {
		case 'add':
			label.append('<br>' + this.i18n.addedCat + ' ' + targetcat);
			break;
		case 'copy':
			label.append('<br>' + this.i18n.copiedCat + ' ' + targetcat);
			break;
		case 'move':
			label.append('<br>' + this.i18n.movedCat + ' ' + targetcat);
			break;
		case 'remove':
			label.append('<br>' + this.i18n.movedCat );
			break;
		}
	},
	updateCounter: function () {

		this.counterCurrent++;
		if (this.counterCurrent > this.counterNeeded) this.displayResult();
		else this.domCounter.text(this.counterCurrent);
	},

	displayResult: function () {
		
		document.body.style.cursor = 'auto';
		$('.cat_a_lot_feedback').addClass('cat_a_lot_done');
		$('.ui-dialog-content').height('auto');
		var rep = this.domCounter.parent();
		rep.html('<h3>' + this.i18n.done + '</h3>');
		rep.append( this.i18n.allDone + '<br />');

		var close = $('<a>').append( this.i18n.returnToPage );
		close.click(function () {
			catALot.progressDialog.remove();
			catALot.toggleAll(false);
		});
		rep.append(close);
		if (this.alreadyThere.length) {
			rep.append( this.i18n.skippedAlready );
			rep.append(this.alreadyThere.join('<br>'));
		}
		if (this.notFound.length) {
			rep.append( this.i18n.skippedNotFound );
			rep.append(this.notFound.join('<br>'));
		}
		if (this.connectionError.length) {
			rep.append( this.i18n.skippedServer );
			rep.append(this.connectionError.join('<br>'));
		}

	},

	moveHere: function (targetcat) {
		this.doSomething(targetcat, 'move');
	},

	copyHere: function (targetcat) {
		this.doSomething(targetcat, 'copy');
	},

	addHere: function (targetcat) {
		this.doSomething(targetcat, 'add');
	},

	remove: function () {
		this.doSomething('', 'remove');
	},

	doSomething: function (targetcat, mode) {
		var files = this.getMarkedLabels();
		if (files.length == 0) {
			alert( this.i18n.noneSelected );
			return;
		}
		this.notFound = [];
		this.alreadyThere = [];
		this.connectionError = [];
		this.counterCurrent = 1;
		this.counterNeeded = files.length;
		this.showProgress();
		for (var i = 0; i < files.length; i++) {
			this.getContent(files[i], targetcat, mode);
		}
	},

	doAPICall: function (params, callback) {

		params.format = 'json';
		$.ajax({
			url: this.apiUrl,
			cache: false,
			dataType: 'json',
			data: params,
			type: 'POST',
			success: callback
		});
	},

	createCatLinks: function (symbol, list) {
		list.sort();
		var domlist = this.catlist.find('ul');
		for (var i = 0; i < list.length; i++) {
			var li = $('<li></li>');

			var link = $('<a></a>');
			link.text(list[i]);
			li.data('cat', list[i]);
			link.click(function () {
				catALot.updateCats($(this).parent().data('cat'));
			});

			if (this.searchmode) {
				var add = $('<a class="cat_a_lot_action"><b>' + this.i18n.add + '</b></a>');
				add.click(function () {
					catALot.addHere($(this).parent().data('cat'));
				});
			} else {
				var move = $('<a class="cat_a_lot_move"><b>' + this.i18n.move + '</b></a>');
				move.click(function () {
					catALot.moveHere($(this).parent().data('cat'));
				});

				var copy = $('<a class="cat_a_lot_action"><b>' + this.i18n.copy + '</b></a>');
				copy.click(function () {
					catALot.copyHere($(this).parent().data('cat'));
				});
			}

			// Can't move to source category
			if (list[i] != wgTitle && this.searchmode) li.append(' ').append(add);
			else if (list[i] != wgTitle && !this.searchmode) li.append(' ').append(move).append(' ').append(copy);
			li.append(symbol).append(' ').append(link);

			domlist.append(li);
		}
	},

	getCategoryList: function () {
		this.catCounter = 0;
		this.getParentCats();
		this.getSubCats();
	},

	showCategoryList: function () {
		var thiscat = [this.currentCategory];

		this.catlist.empty();
		this.catlist.append('<ul></ul>');

		this.createCatLinks("↑", this.parentCats);
		this.createCatLinks("→", thiscat);
		this.createCatLinks("↓", this.subCats);

		document.body.style.cursor = 'auto';
        //Reset width
		$('#cat_a_lot').width('');
		$('#cat_a_lot').width( $('#cat_a_lot').width() * 1.05 );
	},

	updateCats: function (newcat) {
		document.body.style.cursor = 'wait';

		this.currentCategory = newcat;
		this.catlist = $('#cat_a_lot_category_list');
		this.catlist.html('<div class="cat_a_lot_loading">' + this.i18n.loading + '</div>');
		this.getCategoryList();
	},
	showProgress: function () {
		document.body.style.cursor = 'wait';

		this.progressDialog = $('<div></div>')
		.html( this.i18n.editing + ' <span id="cat_a_lot_current">' + this.counterCurrent + '</span> ' + this.i18n.of + this.counterNeeded)
		.dialog({
			width: 450,
			height: 90,
			minHeight: 90,
			modal: true,
			resizable: false,
			draggable: false,
			closeOnEscape: false,
			dialogClass: "cat_a_lot_feedback"
		});
		$('.ui-dialog-titlebar').hide();
		this.domCounter = $('#cat_a_lot_current');

	},

	run: function () {
		if ($('.cat_a_lot_enabled').length) {
			this.makeClickable();
			$("#cat_a_lot_data").show();
			$('#cat_a_lot')
			   	.resizable({ handles: 'n', resize: function(event, ui) {$(this).css({left:"", top:""});} });

			if (this.searchmode) this.updateCats("Pictures and images");
			else this.updateCats(wgTitle);

		} else {
			$("#cat_a_lot_data").hide();
			$("#cat_a_lot").resizable( "destroy" );
			//Unbind click handlers
			this.labels.unbind('click');
		}
	},
	i18n: (wgUserLanguage == "he") ? {
		loading        : 'טוען...',
		editing        : 'עורך דף',
		of             : 'מתוך ',
		skippedAlready : '<h5>הדפים להלן לא שונו, משום שכבר הכילו את הקטגוריה:</h5>',
		skippedNotFound: '<h5>הדפים להלן לא שונו, משום שהקטגוריה לא נמצאה:</h5>',
		skippedServer  : '<h5>Tהדפים להלן לא שונו, בגלל בעית תקשורת/h5>',
		allDone        : 'כל הדפים שונו.',
		done           : 'בוצע!',
		addedCat       : 'קטגוריה התווספה',
		copiedCat      : 'קטגוריה התווספה',
		movedCat       : 'הועברו לקטגוריה',
		removedCat     : 'הוסרו מקטגוריה',
		returnToPage   : 'חזור לדף',
		catNotFound    : 'קטגוריה לא נמצאה.',


		//as in 17 files selected
		filesSelected   : ' דפים מסומנים.',
		
		//Actions
		copy            : 'הוסף',
		move            : 'העבר',
		add             : 'הוסף', 
		removeFromCat   : 'הסר מקטגוריה זו',
		enterName       : 'הקישו שם קטגוריה',
		select          : 'בחירה',
		all             : 'כולם',
		none            : 'נקה',
		
		noneSelected    : 'אין דפים מסומנים!',
		
		//Summaries:
		summaryAdd      : 'Cat-a-lot: הוסיף ל[[קטגוריה:',
		summaryCopy     : 'Cat-a-lot: העתיק מ[[קטגוריה:',
		to              : 'ל[[קטגוריה:',
		summaryMove     : 'Cat-a-lot: העביר מ[[קטגוריה:',
		summaryRemove   : 'Cat-a-lot: הסיר מ[[קטגוריה:'
	} :	{
		//Progress
		loading        : 'Loading...',
		editing        : 'Editing page',
		of             : 'of ',
		skippedAlready : '<h5>The following pages were skipped, because the page was already in the category:</h5>',
		skippedNotFound: '<h5>The following pages were skipped, because the old category could not be found:</h5>',
		skippedServer  : '<h5>The following pages couldn\'t be changed, since there were problems connecting to the server:</h5>',
		allDone        : 'All pages are processed.',
		done           : 'Done!',
		addedCat       : 'Added category',
		copiedCat      : 'Copied to category',
		movedCat       : 'Moved to category',
		removedCat     : 'Removed from category',
		returnToPage   : 'Return to page',
		catNotFound    : 'Category not found.',


		//as in 17 files selected
		filesSelected   : ' files selected.',
		
		//Actions
		copy            : 'Copy',
		move            : 'Move',
		add             : 'Add', 
		removeFromCat   : 'Remove from this category',
		enterName       : 'Enter category name',
		select          : 'Select',
		all             : 'all',
		none            : 'none',
		
		noneSelected    : 'No files selected!',
		
		//Summaries:
		summaryAdd      : 'Cat-a-lot: Adding [[Category:',
		summaryCopy     : 'Cat-a-lot: Copying from [[Category:',
		to              : 'to [[Category:',
		summaryMove     : 'Cat-a-lot: Moving from [[Category:',
		summaryRemove   : 'Cat-a-lot: Removing from [[Category:'
	}
};


if ((wgNamespaceNumber == -1 && wgCanonicalSpecialPageName == "Search") || wgNamespaceNumber == 14) {
	if ( wgNamespaceNumber == -1 ) catALot.searchmode = true;
	//This is not optimal, since we can't be sure that we have the strings before the DOM is built
	if ( mw.config.get('wgUserLanguage') != 'en' ) {
		importScript('MediaWiki:Gadget-Cat-a-lot.js/' + mw.config.get('wgUserLanguage') );
	}
	if ( mw.config.get('wgContentLanguage') != 'en' ) {
		importScript('MediaWiki:Gadget-Cat-a-lot.js/' + mw.config.get('wgContentLanguage') );
	}
	mediaWiki.loader.using('jquery.ui.dialog', function () {
		$(document).ready(function () {
			catALot.init();
		});
	});
}

// </source>
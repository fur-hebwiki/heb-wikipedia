// <source lang="javascript">
//
// Cat-A-Lot
// Changes category of multiple files
//
// Originally by Magnus Manske
// RegExes by Ilmari Karonen
// Completely rewritten by DieBuche
var catALot = {
	apiUrl: wgScriptPath + "/api.php",
	searchmode: false,
	version: 2.05,

	init: function () {
		$("#column-one, #mw-panel").append('<div id="cat_a_lot">' + '<div id="cat_a_lot_data"><div>' + '<input type="text" id="cat_a_lot_searchcatname" placeholder="הקלד קטגוריה ולחץ Enter"/>' + '</div><div id="cat_a_lot_category_list" style="text-wrap:none;white-space:nowrap;"></div>' + '<div id="cat_a_lot_mark_counter"> </div>' + '<div id="cat_a_lot_selections">בחר <a  id="cat_a_lot_select_all">כולם</a> / ' + '<a  id="cat_a_lot_select_none">נקה</a>' + '</div></div><div id="cat_a_lot_head">' + '<a id="cat_a_lot_toggle">Cat-a-lot</a></div></div>');

		if (!this.searchmode) $('#cat_a_lot_selections').append('<br><a id="cat_a_lot_remove"><b>הסר מקטגוריה זו</b></a>');

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
		$('#cat_a_lot_mark_counter').show().html(this.selectedLabels.length + " ערכים מסומנים.");
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
			cmtitle: 'Category:' + this.currentCategory
		};
		if (typeof cmcontinue == "string") // ie braindamage
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
			titles: 'Category:' + this.currentCategory
		};
		this.doAPICall(data, function (result) {
			catALot.parentCats = new Array();
			var pages = result.query.pages;
			if (pages[-1] && pages[-1].missing == '') {
				catALot.catlist.html('<span id="cat_a_lot_no_found">Category not found.</span>');
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
		return new RegExp('\\[\\[[\\s_]*קטגוריה[\\s_]*:[\\s_]*' + category + '[\\s_]*(\\|[^\\]]*(?:\\][^\\]]+)*)?\\]\\]', 'g');
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
			text += "\n[[" + "קטגוריה:" + targetcat + "]]\n";
			comment = "Cat-a-lot: הוספת [[" + "קטגוריה:" + targetcat + "]]";
			break;
		case 'copy':
			text = text.replace(this.regexBuilder(sourcecat), "[[קטגוריה:" + sourcecat + "$1]]\n[[קטגוריה:" + targetcat + "$1]]");
			comment = "Cat-a-lot: העתקה מ [[" + "קטגוריה:" + sourcecat + "]] ל [[" + "קטגוריה:" + targetcat + "]]";
			break;
		case 'move':
			text = text.replace(this.regexBuilder(sourcecat), "[[קטגוריה:" + targetcat + "$1]]");
			comment = "Cat-a-lot: העברה מ [[" + "קטגוריה:" + sourcecat + "]] ל [[" + "קטגוריה:" + targetcat + "]]";
			break;
		case 'remove':
			text = text.replace(this.regexBuilder(sourcecat), "");
			comment = "Cat-a-lot: מחיקת [[" + "קטגוריה:" + sourcecat + "]]";
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
			label.append('<br>Added category ' + targetcat);
			break;
		case 'copy':
			label.append('<br>Copied to category ' + targetcat);
			break;
		case 'move':
			label.append('<br>Moved to category ' + targetcat);
			break;
		case 'remove':
			label.append('<br>Removed from category');
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
		rep.html('<h3>Done!</h3>');
		rep.append('All pages are processed.<br />');

		var close = $('<a>Return to page</a>')
		close.click(function () {
			catALot.progressDialog.remove();
			catALot.toggleAll(false);
		});
		rep.append(close);
		if (this.alreadyThere.length) {
			rep.append('<h5>The following pages were skipped, because the page was already in the category:</h5>');
			rep.append(this.alreadyThere.join('<br>'));
		}
		if (this.notFound.length) {
			rep.append('<h5>The following pages were skipped, because the old category could not be found:</h5>');
			rep.append(this.notFound.join('<br>'));
		}
		if (this.connectionError.length) {
			rep.append('<h5>The following pages couldn\'t be changed, since there were problems connecting to the server:</h5>');
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
			alert("אין ערכים מסומנים.");
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
				var add = $('<a class="cat_a_lot_action"><b>הוסף</b></a>');
				add.click(function () {
					catALot.addHere($(this).parent().data('cat'));
				});
			} else {
				var move = $('<a class="cat_a_lot_move"><b>החלף</b></a>');
				move.click(function () {
					catALot.moveHere($(this).parent().data('cat'));
				});

				var copy = $('<a class="cat_a_lot_action"><b>הוסף</b></a>');
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
	},

	updateCats: function (newcat) {
		document.body.style.cursor = 'wait';

		this.currentCategory = newcat;
		this.catlist = $('#cat_a_lot_category_list');
		this.catlist.html('<div class="cat_a_lot_loading">טוען...</div>');
		this.getCategoryList();
	},
	showProgress: function () {
		document.body.style.cursor = 'wait';

		this.progressDialog = $('<div></div>').html('עורך דף <span id="cat_a_lot_current">' + this.counterCurrent + '</span> of ' + this.counterNeeded).dialog({
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
			$('#cat_a_lot').resizable({ handles: 'n', resize: function(event, ui) {$(this).css({left:"", top:""});} });

			if (this.searchmode) this.updateCats("Pictures and images");
			else this.updateCats(wgTitle);

		} else {
			$("#cat_a_lot_data").hide();
			$("#cat_a_lot").resizable( "destroy" );
			//Unbind click handlers
			this.labels.unbind('click');
		}
	}
};

if (wgNamespaceNumber == 14) {
    mediaWiki.loader.using('jquery.ui.dialog', function () {
        $(document).ready(function () {
            catALot.init();
        });
    });
}

if (wgNamespaceNumber == -1 && wgCanonicalSpecialPageName == "Search") {
	catALot.searchmode = true;
	mediaWiki.loader.using('jquery.ui.dialog', function () {
        $(document).ready(function () {
            catALot.init();
        });
    });
}

// </source>
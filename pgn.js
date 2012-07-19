"use strict";
$(function() {
	var
		imageUrl = {},
		flipImageUrl,
		WHITE = 'l',
		BLACK = 'd',
		acode = 'a'.charCodeAt(0),
		moveBucket = [], // this is a scratch thing, but since we access it from different objects, it's convenient to have it global
		anim = 1000,
		timer;

// some global, utility functions.
	function bindex(file, row) { return 8 * file + row; }
	function file(ind) { return Math.floor(ind / 8);}
	function row(ind) { return ind % 8; }
	function sign(a, b) { return a == b ? 0 : (a < b ? 1 : -1); }
	function colorDiff(a, b) {return (a == BLACK) - (b == BLACK);}
	function fileOfStr(file) { return file && file.charCodeAt(0) - acode;}
	function rowOfStr(row) { return row && (row - 1);}
	function clearTimer() {
		if (timer)
			clearInterval(timer);
		timer = null;
	}

	function linkMoveClick(e) {
		var
			$this = $(this),
			game = $this.data('game'),
			index = $this.data('index'),
			noAnim = $this.data('noAnim');
		clearTimer();
		$this.addClass('pgn-current-move').siblings().removeClass('pgn-current-move');
		game.showMoveTo(index, noAnim);
	}



	function Gameset() { // set of functions and features that depend on blocksize, flip and currentGame.
		$.extend(this, {
			blockSize: 40,
			flip: false,
			allGames: [],
			currentGame: null,

			top: function(row) { return ((this.flip ? row : (7 - row)) * this.blockSize) + 'px'; },
			left: function(file) { return ((this.flip ? 7 - file : file) * this.blockSize) + 'px'; },
			selectGame: function(val) {
				if (this.currentGame)
					this.currentGame.toggle(false);
				var game = this.allGames[val];
				if (game) {
					this.currentGame = game;
					game.show();
				}
			}
		});
	}

	function ChessPiece(type, color, game) {
		this.game = game;
		this.type = type;
		this.color = color;
		this.img = $('<img>', {src: imageUrl[type + color], 'class': 'pgn-chessPiece', opacity: 0})
			.appendTo(game.boardDiv);
	}

	ChessPiece.prototype.appear = function(file, row) {
		this.img.css({top: this.game.gs.top(row), left: this.game.gs.left(file), width: this.game.gs.blockSize})
			.fadeIn(anim);
	}

	ChessPiece.prototype.showMove = function(file, row) {
		this.img.animate({top: this.game.gs.top(row), left: this.game.gs.left(file)}, anim);
	}

	ChessPiece.prototype.disappear = function() {
		this.img.fadeOut(anim);
	}

	ChessPiece.prototype.setSquare = function(file, row) {
		this.file = file;
		this.row = row;
		this.onBoard = true;
	}

	ChessPiece.prototype.capture = function(file, row) {
		if (this.type == 'p' && !this.game.pieceAt(file, row))  // en passant
			this.game.clearPieceAt(file, this.row);
		else
			this.game.clearPieceAt(file, row);
		this.move(file, row);
	}

	ChessPiece.prototype.move = function(file, row) {
		this.game.clearSquare(this.file, this.row);
		this.game.pieceAt(file, row, this); // place it on the board)
		this.game.registerMove({what:'m', piece: this, file: file, row: row})
	}

	ChessPiece.prototype.pawnDirection = function () { return this.color == WHITE ? 1 : -1; }
	ChessPiece.prototype.pawnStart = function() { return this.color == WHITE ? 1 : 6; }

	ChessPiece.prototype.remove = function() {
		this.onBoard = false;
	}

	ChessPiece.prototype.canMoveTo = function(file, row, capture) {
		if (!this.onBoard)
			return false;
		var rd = Math.abs(this.row - row), fd = Math.abs(this.file - file);
		switch(this.type) {
			case 'n':
				return ((rd + fd == 3 && rd * fd) // sum is 3, none is 0
					? this
					: false);
			case 'p':
				var dir = this.pawnDirection();
				return (
					((this.row == this.pawnStart() && row ==  this.row + dir * 2 && !fd && !capture)
					|| (this.row + dir == row && !fd && !capture)
					|| (this.row + dir == row && fd == 1 && capture))
						? this
						: false);
			case 'k':
				return ((rd < 2 && fd < 2)
					? this
					: false);
			case 'q':
				return ((! ((rd - fd) * rd * fd) && this.game.roadIsClear(this.file, file, this.row, row))
					? this
					: false);
			case 'r':
				return ((!(rd * fd) && this.game.roadIsClear(this.file, file, this.row, row))
					? this
					: false);
			case 'b':
				return (((rd == fd) && this.game.roadIsClear(this.file, file, this.row, row))
					? this
					: false);
		}
	}

	ChessPiece.prototype.matches = function(oldFile, oldRow, isCapture, file, row) {
		if (typeof oldFile == 'number' && oldFile != this.file)
			return false;
		if (typeof oldRow  == 'number' && oldRow != this.row)
			return false;
		return this.canMoveTo(file, row, isCapture);
	}

	ChessPiece.prototype.showAction = function(move) {
		switch (move.what) {
			case 'a':
				this.appear(move.file, move.row);
				break;
			case 'm':
				this.showMove(move.file, move.row);
				break;
			case 'r':
				this.disappear();
				break;
		}
	}

	function Game(tds, gameSet) {
		$.extend(this, {
			board: [],
			boards: [],
			pieces: [],
			moves: [],
			linkOfIndex: [],
			index: 0,
			piecesByTypeCol: {},
			descriptions: {},
			tds: tds,
			gs: gameSet});
		tds.boardTd.append(this.boardDiv = $('<div>', {'class': 'pgn-board-div'}));
		tds.pgnTd.append(this.pgnDiv = $('<div>', {'class': 'pgn-pgn-display'}));
		tds.descriptionsTd.append(this.descriptionsDiv = $('<div>', {'class': 'pgn-descriptions'}));
		this.toggle(false);
	}

	Game.prototype.toggle = function(what) {
		this.boardDiv.toggle(what);
		this.pgnDiv.toggle(what);
		this.descriptionsDiv.toggle(what);
	}

	Game.prototype.show = function() {
		clearTimer();
		this.toggle(true);
		this.drawBoard();
	}

	Game.prototype.copyBoard = function() { return this.board.slice(); }

	Game.prototype.pieceAt = function(file, row, piece) {
		var i = bindex(file, row);
		if (piece) {
			this.board[i] = piece;
			piece.setSquare(file, row);
		}
		return this.board[i];
	}

	Game.prototype.clearSquare = function(file, row) {
		delete this.board[bindex(file, row)];
	}

	Game.prototype.clearPieceAt = function(file, row) {
		var
			piece = this.pieceAt(file, row);
		if (piece)
			piece.remove();
		this.clearSquare(file, row);
		this.registerMove({what:'r', piece: piece, file: file, row: row})
	}

	Game.prototype.roadIsClear = function(file1, file2, row1, row2) {
		var file, row, dfile, drow, moves = 0;
		dfile = sign(file1, file2);
		drow = sign(row1, row2);
		var file = file1, row = row1;
		while (true) {
			file += dfile;
			row += drow;
			if (file == file2 && row == row2)
				return true;
			if (this.pieceAt(file, row))
				return false;
			if (moves++ > 10)
				throw 'something is wrong in function roadIsClear.' +
					' file=' + file + ' file1=' + file1 + ' file2=' + file2 +
					' row=' + row + ' row1=' + row1 + ' row2=' + row2 +
					' dfile=' + dfile + ' drow=' + drow;
		}
	}

	Game.prototype.addPieceToDicts = function(piece) {
		this.pieces.push(piece);
		var type = piece.type, color = piece.color;
		var byType = this.piecesByTypeCol[type];
		if (! byType)
			byType = this.piecesByTypeCol[type] = {};
		var byTypeCol = byType[color];
		if (!byTypeCol)
			byTypeCol = byType[color] = [];
		byTypeCol.push(piece);
	}

	Game.prototype.registerMove = function(move) {
		moveBucket.push(move);
	}

	Game.prototype.gotoBoard = function(index) {
		this.index = index;
		this.drawBoard();
	}

	Game.prototype.advance = function() {
		if (this.index < this.moves.length - 1)
			this.showMoveTo(this.index + 1);
		this.pgnDiv.find('span').removeClass('pgn-current-move');
		if (this.linkOfIndex[this.index])
			this.linkOfIndex[this.index].addClass('pgn-current-move');
	}

	Game.prototype.showMoveTo = function(index, noAnim) {
		var dif = index - this.index;
			if (noAnim || dif < 1 || 2 < dif)
				this.gotoBoard(index);
			else
				while (this.index < index) {
					var mb = this.moves[++this.index];
					for (var m in mb)
						mb[m].piece.showAction(mb[m]);
				}
	}

	Game.prototype.drawBoard = function() {
		var
			saveAnim = anim,
			board = this.boards[this.index];
		anim = 0;
		for (var i in this.pieces)
			this.pieces[i].disappear();
		for (var i in board)
			board[i].appear(file(i), row(i));
		anim = saveAnim;
	}

	Game.prototype.kingSideCastle = function(color) {
		var king = this.piecesByTypeCol['k'][color][0];
		var rook = this.piecesByTypeCol['r'][color][1];
		king.move(fileOfStr('g'), king.row);
		rook.move(fileOfStr('f'), rook.row);
	}

	Game.prototype.queenSideCastle = function(color) {
		var king = this.piecesByTypeCol['k'][color][0];
		var rook = this.piecesByTypeCol['r'][color][0];
		king.move(fileOfStr('c'), king.row);
		rook.move(fileOfStr('d'), rook.row);
	}

	Game.prototype.promote = function(piece, type, file, row, capture) {
		piece[capture ? 'capture' : 'move'](file, row);
		this.clearPieceAt(file, row);
		var newPiece = this.createPiece(type, piece.color, file, row);
		this.registerMove({what:'a', piece: newPiece, file: file, row: row})
	}

	Game.prototype.createPiece = function(type, color, file, row) {
		var piece = new ChessPiece(type, color, this);
		this.pieceAt(file, row, piece);
		this.addPieceToDicts(piece);
		return piece;
	}

	Game.prototype.createMove = function(color, moveStr) {
		moveStr = moveStr.replace(/^\s+|[!?+# ]*(\$\d{1,3})?$/g, ''); // check, mate, comments, glyphs.
		if (!moveStr.length)
			return false;
		if (moveStr == 'O-O')
			return this.kingSideCastle(color);
		if (moveStr == 'O-O-O')
			return this.queenSideCastle(color);
		if ($.inArray(moveStr, ['1-0', '0-1', '1/2-1/2', '*']) + 1)
			return moveStr; // end of game - white wins, black wins, draw, game halted/abandoned/unknown.
		var match = moveStr.match(/([RNBKQ])?([a-h])?([1-8])?(x)?([a-h])([1-8])(=[RNBKQ])?/);
		if (!match) {
			return false;
		}

		var type = match[1] ? match[1].toLowerCase() : 'p';
		var oldFile = fileOfStr(match[2]);
		var oldRow = rowOfStr(match[3]);
		var isCapture = !!match[4];
		var file = fileOfStr(match[5]);
		var row = rowOfStr(match[6]);
		var promotion = match[7];
		var candidates = this.piecesByTypeCol[type][color];
		if (!candidates || !candidates.length)
			throw 'could not find matching pieces. type="' + type + ' color=' + color + ' moveAGN=' + moveStr;
		var found = false;
		for (var c in candidates) {
			found = candidates[c].matches(oldFile, oldRow, isCapture, file, row);
			if (found)
				break;
		}
		if (!found)
			throw 'could not find a piece that can execute this move. type="' + type + ' color=' + color + ' moveAGN=' + moveStr;
//		confirm('about to execute ' + moveStr + ' piece type is ' + found.type + ' at ' + found.file + found.row + ' file=' + file + ' row=' + row)
		if (promotion)
			this.promote(found, promotion.toLowerCase().charAt(1), file, row, isCapture);
		else if (isCapture)
			found.capture(file, row);
		else
			found.move(file, row);
		return moveStr;
	}

	Game.prototype.addMoveLink = function(str, noAnim) {
		if (!str || !noAnim) {
			this.boards.push(this.board.slice());
			this.moves.push(moveBucket);
			moveBucket = [];
		}
		if (str) {
			var index = this.moves.length-1,
				link = $('<span>', {'class': (noAnim ? 'pgn-steplink' : 'pgn-movelink')})
				.text(str)
				.data({game: this, index: index, noAnim: noAnim})
				.click(linkMoveClick);
			this.pgnDiv.append(link);
			if (!noAnim)
				this.linkOfIndex[index] = link;
		}
	}

	Game.prototype.addComment = function(str) {
		this.pgnDiv.append($('<span>', {'class': 'pgn-comment'}).text(str));
	}

	Game.prototype.addDescription = function(description) {
		description = $.trim(description);
		var match = description.match(/\[([^"]+)"(.*)"\]/);
		if (match)
			this.descriptions[$.trim(match[1])] = match[2];
	}

	Game.prototype.description = function(pgn) {
		var d = this.descriptions;
		var s =
			d['Name'] || d['שם'] ||
			( (d['Event'] || d['אירוע'] || '') + ': ' + (d['White'] || d[''] || 'לבן') + ' - ' + (d['Black'] || d['שחור'] || '') );
		return s;
	}

	Game.prototype.analyzePgn = function(pgn) {


		function removeHead(match) {
			var ind = pgn.indexOf(match) + match.length;
			pgn = pgn.substring(ind);
			return match;
		}

		function tryMatch(regex) {
			var match = pgn.match(regex);
			if (match)
				removeHead(match[0]);
			return match && match[0];
		}

		var
			match,
			turn;

		while (match = tryMatch(/^\s*\[[^\]]*\]/))
			this.addDescription(match);

		if (this.descriptions['direction']) {
			this.descriptionsDiv.css({direction: this.descriptions['direction']});
			delete this.descriptions['direction'];
		}

		var dar = [];
		$.each(this.descriptions, function(key, val){dar.push(key + ': ' + val);})
		this.descriptionsDiv.html(dar.join('<br />'));

		pgn = pgn.replace(/;(.*)\n/g, ' {$1} ').replace(/\s+/g, ' '); // replace to-end-of-line comments with block comments, remove newlines and noramlize spaces to 1

		this.populateBoard(); //

		var prevLen = -1;
		this.addMoveLink();
		while (pgn.length) {
			if (prevLen == pgn.length)
				throw "analysePgn encountered a problem. pgn is: " + pgn;
			prevLen = pgn.length;
			if (match = tryMatch(/^\s*\{[^\}]*\}/))
				this.addComment(match);
			if (match = tryMatch(/^\s*\([^\)]*\)/))
				this.addComment(match);
			if (match = tryMatch(/^\s*\d+\.+/)) {
				turn = /\.\.\./.test(match) ? BLACK : WHITE;
				this.addMoveLink(match, true);
				continue;
			}
			if (match = tryMatch(/^\s*[^ ]+ ?/)) {
				this.createMove(turn, match);
				this.addMoveLink(match);
				turn = BLACK;
			}
		}
	}

	Game.prototype.populateBoard = function() {
		var p = 'p', game = this;
		$.each(['r','n', 'b', 'q', 'k', 'b', 'n', 'r'], function(file, o) {
			game.createPiece(o, WHITE, file, 0);
			game.createPiece(p, WHITE, file, 1);
			game.createPiece(p, BLACK, file, 6);
			game.createPiece(o, BLACK, file, 7);
		});
	}

	function selectGame() {
		var gameSet = $(this).data('gameSet');
		gameSet.selectGame(this.value);
	}

	function createFlipper(gameSet) {
		var flipper =
			$('<img>', {src: flipImageUrl})
				.css({width: '37px', float:'right', clear: 'right', border: 'solid 1px gray', borderRadius: '4px', backgroundColor: '#ddd'})
				.click(function() {
					gameSet.flip ^= 1;
					var rotation = gameSet.flip ? 'rotate(180deg)' : 'rotate(0deg)';
					$(this).css({
						'-webkit-transform': rotation,
						'-moz-transform': rotation,
						'-ms-transform': rotation,
						'-o-transform': rotation,
						'transform': rotation})
					gameSet.currentGame.drawBoard();
					$(this).closest('table.pgn-table').find('td.pgn-row').each(function() {
						$(this).text(9 - $(this).text())
					})
				});
		return flipper;
	}

	function advanceButton(gameSet) {
		var button = $('<input>', {type: 'button', value: '<'})
			.css({float: 'right', clear: 'right', fontSize: '16px', width: 40})
			.click(function() {
				clearTimer();
				gameSet.currentGame.advance();
			});
		return button;
	}

	function slideShowButton(gameSet) {
		var button = $('<input>', {type: 'button', value: '\u25B6'})
			.css({float: 'right', clear: 'right', fontSize: '16px', width: 40})
			.click(function() {
				clearTimer();
				timer = setInterval(function(){gameSet.currentGame.advance()}, 1000 + anim);
			});
		return button;
	}

	function setWidth() {
		var
			$this = $(this),
			table = $this.closest('table.pgn-table'),
			width = parseInt($this.slider('value'), 10),
			gs = $this.data('gameSet');

		gs.blockSize = width;
		table.attr({width: width * 8 + 70}).css({width: width * 8 + 70});
		table.find('td.pgn-game-square').attr({width: width, height: width}).css({width: width, maxWidth: width, height: width});
		gs.currentGame.drawBoard();
	}

	function buildBoardDiv(container, selector, gameSet) {
		var
			boardTd, pgnTd, descriptionsTd,
			table,
			controlsTd,
			sliderTd,
			cdTd,
			cdTable,
			flipper = createFlipper(gameSet),
			advance = advanceButton(gameSet),
			slideShow = slideShowButton(gameSet),
			buttons = $('<div>').css({maxWidth: 40}).append(advance).append(slideShow),
			slider,
			fileLegend = ['', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', ''];


		slider = $('<div>', {'class': 'pgn-slider'})
			.slider({
				max: 60,
				min: 20,
				orientation: 'vertical',
				value: gameSet.blockSize,
				stop: setWidth
			}).data({gameSet: gameSet});
		table = $('<table>', {'class': 'pgn-table', border: 0, cellpadding: 0, cellspacing: 0}).appendTo(container);
		if (selector)
			table.append($('<tr>').append($('<td>', {colspan: 10, 'class': 'pgn-selector'}).append(selector)));

		table.append($('<tr>').append(cdTd = $('<td>', {colspan: 10})));
		//controlsDiv = $('<div>').css({textAlign: 'right', width: '100%'}).appendTo(controlsTd);
		cdTable = $('<table>').css({width: '100%'}).appendTo(cdTd);
		$('<tr>')
			.appendTo(cdTable)
			.append(descriptionsTd = $('<td>'))
			.append(controlsTd = $('<td>', {'class': 'pgn-controls'}))
			.append(sliderTd = $('<td>', {'vertical-align': 'top'}).append(slider));
		var tr = $('<tr>').appendTo(table);
		for (var i in fileLegend)
			tr.append($('<td>', {'class': 'pgn-legend'}).text(fileLegend[i]));
		var blackSq = {height: 40, width: 40, 'class': 'pgn-game-square pgn-game-square-black'};
		var whiteSq = {height: 40, width: 40, 'class': 'pgn-game-square pgn-game-square-white'};

		for (var i = 0; i < 8; i++) { // create row i: legend, 8
			tr = $('<tr>').appendTo(table);
			tr.append($('<td>', {'class': 'pgn-legend pgn-row'}).text(8 - i));
			for (var file = 0; file < 8; file++) {
				var td = $('<td>', (((i+file)%2) ? blackSq : whiteSq));
				if (!i && !file)
					boardTd = td;
				tr.append(td);
			}
			tr.append($('<td>', {'class': 'pgn-legend pgn-row'}).text(8 - i));
		}
		tr = $('<tr>').appendTo(table);
		for (var i in fileLegend)
			tr.append($('<td>', {'class': 'pgn-legend'}).text(fileLegend[i]));
		table.append($('<tr>').append(pgnTd = $('<td>', {colspan: 10, 'class': 'pgn-pgn-moves'})));
		controlsTd.append(advance).append(slideShow).append(flipper);
		return {boardTd: boardTd, pgnTd: pgnTd, descriptionsTd: descriptionsTd};
	}

	function doIt() {

		$('div.pgn-source-wrapper').each(function() {
			var
				wrapperDiv = $(this),
				pgnSource = $('div.pgn-sourcegame', wrapperDiv),
				boardDiv,
				selector,
				gameSet = new Gameset();

			if (pgnSource.length > 1)
				selector = $('<select>').data({gameSet: gameSet}).change(selectGame);

			var tds = buildBoardDiv(wrapperDiv, selector, gameSet);
			var ind = 0;
			pgnSource.each(function() {
				try {
					var
						pgnDiv = $(this),
						game = new Game(tds, gameSet);
						game.analyzePgn(pgnDiv.text());
						game.gotoBoard(0);
						wrapperDiv.data({currentGame: game});
					ind++;

					gameSet.allGames.push(game);
					if (selector)
						selector.append($('<option>', {value: gameSet.allGames.length - 1, text: game.description()}));
					else
						game.show();
				} catch (e) {
					mw.log('exception in game ' + ind + ' problem is: "' + e + '"');
				}
			});
			if (selector)
				selector.trigger('change');
		})
	}

	function pupulateImages() {
		var
			colors = [WHITE, BLACK],
			allPieces = [],
			types = ['p', 'r', 'n', 'b', 'q', 'k'];
		for (var c in colors) {
			for (var t in types)
				allPieces.push('File:Chess ' + types[t] + colors[c] + 't45.svg');
			allPieces.push('File:Chess ' + colors[c] + '45.svg')
		}
		allPieces.push('File:Chess Board, gray.png');
		allPieces.push('File:Yin and Yang.svg');

		new mw.Api().get(
			{titles: allPieces.join('|'), prop: 'imageinfo', iiprop: 'url'},
			function(data) {
				if (data && data.query) {
					$.each(data.query.pages, function(index, page) {
						var
							url = page.imageinfo[0].url,
							match =
								url.match(/Chess_([prnbqk][dl])t45\.svg/) // piece
								|| url.match(/Chess_([dl])45\.svg/); // empty square
						if (match)
							imageUrl[match[1]] = url;
						else if (/Yin/.test(url))
							flipImageUrl = url;
					});
					doIt();
				}
			}
		);
	}

	if ($('div.pgn-source-wrapper').length) {
		mw.util.addCSS(
			'img.pgn-chessPiece { position: absolute; z-index: 3;}\n' +
			'div.pgn-board-div { position: relative;}\n' +
			'div.pgn-slider { float: right; clear: right; height: 120px;}\n' +
			'table.pgn-table { direction: ltr; width: 360px;}\n' +
			'td.pgn-selector { height: 2em; text-align: center; vertical-aligh: middle;}\n' +
			'td.pgn-controls { height: 2em; text-align: right; vertical-align: top;}\n' +
			'td.pgn-legend { text-align: center; vertical-align: middle;}\n' +
			'td.pgn-game-square { opacity; 0.8; width: 40px; height: 40px; text-align: left; vertical-align: top; padding: 0;}\n' +
			'td.pgn-game-square-black { background-color: #d18b47;}\n' +
			'td.pgn-game-square-white { background-color: #ffce9e;}\n' +
			'div.pgn-pgn-display { padding: 0.5em 2em; }\n' +
			'div.pgn-descriptions { padding: 0.5em 2em;}\n' +
			'span.pgn-movelink { margin: 0 0.3em;}\n' +
			'span.pgn-steplink { margin: 0 0.3em; color: green; font-weight: bold;}\n' +
			'span.pgn-comment { margin: 0 0.3em; color: blue;}\n' +
			'span.pgn-current-move { background-color: yellow;}');
		mw.loader.using(['mediawiki.api', 'jquery.ui.slider'], pupulateImages);
	}
});
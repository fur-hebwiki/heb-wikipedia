/*
this work is placed by its authors in the public domain.
it was created from scratch, and no part of it was copied from elsewhere.
it can be used, copied, modified, redistributed, as-is or modified, 
	whole or in part, without restrictions.
it can be embedded in a copyright protected work, as long as it's clear 
	that the copyright does not apply to the embedded parts themselves.
please do not claim for yourself copyrights for this work or parts of it.
the work comes with no warranty or guarantee, stated or implied, including
	fitness for a particular purpose.
*/
"use strict";
$(function() {
	var
		pieceImageUrl = {},
		flipImageUrl,
		boardImageUrl,
		WHITE = 'l',
		BLACK = 'd',
		acode = 'a'.charCodeAt(0),
		moveBucket = [], // this is a scratch thing, but since we access it from different objects, it's convenient to have it global
		anim = 1000,
		sides = ['n', 'e', 's', 'w'], // used for legends
		brainDamage = $.browser.msie, // do not allow resize, do not use svg images.
		defaultBlockSize = 40,
		timer;

// some global, utility functions.
	function bindex(file, row) { return 8 * file + row; }
	function file(ind) { return Math.floor(ind / 8);}
	function row(ind) { return ind % 8; }
	function sign(a, b) { return a == b ? 0 : (a < b ? 1 : -1); }
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
			blockSize: defaultBlockSize,
			flip: false,
			needRefresh: false,
			allGames: [],
			currentGame: null,
			showDetails:false,

			top: function(row, l) { return (((this.flip ? row : (7 - row)) + (l ? 0.3 : 0)) * this.blockSize + 20) + 'px'; },
			left: function(file, l) { return (((this.flip ? 7 - file : file) + (l ? 0.5 : 0)) * this.blockSize + 20) + 'px'; },
			legendLocation: function(side, num) {
				var n = 0.5 + num;
				switch (side) {
					case 'n':
						return {top: 0, left: this.left(num, true)};
					case 'e':
						return {top: this.top(num, true), left: this.blockSize * 8 + 20};
					case 's':
						return {top: this.blockSize * 8 + 20, left: this.left(num, true)};
					case 'w':
						return {top: this.top(num, true), left: 10};
				}
			},
			relocateLegends: function() {
				for (var si in sides)
					for (var n = 0; n < 8; n++)
						this[sides[si]][n].css(this.legendLocation(sides[si], n));
			},
			selectGame: function(val) {
				if (this.currentGame)
					this.currentGame.toggle(false);
				var game = this.allGames[val];
				if (game) {
					this.currentGame = game;
					game.show();
				}
			},
			drawIfNeedRefresh: function() {
				if (this.needRefresh && this.currentGame)
					this.currentGame.drawBoard();
				this.needRefresh = false;
			},
			setWidth: function(width) {
				this.blockSize = width;
				this.boardImg.css({width: width * 8, height: width * 8});
				this.boardDiv.css('width', 40+(width * 8));
				this.currentGame.drawBoard();
				this.relocateLegends();
				this.needRefresh = true;
			},
			doFlip: function() {
				this.flip ^= 1;
				this.needRefresh = true;
				this.currentGame.drawBoard();
				this.relocateLegends();
			}
		});
	}

	function ChessPiece(type, color, game) {
		this.game = game;
		this.type = type;
		this.color = color;
		this.img = $('<img>', {src: pieceImageUrl[type + color], 'class': 'pgn-chessPiece'})
			.toggle(false)
			.appendTo(game.boardDiv);
	}

	ChessPiece.prototype.appear = function(file, row) {
		this.img.css({top: this.game.gs.top(row), left: this.game.gs.left(file), width: this.game.gs.blockSize})
			.fadeIn(anim);
	}

	ChessPiece.prototype.showMove = function(file, row) {
		var gameSet = this.game.gs;
		this.img.animate({top: gameSet.top(row), left: gameSet.left(file)}, anim, function() { gameSet.drawIfNeedRefresh(); });
	}

	ChessPiece.prototype.disappear = function() { this.img.fadeOut(anim); }

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

	ChessPiece.prototype.remove = function() { this.onBoard = false; }

	ChessPiece.prototype.canMoveTo = function(file, row, capture) {
		if (!this.onBoard)
			return false;
		var rd = Math.abs(this.row - row), fd = Math.abs(this.file - file);
		switch(this.type) {
			case 'n':
				return rd * fd == 2; // how nice that 2 is prime: its only factors are 2 and 1....
			case 'p':
				var dir = this.pawnDirection();
				return (
					((this.row == this.pawnStart() && row ==  this.row + dir * 2 && !fd && this.game.roadIsClear(this.file, file, this.row, row) && !capture)
					|| (this.row + dir == row && fd == !!capture))); // advance 1, and either stay in file and no capture, or move exactly one 
			case 'k':
				return (rd | fd) == 1; // we'll accept 1 and 1 or 1 and 0.
			case 'q':
				return (rd - fd) * rd * fd == 0 && this.game.roadIsClear(this.file, file, this.row, row); // same row, same file or same diagonal.
			case 'r':
				return rd * fd == 0 && this.game.roadIsClear(this.file, file, this.row, row);
			case 'b':
				return rd == fd && this.game.roadIsClear(this.file, file, this.row, row);
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
		tds.boardDiv.append(this.boardDiv = $('<div>', {'class': 'pgn-board-div'}).css({position: 'absolute', top: 0, left: 0}));
		tds.pgnDiv.append(this.pgnDiv = $('<div>', {'class': 'pgn-pgn-display'}));
		tds.descriptionsDiv.append(this.descriptionsDiv = $('<div>', {'class': 'pgn-descriptions'}));
		this.toggle(false);
	}

	Game.prototype.toggle = function(what) {
		this.boardDiv.toggle(what);
		this.pgnDiv.toggle(this.gs.showDetails && what);
		this.descriptionsDiv.toggle(this.gs.showDetails && what);
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

	Game.prototype.wrapAround = function() {
		if (this.index >= this.boards.length - 1)
			this.gotoBoard(0);
	}

	Game.prototype.kingSideCastle = function(color) {
		var king = this.piecesByTypeCol['k'][color][0];
		var rook = this.pieceAt(7, (color == WHITE ? 0 : 7));
		if (!rook || rook.type != 'r')
			throw 'attempt to castle without rook on appropriate square';
		king.move(fileOfStr('g'), king.row);
		rook.move(fileOfStr('f'), rook.row);
	}

	Game.prototype.queenSideCastle = function(color) {
		var king = this.piecesByTypeCol['k'][color][0];
		var rook = this.pieceAt(0, (color == WHITE ? 0 : 7));
		if (!rook || rook.type != 'r')
			throw 'attempt to castle without rook on appropriate square';
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

		var type = match[1] ? match[1].toLowerCase() : 'p',
			oldFile = fileOfStr(match[2]),
			oldRow = rowOfStr(match[3]),
			isCapture = !!match[4],
			file = fileOfStr(match[5]),
			row = rowOfStr(match[6]),
			promotion = match[7],
			thePiece = $(this.piecesByTypeCol[type][color]).filter(function() { 
					return this.matches(oldFile, oldRow, isCapture, file, row); 
				});
		if (thePiece.length != 1)
			throw 'could not find matching pieces. type="' + type + ' color=' + color + ' moveAGN="' + moveStr + '". found ' + thePiece.length + ' matching pieces';
		else
			thePiece = thePiece[0];
		if (promotion)
			this.promote(thePiece, promotion.toLowerCase().charAt(1), file, row, isCapture);
		else if (isCapture)
			thePiece.capture(file, row);
		else
			thePiece.move(file, row);
		return moveStr;
	}

	Game.prototype.addMoveLink = function(str, noAnim) {
		if (!str || !noAnim) {
			this.boards.push(this.board.slice());
			this.moves.push(moveBucket);
			moveBucket = [];
		}
		if (str) {
			str = str.replace(/-/g, '\u2011'); // replace hyphens with non-breakable hyphens, to avoid linebreak within O-O or 1-0
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

		var rtl = this.descriptions['Direction'] == 'rtl';
		delete this.descriptions['Direction'];
		this.descriptionsDiv.css({direction: rtl ? 'rtl' : 'ltr', textAlign: rtl ? 'right' : 'left' });

		var dar = $.map(this.descriptions, function(val, key) { return key + ': ' + val; });
		this.descriptionsDiv.html(dar.join('<br />'));

		pgn = pgn.replace(/;(.*)\n/g, ' {$1} ').replace(/\s+/g, ' '); // replace to-end-of-line comments with block comments, remove newlines and noramlize spaces to 1
		this.populateBoard(this.descriptions.FEN || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'); 
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

	Game.prototype.populateBoard = function(fen) {
		var fenar = fen.split(/[\/\s]/);
		if (fenar.length < 8)
		throw 'illegal fen: "' + fen + '"';
		for (var row = 0; row < 8; row++) {
			var file = 0;
			var filear = fenar[row].split('');
			for (var i in filear) {
				var p = filear[i], lp = p.toLowerCase();
				if (/[1-8]/.test(p))
					file += parseInt(p, 10);
				else if (/[prnbkq]/.test(lp))
					this.createPiece(lp, (p == lp ? BLACK : WHITE), file++, 7-row)
				else
					throw 'illegal fen: "' + fen + '"';
			}
		}
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
					gameSet.doFlip();
					var rotation = gameSet.flip ? 'rotate(180deg)' : 'rotate(0deg)';
					$(this).css({
						'-webkit-transform': rotation,
						'-moz-transform': rotation,
						'-ms-transform': rotation,
						'-o-transform': rotation,
						'transform': rotation});
				});
		return flipper;
	}

	function advanceButton(gameSet) {
		var button = $('<input>', {type: 'button', value: '<'})
			.css({float: 'right', clear: 'right', fontSize: '16px', width: 40})
			.click(function() {
				gameSet.currentGame.wrapAround();
				clearTimer();
				gameSet.currentGame.advance();
			});
		return button;
	}

	function slideShowButton(gameSet) {
		var button = $('<input>', {type: 'button', value: '\u25B6'})
			.css({float: 'right', clear: 'right', fontSize: '16px', width: 40})
			.click(function() {
				gameSet.currentGame.wrapAround();
				clearTimer();
				timer = setInterval(function(){gameSet.currentGame.advance()}, 1000 + anim);
			});
		return button;
	}

	function setWidth(width, $this) { $this.data('gameSet').setWidth(width); }

	function buildBoardDiv(container, selector, gameSet) {
		var
			pgnDiv, 
			descriptionsDiv,
			gameSetDiv,
			controlsDiv,
			scrollDiv,
			cdTable,
			flipper = createFlipper(gameSet),
			advance = advanceButton(gameSet),
			slideShow = slideShowButton(gameSet),
			buttons = $('<div>').css({maxWidth: 40}).append(advance).append(slideShow),
			slider;

		if (!brainDamage)
			slider = $('<div>', {'class': 'pgn-slider'})
				.slider({
					max: 60,
					min: 20,
					orientation: 'vertical',
					value: gameSet.blockSize,
					stop: function() {
						var $this = $(this),
							newWidth = parseInt($this.slider('value'), 10);
						setWidth(newWidth, $this);
					}
				}).data({gameSet: gameSet});

		gameSetDiv = $('<div>', {'class': 'pgn-gameset-div'})
			.css({width: 40 + 8 * gameSet.blockSize})
			.appendTo(container);
		if (selector)
			gameSetDiv.append(selector);

		$(gameSetDiv)
			.append(scrollDiv = $('<div>', {'valign': 'top'}).append(slider || '').css({'float':'right', 'display':'none'}))
			.append(controlsDiv = $('<div>', {'class': 'pgn-controls'}).css({'float':'right', 'display':'none'}))
			.append($('<div>',{ text: mw.msg('showtoc') }).button().click(function(){
				$(this).hide()
				gameSet.showDetails=true;
				gameSet.currentGame.toggle(true);
				controlsDiv.show();
				scrollDiv.show();
			}))
			.append(descriptionsDiv = $('<div>'))
		controlsDiv.append(advance).append(slideShow).append(flipper);
		gameSet.boardDiv = $('<div>', {'class': 'pgn-board-div'}).appendTo(gameSetDiv);
		pgnDiv = $('<div>', {'class': 'pgn-pgn-display'}).appendTo(gameSetDiv);
		gameSet.boardImg = $('<img>', {'class': 'pgn-board-img', src: boardImageUrl})
			.css({padding: 20, width: gameSet.blockSize * 8, height: gameSet.blockSize * 8})
			.appendTo(gameSet.boardDiv);
		var fl = 'abcdefgh';

		for (var side in sides) {
			var s = sides[side],
				isFile = /n|s/.test(s);
			gameSet[s] = [];
			for (var i = 0; i < 8; i++) {
				var sp = $('<span>', {'class': isFile ? 'pgn-file-legend' : 'pgn-row-legend'})
					.text(isFile ? fl.charAt(i) : (i + 1))
					.appendTo(gameSet.boardDiv)
					.css(gameSet.legendLocation(s, i));
				gameSet[s][i] = sp;
			}
		}
		return {boardDiv: gameSet.boardDiv, pgnDiv: pgnDiv, descriptionsDiv: descriptionsDiv};
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
						game.linkOfIndex[game.boards.length - 1].trigger('click');
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
			gameSet.selectGame(0);
		})
	}

	function pupulateImages() {
		var
			colors = [WHITE, BLACK],
			allPieces = [],
			types = ['p', 'r', 'n', 'b', 'q', 'k'];
		for (var c in colors)
			for (var t in types)
				allPieces.push('File:Chess ' + types[t] + colors[c] + 't45.svg');
		allPieces.push('File:Yin and Yang.svg');
		if (!brainDamage)
			allPieces.push('File:Chessboard480.png');
		var params = {titles: allPieces.join('|'), prop: 'imageinfo', iiprop: 'url'};
		if (brainDamage)
			params.iiurlwidth = defaultBlockSize;
		var api = new mw.Api();
		api.get(
			params,
			function(data) {
				if (data && data.query) {
					$.each(data.query.pages, function(index, page) {
						var
							url = page.imageinfo[0][brainDamage ? 'thumburl' : 'url'],
							match = url.match(/Chess_([prnbqk][dl])t45\.svg/); // piece
						if (match)
							pieceImageUrl[match[1]] = url;
						else if (/Yin/.test(url))
							flipImageUrl = url;
						else if (/Chessboard/.test(url))
							boardImageUrl = url;
					});
					if (brainDamage) {
						delete params.iiurlwidth;
						params.titles = 'File:Chessboard480.png';
						api.get(params,
							function(data) {
								if (data && data.query) {
									$.each(data.query.pages, function(index, page) {boardImageUrl = page.imageinfo[0].url});
									doIt();
								}
							}
						);
					}
					else
						doIt();
				}
			}
		);
	}

	if ($('div.pgn-source-wrapper').length)
		mw.loader.using(['mediawiki.api', 'jquery.ui.slider'], pupulateImages);
});

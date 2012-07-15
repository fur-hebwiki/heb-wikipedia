"use strict";
$(function() {
	var
		div,
		blockSize = 30,
		imageUrl = {},
		boardImageUrl,
		anim = 'slow',
		WHITE = 'l',
		BLACK = 'd',
		flip = false,
		acode = 'a'.charCodeAt(0),
		allGames =[];

	function bindex(file, row) { return 8 * file + row; }
	function top(row) { return ((flip ? row : (7 - row)) * blockSize) + 'px'; }
	function left(file) { return ((flip ? 7 - file : file) * blockSize) + 'px'; }
	function row(ind) { return ind % 8; }
	function file(ind) { return Math.floor(ind / 8);}
	function sign(a, b) { return a == b ? 0 : (a < b ? 1 : -1); }
	function colorDiff(a, b) {return (a == BLACK) - (b == BLACK);}
	
	function fileOfStr(file) { return file && file.charCodeAt(0) - acode;}
	function rowOfStr(row) { return row && (row - 1);}

	function linkMoveClick(e) {
		var
			$this = $(this),
			game = $this.data('game'), 
			moveIndex = $this.data('moveIndex'), 
			boardIndex = $this.data('boardIndex'),
			noAnim = $this.data('noAnim');
		if (noAnim)
			game.gotoBoard(moveIndex, boardIndex);
		else
			game.showMoveTo(moveIndex, boardIndex);
	}
	
	function ChessPiece(type, color, game) {
		this.game = game;
		this.type = type;
		this.color = color;
		this.img = $('<img>', {src: imageUrl[type + color], 'class': 'pgn-chessPiece'})
			.fadeOut(0)
			.appendTo(game.div);
	}

	ChessPiece.prototype.appear = function(file, row, func) {
		this.img.css({top: top(row), left: left(file), width: blockSize + 'px'})
			.fadeIn(anim, func);
	}

	ChessPiece.prototype.showMove = function(file, row, func) {
		this.img.animate({top: top(row), left: left(file)}, anim, func);
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
				if (rd + fd == 3 && rd * fd == 2) // no need to test if target is occupied.
					return this;
				else return false;
			case 'p':
				var occupied = !!this.game.pieceAt(file, row);
				if ((this.row == this.pawnStart() && row ==  this.row + this.pawnDirection() * 2 && fd == 0 && !occupied)
					|| (this.row + this.pawnDirection() == row && fd == 1 && capture) // do not test "occupied" - can be en passant
					|| (this.row + this.pawnDirection() == row && !fd && !occupied))
					return this;
				else return false;
			case 'k':
				if (rd < 2 && fd < 2)
					return this
				else return false;
			case 'q':
				if (! ((rd - fd) * rd * fd) // either equal or one of them is 0. 
					&& this.game.roadIsClear(this.file, file, this.row, row))
					return this;
				else return false;
					
			case 'r':
				if (!(rd * fd) && this.game.roadIsClear(this.file, file, this.row, row))
					return this;
				else return false;
					
			case 'b':
				if ((rd == fd) && this.game.roadIsClear(this.file, file, this.row, row))
					return this;
				else return false;
		}
	}
	
	ChessPiece.prototype.matches = function(oldFile, oldRow, isCapture, file, row) {
		if (oldFile != undefined && oldFile != this.file)
			return false;
		if (oldRow != undefined && oldRow != this.row)
			return false;
		return this.canMoveTo(file, row, isCapture);
	}

	ChessPiece.prototype.showAction = function(move, func) {
		switch (move.what) {
			case 'a': 
				this.appear(move.file, move.row, func);
				break;
			case 'm':
				this.showMove(move.file, move.row, func);
				break;
			case 'r':
				this.disappear();
				if (typeof func == 'function')
					func();
				break;
		}
	}
	
	function Game(div) {
		$.extend(this, {board: [],
			stages: [],
			pieces: [],
			moves: [],
			boards: [],
			piecesByTypeCol: {},
			descriptions: {},
			boardsByColor: {WHITE: [], BLACK: []},
			div: div});
		this.pgnDisplay = $('<div>', {'class': 'pgn-pgnDisplay'}).appendTo(div);
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
		if (move.what == 'n') {
			this.moveIndex = this.moves.length;
			this.moves.push([]);
			this.boardIndex = this.boards.length;
			this.boards.push(this.board.slice());
		}
		else 
			this.moves[this.moveIndex].push(move);
	}
	
	Game.prototype.gotoBoard = function(moveIndex, boardIndex) {
		this.board = this.boards[boardIndex];
		this.moveIndex = moveIndex;
		this.drawBoard();
	}
	
	Game.prototype.showMoveTo = function(moveIndex, boardIndex) {
		var 
			animationMoves = [];
		
		function animate() {
			var move = animationMoves.shift();
			if (move) 
				move.piece.showAction(move, animate);
		}
		
		var direction = sign(this.moveIndex, moveIndex);
		if (direction >= 0 && Math.abs(moveIndex - this.moveIndex) < 4) {
			for (var safety = 0; safety < 10; safety++) {
				var moves = this.getNextMove(direction);
				if (moves)
					animationMoves = animationMoves.concat(moves);
				if (this.moveIndex == moveIndex)
					break;
			}
			animate();
		} else 
			this.gotoBoard(moveIndex, boardIndex);
	}
	
	Game.prototype.getNextMove = function(direction) {
		this.moveIndex += direction;
		return this.moves[this.moveIndex];
	}
	
	Game.prototype.drawBoard = function() {
		var saveAnim = anim;
		anim = 0;
		for (var i in this.pieces)
			this.pieces[i].disappear();
		for (var i in this.board) 
			this.board[i].appear(file(i), row(i));
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
		king.move(fileOfStr('b'), king.row);
		rook.move(fileOfStr('c'), rook.row);
	}
	
	Game.prototype.promote = function(piece, type, file, row) {
		this.clearPieceAt(piece.file, piece.row);
		var newPiece = this.createPiece(type, piece.color, file, row);
		this.registerMove({what:'a', piece: piece, file: file, row: row})
	}
	
	Game.prototype.createPiece = function(type, color, file, row) {
		var piece = new ChessPiece(type, color, this);
		this.pieceAt(file, row, piece);
		this.addPieceToDicts(piece);
		return piece;
	}
	
	Game.prototype.createMove = function(color, moveStr) {
		moveStr = moveStr.replace(/[!?+# ]*(\$\d{1,3})?$/, ''); // check, mate, comments, glyphs.
		if (!moveStr.length)
			return false;
		if (moveStr == 'O-O') 
			return this.kingSideCastle(color);
		if (moveStr == 'O-O-O') 
			return this.queensideCastle(color);
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
		var isPromotion = match[7];
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
		if (isPromotion)
			this.promote(found, promotion.charAt(1), file, row);
		else if (isCapture)
			found.capture(file, row);
		else
			found.move(file, row);
		return moveStr;
	}

	Game.prototype.addMoveLink = function(str, noAnim) {
		var link = $('<span>', {'class': 'pgn-movelink'})
			.text(str)
			.data({game: this, moveIndex: this.moves.length-1, boardIndex: this.boards.length - 1, noAnim: noAnim})
			.click(linkMoveClick);
		this.pgnDisplay.append(link);
	}
	
	Game.prototype.addComment = function(str) {
		this.pgnDisplay.append($('<span>', {'class': 'pgn-comment'}).text(str));
	}
	
	Game.prototype.addDescription = function(description) {
		var match = description.match(/ /);
		if (match)
			this.descriptions[match[1]] = match[2];
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
		
		pgn = pgn.replace(/;(.*)\n/g, ' {$1} ').replace(/\s+/g, ' '); // replace to-end-of-line comments with block comments, remove newlines and noramlize spaces to 1
		
		var prevLen = -1;
		this.registerMove({what: 'n'});
		while (pgn.length) {
			if (prevLen == pgn.length)
				throw "analysePgn encountered a problem. pgn is: " + pgn;
			if (match = tryMatch(/^\s*\d+\.+/)) {
				turn = WHITE;
				this.addMoveLink(match, true)
			}
			if (match = tryMatch(/^\s*\{[^\}]*\}/))
				this.addComment(match);
			if (match = tryMatch(/^\s*\d+\.{3}/)) {
				// this.registerMove({what: 'c', c: BLACK});
				this.addMoveLink(match);
			}
			if (match = tryMatch(/^\s*[^ ]+ /)) {
				this.createMove(turn, match);
				this.addMoveLink(match);
				this.registerMove({what: 'n'});
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
		var selector = $(this),
			wrapper = selector.closest('div.pgn-source-wrapper'),
			currentGame = wrapper.data('currentGame');
		currentGame.hide();
		game.show();
		wrapper.data('currentGame', game);
	}
	
	function buildBoardDiv(container) {
		var 
			boardDiv = $('<div>', {'class': 'pgn-board-div'}).appendTo(container),
			boardImage = $('<img>', {src: boardImageUrl, 'class': 'pgn-board-image'})
				.css({width: (blockSize * 8) + 'px'})
				.appendTo(boardDiv);
		return boardDiv;
	}
	
	function doIt() {
		var selector;
		
		$('div.pgn-source-wrapper').each(function() {
			var 
				wrapperDiv = $(this),
				pgnSource = $('div.pgn-sourcegame', wrapperDiv),
				boardDiv = buildBoardDiv(wrapperDiv);
										 
			if (pgnSource.length > 1) 
				var selector = $('<select>')
				.change(selectGame)
				.insertBefore(boardDiv);
			
			pgnSource.each(function() {
				var
					pgnDiv = $(this),
					game = new Game(boardDiv);
					game.populateBoard(); // later use FEN, maybe
					game.analyzePgn(pgnDiv.text());
				if (selector) 
					selector.append($('<option>', {value: game, text:game.description()}));
			})
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
						else if (/Board/.test(url))
							boardImageUrl = url;
					});
					doIt();
				}
			}
		);
	}

	if ($('div.pgn-source-wrapper').length) {
		mw.util.addCSS('img.pgn-chessPiece {position: absolute; zIndex: 3;}\n' + 
			'div.pgn-board-div {direction: ltr; position: relative;}\n' +
			'span.pgn-movelink {margin: 0 0.5em;}');
		mw.loader.using('mediawiki.api', pupulateImages);
	}

});
"use strict";
(function() {
	var
		div,
		blockSize,
		imageUrl = {},
		anim = 0,
		dummy = {remove: function(){}};

	function bindex(file, row) { return 8 * file + row; }
	function top(row) { return ((8-row) * blocksize) + 'px'; }
	function left(file) { return (file * blockSize) + 'px'; }
	function row(ind) { return ind % 8; }
	function file(ind) { return Math.floor(ind / 8);}
	function sign(a, b) { return a == b ? 0 : (a < b ? 1 : -1); }

	function ChessPiece(type, color, game) {
		this.game = game;
		this.type = type;
		this.color = color;
		this.img = $('<img>', {src: imageUrl[type + color], 'class': 'pgn-chessPiece pgn-hidden'})
			.appendTo(game.div);
		game.addPieceToDicts(this);
	}

	ChessPiece.prototype.appear = function(file, row) {
		this.img.css({top: calcTop(row), left: calcLeft(file), width: blockSize + 'px', display: 'inherit'});
		this.img.removeClass('pgn-hidden');
		this.img.fadeIn(anim);
	}

	ChessPiece.prototype.showMove = function(file, row) {
		this.img.animae({top: calcTop(row), left: calcLeft(file)}, anim);
		this.img.fadeIn(anim);
	}

	ChessPiece.prototype.disappear = function() {
		this.img.fadeIn(anim);
	}
	
	ChessPiece.prototype.setSquare = function(file, row) {
		this.file = file;
		this.row = row;
		this.onBoard = true;
	}

	ChessPiece.prototype.capture = function(file, row) {
		if (this.type == 'p' && !this.game.pieceAt(file, row) && this.game.pieceAt(file, row + this.pawnDirection()).type == 'p') { // en passant
			var captureRow = row - this.pawnDirection();
			this.game.clearPieceAt(file, captureRow);
		} 
		else
			this.game.clearPieceAt(file, row);
		this.move(file, row);
	}
	
	ChessPiece.prototype.move = function(file, row) {
		this.file = file; 
		this.row = row;
		this.game.pieceAt(file, fow, this); // place it on the board)
		this.onBoard = true;
		this.game.registerMove({what:'m', piece:this, file: file, row: row})
	}

	ChessPiece.prototype.pawnDirection = function () { return this.color == 'd' ? 1 : -1; }
	ChessPiece.prototype.pawnStart = function() { return this.color == 'd' ? 2 : 7; }

	ChessPiece.prototype.remove = function(clearBoard) {
		this.onBoard = false;
	}

	ChessPiece.prototype.canMoveTo = function(file, row) {
		if (!this.onBoard)
			return false;
		var rd = Math.abs(this.row - row), fd = Math.abs(this.file = file);
		switch(type) {
			case 'n':
				return (rb + fd == 3 && rd * fd == 2) // no need to test if target is occupied.
						? this
						: false;
			case 'p':
				var occupied = !!board[file][row];
				return
					((this.row == this.pawnStart() && row ==  this.row + this.pawnDirection() * 2 && this.file == file && !occupied)
					|| (this.row + this.pawnDirection() == row && fd == 1) // do not test "occupied" - can be en passant
					|| (this.row + this.pawnDirection() == row && !fd && !occupied))
						? this
						: false;
			case 'k':
				return (rd < 2 && fd < 2)
						? this
						: false;
			case 'q':
				return
					(! ((rd - fd) * rd * fd) // either equal or one of them is 0. 
					&& roadIsClear(this.file, file, this.row, row))
						? this
						: false;
					
			case 'r':
				return
					()!(rd * fd) && roadIsClear(this.file, file, this.row, row))
						? this
						: false;
					
			case 'b':
				return
					(rd == fd
					&& roadIsClear(this.file, file, this.row, row))
						? this
						: false;
		}
	}
	
	ChessPiece.prototype.matches = function(oldFile, oldRow, file, row) {
		if (oldFile && oldFile != this.file)
			return false;
		if (oldRow && oldRow != this.row)
			return false;
		return this.canMove(file, row);
	}

	ChessPiece.prototype.executeMove = function(move) {
		switch (move.type) {
			case 'a': 
				this.appear(move.file, move.row);
				break;
			case 'm':
				this.showMove(move.file, move.row);
				break;
			case 'r':
				this.disapear();
				break;
		}
	}
	
	function Game(currentMove) {
		this.board = [],
		this.stages = [],
		this.currentMove = currentMove || 0,
		this.pieces = [],
		this.piecesByTypeCol = {},
		this.boardsByColor = {'d': [], 'l': []};
	}
	
	Game.prototye.copyBoard = function() { return this.board.slice(); }
	
	Game.prototye.pieceAt = function(file, row, piece) {
		int i = bindex(file, row);
		if (piece) {
			this.board[i] = piece;
			piece.setSquare(file, row);
		}
		return this.board[i];
	};

	Game.prototye.clearPieceAt = function(file, row) {
		var 
			i = bindex(file, row),
			piece = this.pieceAt(file, row);
		if (piece)
			piece.remove();
		delete this.board[i];
		this.registerMove({what:'r', piece:this, file: file, row: row})
	}
	
	Game.prototye.roadIsClear = function(file1, file2, row1, row2) {
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
				throw ('something is wrong in function roadIsClear.' + 
					' file=' + file + ' file1=' + file1 + ' file2=' + file2 + 
					' row=' + row + ' row1=' + row1 + ' row2=' + row2 + 
					' dfile=' + dfile + ' drow=' + drow);
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
		this.registerMove({what:'a', piece:piece, file: piece.file, row: piece.row})
		
	}
	
	game.prototype.registerMove = function(move) {
		if (moveDescription.type == 'n') {
			var rec = {d: [], l: []};
			this.moves.push(rec);
			this.currentMove = this.movesIndex[number] = this.moves.length - 1;
			this.boards.push(this.board.slice());
			this.boardsIndex[number] = this.boards.lenght - 1;
		}
		else if (move.type == 'c') // a marker for color
			this.boardsByColor[move.c][this.currentMove].push(this.boards.length - 1);
		else 
			this.moves[this.currentMove][move.piece.color].push(move);
	}
	
	game.prototype.executeMove(index, color) {
		colorDiff = color != this.currentColor;
		if (Math.abs(index - currentIndex) + colorDiff < 3) {
			direction = sign(index - this.currentIndex) || colorDiff;
			var moves = getNextMove(direction);
			for (var i = 0; i < moves.length) {
				var move = moves[i];
				move.piece.executeMove(move);
			}
		} else drawBoard(index, color);
		currentIndex = index;
		currentColor = culor;
	}
	
	Game.prototype.drawBoard = function(index, color) {
		var board = this.boardsByColor[color][index];
		for (var i in pieces)
			pieces[i].remove;
		for (var i in board) {
			var file = 
			pieceAt()
		}
	}

	Game.prototype.kingSideCastel = function(color) {
		var king = this.piecesByTypeCol['k'][color][0];
		var rook = this.piecesByTypeCol['r'][color][1];
		king.move('g');
		rook.move('f');
	}
	
	Game.prototype.queenSideCastel = function(color) {
		var king = this.piecesByTypeCol['k'][color][0];
		var rook = this.piecesByTypeCol['r'][color][0];
		king.move('b');
		rook.move('c');	
	}
	
	Game.prototype.promote = function(piece, type, file, row) {
		piece.remove();
		var piece = ChessPiece(type, piece.color, this);
		this.pieceAt(file, row, piece);
		this.Regi
	}
	
	Game.prototype.createMove = function(color, moveStr) {
		moveStr = moveStr.replace(/[!?+# ]*(\$\d{1,3})?$/, ''); // check, mate, comments, glyphs.
		if (!moveStr.length)
			return;
		if (moveStr == 'O-O')
			return this.kingSideCastle(color);
		if (moveStr == 'O-O-O')
			return this.queensideCastle(color);
		if ($.inArray(moveStr, ['1-0', '0-1', '1/2-1/2', '*']) + 1)
			return; // end of game - white wins, black wins, draw, game halted/abandoned/unknown.
		var match = moveStr.match(/([RNBKQ])?([a-h])?([1-8])?(x)?([a-h])([1-8])(=[RNBKQ])?/);
		if (!match) {
			alert('bad move! "' + move + '"');
			return;
		}
		
		var type = match[1] ? match[1].toLowerCase() : 'p';
		var oldFile = match[2];
		var oldRow = match[3];
		var isCapture = !!match[4];
		var file = match[5];
		var row = match[6];
		var promotion = match[7];
		var candidates = this.piecesByTypeCol[type, color];
		if (!candidates || !candidates.length)
			throw('could not find matching pieces. type="' + type + ' color=' + color + ' moveAGN=' + move);
		var found = false;
		for (var c in candidates)
			found = found || candidates[c].matches(oldFile, oldRow, file, row);
		if (!found)
			throw('could not find a piece that can execute this move. type="' + type + ' color=' + color + ' moveAGN=' + move);
		if (promotion)
			this.promote(found, promotion, file, row);
		else if (isCapture)
			found.capture(file, row);
		else
			found.move(file, row);
		this.
	}

	function analyzePgn() {
		var moveSequences = getMoveSequences();
		stages.push(copyBoard());
		while (moveSequences.length) {
			var move = moveSequences.shift();
			if (executeMove('d', move[0]))
				stages.push(copyBoard());
			if (move.length > 1 && executeMove('l', move[1]))
				stages.push(copyBoard());
		}
	}

	Game.prototype.populateBoard = function() {
		div = $('<div>');
		var officers = ['r','n', 'b', 'q', 'k', 'b', 'n', 'r'];
		for (var file = 0; file < 8; file++) {
			var o = officers[file];
			pieceAt(file, 1, new ChessPiece(o, 'd'));
			pieceAt(file, 2, new ChessPiece('p', 'd'));
			pieceAt(file, 7, new ChessPiece('p', 'l');
			pieceAt(file, 8, new ChessPiece(o, 'l');
		}
	}


	function pupulateImages() {
		var
			allPieposition: 'absolute', zIndex: 3, ces = [],
			colors = ['d', 'l'],
			types = ['p', 'r', 'n', 'b', 'q', 'k'];
		for (var c in colors)
			for (var t in types)
				allPieces.push('File:Chess ' + types[t] + colors[c] + 't45.svg');
		new mw.Api().get(
			{titles: allPieces.join('|'), prop: 'imageinfo', iiprop: 'url'},
			function(data) {
				if (data && data.query) {
					$.each(data.query.pages, function(index, page) {
						var url = page.imageinfo[0].url;
						var match = url.match(/Chess_([prnbqk][dl])t45\.svg/);
						if (match)
							imageUrl[match[1]] = url;
					});
					doit();
				}
			}
		);
	}

	mw.util.addCSS('img.pgn-chessPiece {position: absolute; zIndex: 3;}');
	mw.loader.using('mediawiki.api', pupulateImages);
})();
"use strict";
(function() {
	var
		board = [],
		stages = [],
		currentMove = 0,
		pgn,
		div,
		blockSize,
		black,
		imageUrl = {},
		pieces = [],
		piecesByTypeCol = {},
		anim = 0,
		dummy = {remove: function(){}};

	function bindex(file, row) { return 8 * file + row; }
	function top(row) { return ((8-row) * blocksize) + 'px'; }
	function left(file) { return (file * blockSize) + 'px'; }
	function row(ind) { return ind % 8; }
	function file(ind) { return Math.floor(ind / 8);}
	function copyBoard() { return board.slice(); }
	function sign(a, b) { return a == b ? 0 : (a < b ? 1 : -1); }

	function pieceAt(file, row, piece) {
		int i = bindex(file, row);
		if (piece) {
			board[i] = piece;
			piece.setSquare(file, row);
		}
		return board[i];
	};


	function clearPieceAt(file, row) {
		var i = bindex(file, row);
		(board[i] || dummy).remove();
		delete board[i];
	}
	
	
	function roadIsClear(file1, file2, row1, row2) {
		var file, row, dfile, drow, moves = 0;
		dfile = sign(file1, file2);
		drow = sign(row1, row2);
		var file = file1, row = row1;
		while (true) {
			file += dfile;
			row += drow;
			if (file == file2 && row == row2)
				return true;
			if (pieceAt(file, row))
				return false;
			if (moves++ > 10)
				throw ('something is wrong in function roadIsClear.' + 
					' file=' + file + ' file1=' + file1 + ' file2=' + file2 + 
					' row=' + row + ' row1=' + row1 + ' row2=' + row2 + 
					' dfile=' + dfile + ' drow=' + drow);
		}
	}

	function ChessPiece(type, color) {
		this.type = type;
		this.color = color;
		this.img = $('<img>', {src: imageUrl(type, color), 'class': 'pgn-chessPiece'})
			.css({display: 'none'})
			.appendTo(div);
		this.addPieceToDicts();
	}

	ChessPiece.prototype.addPieceToDicts() {
		pieces.push(this);
		var byType = piecesByTypeCol[this.type];
		if (! byType)
			byType = piecesByTypeCol[this.type] = {};
		var byTypeCol = byType[this.color];
		if (!byTypeCol)
			byTypeCol = byType[this.color] = [];
		byTypeCol.push(this);
	}
	
	ChessPiece.prototype.repaint() {
		if (this.onBoard)
			this.img.css({top: calcTop(this.row), left: calcLeft(this.file), width: blockSize + 'px', display: 'inherit'});
	}

	ChessPiece.prototype.setSquare = function(file, row) {
		this.file = file;
		this.row = row;
		this.onBoard = true;
	}

	ChessPiece.prototype.capture = function(file, row) {
		if (this.type == 'p' && !pieceAt(file, row) && pieceAt(file, row + this.pawnDirection()).type == 'p') { // en passant
			var captureRow = row - this.pawnDirection();
			clearPieceAt(file, captureRow);
		} 
		else
			clearPieceAt(file, row);
		this.move(file, row);
	}
	
	ChessPiece.prototype.move = function(file, row) {
		this.file = file; 
		this.row = row;
		pieceAt(file, fow, this); // place it on the board)
		this.onBoard = true;
		this.img.animate({top: calcTop(this.row), left: calcLeft(this.file)}, anim);
	}

	ChessPiece.prototype.pawnDirection = function () { return this.color == 'd' ? 1 : -1; }
	ChessPiece.prototype.pawnStart = function() { return this.color == 'd' ? 2 : 7; }

	ChessPiece.prototype.remove = function(clearBoard) {
		this.onBoard = false;
		this.img.fadeOut(anim);
	}

	ChessPiece.prototype.canMoveTo = function(file, row) {
		if (!this.onBoard)
			return false;
		var rd = Math.abs(this.row - row), fd = Math.abs(this.file = file);
		switch(type) {
			case 'n':
				return rb + fd == 3 && rd * fd == 2; // no need to test if target is occupied.
			case 'p':
				var occupied = !!board[file][row];
				return
					(this.row == this.pawnStart() && row ==  this.row + this.pawnDirection() * 2 && this.file == file && !occupied)
					|| (this.row + this.pawnDirection() == row && fd == 1) // do not test "occupied" - can be en passant
					|| (this.row + this.pawnDirection() == row && !fd && !occupied)
			case 'k':
				return rd < 2 && fd < 2;
			case 'q':
				return
					! ((rd - fd) * rd * fd) // either equal or one of them is 0. 
					&& roadIsClear(this.file, file, this.row, row);
			case 'r':
				return
					!(rd * fd) && roadIsClear(this.file, file, this.row, row);
			case 'b':
				return
					rd == fd
					&& roadIsClear(this.file, file, this.row, row);
		}
	}

	function drawBoard() {
	}

	function kingSideCastel(color) {
		var king = piecesByTypeCol['k'][color][0];
		var rook = piecesByTypeCol['r'][color][1];
		king.move('g');
		rook.move('f');
	}
	
	function queenSideCastel(color) {
		var king = piecesByTypeCol['k'][color][0];
		var rook = piecesByTypeCol['r'][color][0];
		king.move('b');
		rook.move('c');	
	}
	
	function promote(piece, type, file, row) {
		piece.remove();
		new ChessPiece(type, piece.color).place
	}
	
	function executeMove(color, move) {
		move = move.replace(/[!?+# ]*(\$\d{1,3})?$/, ''); // check, mate, comments, glyphs.
		if (!move.length)
			return;
		if (move == 'O-O')
			return kingSideCastle(color);
		if (move == 'O-O-O')
			return queensideCastle(color);
		if ($.inArray(move, ['1-0', '0-1', '1/2-1/2', '*']) + 1)
			return; // end of game - white wins, black wins, draw, game halted/abandoned/unknown.
		var match = move.match(/([RNBKQ])?([a-h])?([1-8])?(x)?([a-h])([1-8])(=[RNBKQ])?/);
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
		var candidates = piecesByTypeCol[type, color];
		if (!candidates || !candidates.length)
			throw('could not find matching pieces. type="' + type + ' color=' + color + ' moveAGN=' + move);
		var found = false;
		for (var c in candidates)
			found = found || candidates[c].matches(oldFile, oldRow, file, row);
		if (!found)
			throw('could not find a piece that can execute this move. type="' + type + ' color=' + color + ' moveAGN=' + move);
		if (promotion)
			promote(found, promotion, file, row);
		else if (isCapture)
			found.capture(file, row);
		else
			found.move(file, row);
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

	function populateBoard() {
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

	function displayCurrentBoard() {
		for (var i in pieces)
			pieces[i].remove();
		for (var i in board)
			board[i].
	}

	function doit() {
		populateBoard();
		analyzePgn();
		board = stages[currentMove].slice(0, stages[currentMove].length);
		displayCurrentBoard();
		displayControls();
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
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
		dummy = {remove: function(){}};

	function bindex(file, row) { return 8 * file + row; }
	function top(row) { return ((8-row) * blocksize) + 'px'; }
	function left(file) { return (file * blockSize) + 'px'; }
	function row(ind) { return ind % 8; }
	function file(ind) { return Math.floor(ind / 8); }

	function pieceAt(file, row, piece) {
		int i = bindex(file, row);
		if (piece) {
			board[i] = piece;
			piece.setSquare(file, row);
		}
		return board[i];
	};

	function copyBoard() {
		return board.slice(0, board.length)
	}

	function clearPieceAt(file, row) {
		var piece = pieceAt(file, row);
		if (piece)
			piece.remove();
		delete board[bindex(file, row)];
	}

	function roadIsClear(file1, file2, row1, row2) {
		var file, row, dfile, drow, moves;
		dfile = file1 == file2 ? 0 : file1 < file2 ? 1 : -1;
		drow = row1 == row2 ? 0 : row1 < row2 ? 1 : -1;
		moves = Math.max((file2 - file1) * dfile, (row2 - row1) * drow);

		file = file1 + dfile;
		row = row1 + drow;
		for (var i = 1; i < moves; i++, file += dfile, row += drow)
			if (pieceAt(file, row))
				return false;
		return true;
	}

	function ChessPiece(type, color) {
		this.type = type;
		this.color = color;
		this.img = $('<img>', {src: imageUrl(type, color), 'class': 'pgn-chessPiece'})
			.css({display: 'none'})
			.appendTo(div);
		pieces.push(this);
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

	ChessPiece.prototype.move = function(file, row, dontClear) {
		clearPieceAt(this.file, this.row);
		pieceAt(file, row, this);
		this.img.animate({top: calcTop(this.row), left: calcLeft(this.file)}, 'slow');
	}

	ChessPiece.prototype.pawnDirection = function () { return this.color == 'd' ? 1 : -1; }
	ChessPiece.prototype.pawnStart = function() { return this.color == 'd' ? 2 : 7; }

	ChessPiece.prototype.remove = function(clearBoard) {
		this.onBoard = false;
		this.img.fadeOut(anim());
	}

	ChessPiece.prototype.canMoveTo = function(file, row) {
		switch(type) {
			case 'n':
				var diffx = Math.abs(file - this.file), diffy = Math.abs(row - this.row);
				return diffx + diffy == 3 && diffx * diffy; // no need to test if target is occupied.
			case 'p':
				var occupied = !!board[file][row];
				return
					(this.row == this.pawnStart() && row ==  this.row + this.pawnDirection() * 2 && this.file == file && !occupied)
					|| (this.row + this.direction() == row && Math.abs(this.file - file) == 1) // do not test "occupied" - can be en passe
					|| (this.row + this.direction() == row && this.file == file && ! occupied)
			case 'k':
				return Math.abs(this.row - row) < 2 && Math.abs(this.file - file);
			case 'q':
				return
					(
						(this.file == file)
						|| (this.row == row)
						|| (Math.abs(this.file - file) == Math.abs(this.row - row))
					) && rowdIsClear(this.file, file, this.row, row);
			case 'r':
				return
					(
						(this.file == file)
						|| (this.row == row)
					) && rowdIsClear(this.file, file, this.row, row);
			case 'b':
				return
					Math.abs(this.file - file) == Math.abs(this.row - row)
					&& rowdIsClear(this.file, file, this.row, row);
		}
	}

	function drawBoard() {
	}

	function executeMove(color, move) {
		move = move..replace(/[!?+# ]*(\$\d{1,3})?$/, ''); // check, mate, comments, glyphs.
		var piece = move.charAt(0);
		var lp = piece.toLowerCase();
		if (piece == lp) { // pawn. all officer's moves begin with uppercase;
			lp = 'p';
			move = 'P' + move; // ordnung muss zein. now all moves look the same.
		}
		piece = lp;
		var target = piece.substr(-2);
	}

	function analyzePgn() {
		var moveSequences = getMoveSequences();
		stages.push(copyBoard());
		while (moveSequences.length) {
			var move = moveSequences[0];
			executeMove('d', move[0]);
			stages.push(copyBoard())
			if (move.length > 1) {
				executeMove('l', move[1]);
				stages.push(copyBoard());
			}
		}
	}

	function populateBoard() {
		div = $('<div>');
		var officers = ['r','n', 'b', 'q', 'k', 'b', 'n', 'r'];
		for (var file = 0; file < 8; file++) {
			var o = officers[file], p = 'p';
			pieceAt(file, 1, new ChessPiece(o, 'd'));
			pieceAt(file, 2, new ChessPiece(p, 'd'));
			pieceAt(file, 7, new ChessPiece(p, 'l');
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
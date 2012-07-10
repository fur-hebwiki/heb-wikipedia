"use strict";
(function() {
	var
		board = [],
		currentMove = 0,
		pgn,
		white,
		div,
		black,
		imageUrl = {},
		pieces = {},
		dummy = {remove: function(){}};

	function roadIsClear(file1, file2, row1, row2) {
		var file, row, dfile, drow, moves;
		dfile = file1 == file2 ? 0 : file1 < file2 ? 1 : -1;
		drow = row1 == row2 ? 0 : row1 < row2 ? 1 : -1;
		moves = Math.max((file2 - file1) * dfile, (row2 - row1) * drow);
		
		file = file1 + dfile;
		row = row1 + drow;
		for (var i = 1; i < moves; i++, file += dfile, row += drow) 
			if (board[file, row])
				return false;
		return true;
	}
	
	function ChessPiece(type, color, initialFile, initialRow) {
		this.type = type;
		this.color = color;
		this.file = this.initialFile = initialFile;
		this.row = initialRow;
		this.img = $('<img>', {src: imageUrl(type, color)})
			.css({position: 'absolute', zIndex: 3, top: calcTop(this.row), left: calcLeft(this.file), display: this.onboard ? 'inherit' : 'none'})
			.appendTo(div);
		pieces[type + color + initialFile] = this;
	}
	
	ChessPiece.prototype.move = function(newFile, newRow, anim) {
		// if (this.type == 'p' // handle en passe later.
		(board[newFile][newRow] || dummy).remove();
		if (anim)
			this.img.animate({top: calcTop(this.row), left: calcLeft(this.file)}, 'slow');
		this.file = newfile;
		this.row = newRow;
		board[this.file, this.row] = this;
	}
	
	ChessPiece.prototype.pawnDirection = function () { return this.color == 'd' ? 1 : -1; }
	ChessPiece.prototype.pawnStart = function() { return this.color == 'd' ? 2 : 7; }
	
	ChessPiece.prototype.remove = function() {
		this.onBoard = false;
		this.img.css({display: 'none'});
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
	
	function populateBoard() {
		div = $('<div>');
		var officers = ['', 'r','n', 'b', 'q', 'k', 'b', 'n', 'r'];
		for (var file = 0; file < 9; file++) {
			board[file] = [];
			for (var row = 0; row < 9; row++)
				board[file][row] = null;
			board[file][1] = new ChessPiece(officers[file], 'd', file, 1);
			board[file][2] = new ChessPiece('p', 'd', file, 2);
			board[file][7] = new ChessPiece('p', 'l', file, 7);
			board[file][8] = new ChessPiece(officers[file], 'l', file, 8);
		}
	}
	
	function pupulateImages() {
		var 
			allPieces = [],
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
					populateBoard();
				}
			}
		);
	}

	mw.loader.using('mediawiki.api', pupulateImages);
})();
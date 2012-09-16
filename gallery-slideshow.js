"use strict";
$(function() {
	function createSlideshow(index, galleryDiv) {
		var fadeOutRate = 500,
			fadeInRate = 500,
			slideShowDelay = 4000,
			$gallery = $('ul.gallery', galleryDiv),
			allImgAnchors = $('ul.gallery > li > div > div > div > a.image', galleryDiv),
			allCaptions = $('ul.gallery > li div.gallerytext', galleryDiv),
			slideShow = $('<div>', {'class' : 'gallerySlideshowDiv'}).insertBefore($gallery),
			currentSlide = 0,
			timer,
			tipsyOptions = {
				title: tipsyTooltip,
				html: true,
				delayIn: 500,
				fade: true,
				delayOut: 0
			};
			
		function quadrant(elem, clientX) {
			var width = elem.width(),
				x = clientX - elem.offset().left,
				ratio = (1.0 * x) / width;
			return Math.floor(ratio * 4);
		}
		
		function imageClicked(e) {
			clearInterval(timer);
			switch (quadrant($(this), e.clientX)) {
				case 0: advance(1);
						break;
				case 1:
				case 2: window.location = allImgAnchors[currentSlide].href;
						break;
				case 3: advance(-1);
						break;
			}
		}
		
		function makeOneSlide(index) {
			var anchor = allImgAnchors[index], 
				caption = allCaptions[index];
			var image = $('img', anchor)
				.click(imageClicked)
				.mousemove(function(e) {
					$(this).data({mouseloc: e.clientX});
				})
				.data({tiptype: 'image', index: index})
				.tipsy(tipsyOptions);
			return $('<div>', {'class': 'gallerySlideShowOneSlide'})
				.append(image) 
				.append(caption);
		}
		
		function switchToSlide(i) {
			if (i == currentSlide)
				return;
			var previous = currentSlide;
			currentSlide = (i + allImgAnchors.length) % allImgAnchors.length;
			allSlides[previous].fadeOut(fadeOutRate, function() {
				$('.gallery-slideshow-current-index', galleryDiv).text(1 + currentSlide);
				allSlides[currentSlide].fadeIn(fadeInRate);
			});
		}
		
		function advance(step) { // step might be nagative.
			return switchToSlide(next(step));
		}
		
		function next(offset) {
			return (currentSlide + offset + allImgAnchors.length) % allImgAnchors.length;
		}
		
		function tipOfGotoImage(index) {
			index = (index + allImgAnchors.length) % allImgAnchors.length;
			return 'עבור לתמונה ' + (index+1) + ':<br/>' + allCaptions[index].innerHTML;
		}
		
		function tipsyTooltip() {
			var $this = $(this);
			switch ($this.data('tiptype')) {
				case 'image': 
					var imgnum = $this.data('index'),
						mouseloc = $this.data('mouseloc');
					switch (quadrant($this, mouseloc)) {
						case 0: return tipOfGotoImage(next(1))
						case 1:
						case 2: return 'לדף הקובץ של התמונה';
						case 3: return tipOfGotoImage(next(-1));
					}
					break;
				case 'button':
					var offset = $this.data('offset'),
						index = $this.data('index'),
						tooltip = $this.data('tooltip');
					if (offset)
						return tipOfGotoImage(next(offset));
					if (typeof index != 'undefined')
						return tipOfGotoImage(index);
					return tooltip;
					break;
			}
		}
		
		function beginSlideshow() {
			timer = setInterval(function() {
				advance(1);
			}, slideShowDelay);
		}
		
		function buttonOptions(button) {
			if (button.hasClass('gallery-slideshow-last')) return {index: -1};
			if (button.hasClass('gallery-slideshow-first')) return {index: 0};
			if (button.hasClass('gallery-slideshow-next')) return {offset: 1};
			if (button.hasClass('gallery-slideshow-prev')) return {offset: -1};
			if (button.hasClass('gallery-slideshow-play')) return {tooltip: 'החל מצגת תמונות', special: 'play'};
			if (button.hasClass('gallery-slideshow-stop')) return {tooltip: 'עצור מצגת תמונות', special: 'stop'};
		}
		
		function buttonClicked(e) {
			var button = $(this),
  				offset = $this.data('offset'),
				index = $this.data('index'),
				special = $this.data('special');
			$(galleryDiv).stop(false, true);
			clearInterval(timer);
			if (offset)
				advance(offset);
			else if (typeof index != 'undefined')
				switchToSlide(index);
			else if (special == 'play')
				beginSlideshow();
		}
		
		$gallery.toggle(false);
		var allSlides = [];
		for (var i = 0; i < allImgAnchors.length; i++) {
			var slide = makeOneSlide(i);
			slide.toggle(i == 0);
			allSlides.push(slide);
			slideShow.append(slide);
		}
		
		$('span.gallery-slideshow-toolbar span').each(function(index, button) {
			var $this = $(this),
				text = $this.text();
			if (! $this.hasClass('gallery-slideshow-current-index')) {
				$('<button>', {'class': $this.attr('class'), title: text, })
					.text(text)
					.insertBefore($this)
					.button('options', {text: $this.text()})
					.click(buttonClicked)
					.data({tiptype: 'button'})
					.tipsy(tipsyTooltip);
				$this.remove();
			}
		});
	}
	
	
	function galleryToSlideshow(index, gallery) {
		mw.loader.using(['jquery.ui.button', 'jquery.tipsy'], createSlideshow(index, gallery));
	}
	
	$('div.gallery-slideshow').each(galleryToSlideshow);
});
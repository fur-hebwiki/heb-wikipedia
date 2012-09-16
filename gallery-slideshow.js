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
			timer;
		
		function imageClicked(e) {
			
			var $this = $(this),
				width = $this.width(),
				x = e.clientX - $this.offset().left,
				ratio = (1.0 * x) / width,
				part = Math.floor(ratio * 4);
				switch (part) {
					case 0: advance(1);
							break;
					case 1:
					case 2: window.location = allImgAnchors[currentSlide].href;
							break;
					case 3: advance(-1);
							break;
				}
		}
		
		function makeOneSlide(imageAnchor, caption) {
			var image = $('img', imageAnchor);
			image.click(imageClicked)
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
				allSlides[currentSlide].fadeIn(fadeInRate);
			});
		}
		
		function advance(steps) { // step might be nagative.
			return switchToSlide((currentSlide + steps + allImgAnchors.length) % allImgAnchors.length);
		}
		
		$gallery.toggle(false);
		var allSlides = [];
		for (var i = 0; i < allImgAnchors.length; i++) {
			var slide = makeOneSlide(allImgAnchors[i], allCaptions[i]);
			slide.toggle(i == 0);
			allSlides.push(slide);
			slideShow.append(slide);
		}
		
		$('span.gallery-slideshow-toolbar span').each(function(index, button) {
			var $this = $(this),
				text = $this.text(),
				button = $('<button>', {'class': $this.attr('class'), title: text, })
					.text(text)
					.insertBefore($this)
					.button('options', {text: $this.text(), icons: {primary: 'ui-icon-play'}})
					.click(buttonClicked)
					.hover(buttonHover);
			$this.remove();
		})
			
		function buttonHover() {
			
		}
		
		function buttonClicked(e) {
			var button = $(this);
			var funcs = {
				'gallery-slideshow-last': function() {switchToSlide(-1);},
				'gallery-slideshow-first': function() {switchToSlide(0);},
				'gallery-slideshow-next': function() {advance(1);},
				'gallery-slideshow-prev': function() {advance(-1);},
				'gallery-slideshow-play': function() {
					timer = setInterval(function() {
						advance(1);
					}, slideShowDelay);
					button.button('options', {enabled: false})
				},
				'gallery-slideshow-stop': function() {}
			}
			$(galleryDiv).stop(false, true);
			clearInterval(timer);
			button.siblings('.gallery-slideshow-play').button('options', {enabled: true});
			for (var className in funcs)
				if (button.hasClass(className))
					funcs[className]();
		}
			
	}
	
	
	function galleryToSlideshow(index, gallery) {
		mw.loader.using('jquery.ui.button', createSlideshow(index, gallery));
	}
	
	$('div.gallery-slideshow').each(galleryToSlideshow);
});
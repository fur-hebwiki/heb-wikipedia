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
			return switchToSlide(next(currentSlide, step));
		}
		
		function next(index, offset) {
			return (index + offset + allImgAnchors.length) % allImgAnchors.length;
		}
		
		function tipsyTooltip(e) {
			var $this = $(this);
			switch ($this.data('tiptype')) {
				case 'image': 
					var imgnum = $this.data('index'),
						mouseloc = $this.data('mouseloc');
					switch (quadrant($this, mouseloc)) {
						case 0: return 'לתמונה הבאה (' + (next(imgnum, 1)+1) + ')<br/>' + allCaptions[next(imgnum, 1)].innerHTML;
						case 1:
						case 2: return 'לדף הקובץ של התמונה';
						case 3: return 'לתמונה הקודמת (' + (next(imgnum, -1) + 1) + ')<br/>' + allCaptions[next(imgnum, -1)].innerHTML;
					}
					break;
				case 'button':
					return $this.text();
			}
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
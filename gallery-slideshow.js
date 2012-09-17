"use strict";
$(function() {
	function createSlideshow(index, galleryDiv) {
		
		var fadeOutRate = 500,
			fadeInRate = 500,
			slideShowDelay = 4000,
			$gallery = $('ul.gallery', galleryDiv),
			allImgAnchors = $('ul.gallery > li > div > div > div > a.image', galleryDiv),
			allCaptions = $('ul.gallery > li div.gallerytext', galleryDiv),
			slideShow = $('<div>', {'class' : 'gallery-slideshow-div'}).insertBefore($gallery),
			radiosDiv = $('.gallery-slideshow-radios', galleryDiv),
			radioTemplate = $('.gallery-slideshow-radio', galleryDiv),
			oneSlideTemplate = $('.gallery-slideshow-slide', galleryDiv),
			allSlides = [],
			allRadios = [],
			currentSlide,
			timer,
			tipsyOptions = {
				title: tipsyTooltip,
				html: true,
				delayIn: 500,
				fade: true,
				delayOut: 0
			};
			
		function quadrant(elem, x) {
			x -= elem.offset().left;
			return Math.floor(4.0 * x / elem.width());
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
			radiosDiv.append(
				radioTemplate.clone()
				.html(radioTemplate.html().replace('$NUM', (index+1)))
				.data({index: index, tiptype: 'radio'})
				.click(radioClicked)
				.tipsy(tipsyOptions)
			);
			if (oneSlideTemplate.length) {
				var res = oneSlideTemplate.clone().toggle(false);
				$('.gallery-slideshow-slide-image', res).append(image);
				$('.gallery-slideshow-slide-caption', res).append(caption);
				return res;
			}
			else
				return $('<div>', {'class': 'gallery-slideshow-slide'})
					.append(image) 
					.append(caption)
					.toggle(false);
		}
		
		function switchToSlide(i) {
			function showNew(immediate) {
				$('.gallery-slideshow-current-index', galleryDiv).text(1 + currentSlide);
				$('.gallery-slideshow-radio', galleryDiv)
					.removeClass('gallery-slideshow-radio-selected')
					.filter(function() {return $(this).data('index') == currentSlide;})
					.addClass('gallery-slideshow-radio-selected');
				allSlides[currentSlide].fadeIn(immediate ? 0 : fadeInRate);
			}
			
			if (i == currentSlide)
				return;
			var previous = currentSlide;
			currentSlide = (i + allSlides.length) % allSlides.length;
			if (typeof previous == 'number')
				allSlides[previous].fadeOut(fadeOutRate, showNew);
			else
				showNew(true);
		}
		
		function advance(step) { // step might be nagative.
			return switchToSlide(next(step));
		}
		
		function next(offset) {
			return (currentSlide + offset + allSlides.length) % allSlides.length;
		}
		
		function tipOfGotoImage(index) {
			index = (index + allSlides.length) % allSlides.length;
			return 'תמונה ' + (index+1) + ':<br/>' + allCaptions[index].innerHTML;
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
						index = $this.data('index');
					return (typeof offset == 'number' && tipOfGotoImage(next(offset))) ||
							(typeof index == 'number' && tipOfGotoImage(index)) ||
							$this.data('tooltip');
					break;
				case 'radio':
					return tipOfGotoImage($this.data('index'));
					break;
			}
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
		
		function radioClicked() {
			clearInterval(timer);
			switchToSlide($(this).data('index'));
		}
		
		function playButtonClicked() {
			timer = setInterval(function() {
				advance(1);
			}, slideShowDelay);
		}
		
		function buttonClicked(e) {
			var button = $(this),
  				offset = button.data('offset'),
				index = button.data('index'),
				action = button.data('action');
			$(galleryDiv).stop(false, true);
			clearInterval(timer);
			if (typeof offset == 'number')
				advance(offset);
			else if (typeof index == 'number')
				switchToSlide(index);
			else if (typeof action == 'function')
				action();
		}
		
		function buttonOptions(button) {
			if (button.hasClass('gallery-slideshow-last')) return {index: -1};
			if (button.hasClass('gallery-slideshow-first')) return {index: 0};
			if (button.hasClass('gallery-slideshow-next')) return {offset: 1};
			if (button.hasClass('gallery-slideshow-prev')) return {offset: -1};
			if (button.hasClass('gallery-slideshow-play')) return {tooltip: 'החל מצגת תמונות', action: playButtonClicked};
			if (button.hasClass('gallery-slideshow-stop')) return {tooltip: 'עצור מצגת תמונות'};
		}
		
		$gallery.toggle(false);
		for (var i = 0; i < allImgAnchors.length; i++) {
			var slide = makeOneSlide(i);
			allSlides.push(slide);
			slideShow.append(slide);
		}
		radioTemplate.toggle(false);
		$('span.gallery-slideshow-toolbar span').each(function(index, button) {
			var $this = $(this),
				text = $this.text();
			$('<button>', {'class': $this.attr('class'), title: text})
				.addClass('gallery-slideshow-button')
				.text(text)
				.insertBefore($this)
				.button('options', {text: text, click: buttonClicked})
				.click(buttonClicked)
				.data({tiptype: 'button'})
				.data(buttonOptions($this))
				.tipsy(tipsyOptions);
			$this.remove();
		});
		switchToSlide(0);
	}
	
	if ($('div.gallery-slideshow').length) {
		mw.util.addCSS($('.gallery-slideshow-style').text());		
		mw.loader.using(['jquery.ui.button', 'jquery.tipsy'], function() {
			$('div.gallery-slideshow').each(createSlideshow);
		});
	}
});
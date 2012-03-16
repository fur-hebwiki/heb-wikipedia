// tipsy, facebook style tooltips for jquery
// version 1.0.0a
// (c) 2008-2010 jason frame [jason@onehackoranother.com]
// released under the MIT license

(function($) {

	function maybeCall(thing, ctx) {
		return (typeof thing == 'function') ? (thing.call(ctx)) : thing;
	};

	function Tipsy(element, options) {
		this.$element = $(element);
		this.options = options;
		this.enabled = true;
		this.fixTitle();
	};

	Tipsy.prototype = {
		show: function() {
			var title = this.getTitle();
			if (title && this.enabled) {
				var $tip = this.tip();

				$tip.find('.tipsy-inner')[this.options.html ? 'html' : 'text'](title);
				$tip[0].className = 'tipsy'; // reset classname in case of dynamic gravity
				$tip.remove().css({top: 0, left: 0, visibility: 'hidden', display: 'block'}).prependTo(document.body);

				var pos = $.extend({}, this.$element.offset(), {
					width: this.$element[0].offsetWidth,
					height: this.$element[0].offsetHeight
				});

				var actualWidth = $tip[0].offsetWidth,
					actualHeight = $tip[0].offsetHeight,
					gravity = maybeCall(this.options.gravity, this.$element[0]);

				var tp;
				switch (gravity.charAt(0)) {
					case 'n':
						tp = {top: pos.top + pos.height + this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
						break;
					case 's':
						tp = {top: pos.top - actualHeight - this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
						break;
					case 'e':
						tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth - this.options.offset};
						break;
					case 'w':
						tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width + this.options.offset};
						break;
				}

				if (gravity.length == 2) {
					if (gravity.charAt(1) == 'w') {
						tp.left = pos.left + pos.width / 2 - 15;
					} else {
						tp.left = pos.left + pos.width / 2 - actualWidth + 15;
					}
				}

				$tip.css(tp).addClass('tipsy-' + gravity);
				$tip.find('.tipsy-arrow')[0].className = 'tipsy-arrow tipsy-arrow-' + gravity.charAt(0);
				$tip.addClass(maybeCall(this.options.className, this.$element[0]));

				if (this.options.fade) 
					$tip.stop().css({opacity: 0, display: 'block', visibility: 'visible'}).animate({opacity: this.options.opacity});
				else 
					$tip.css({visibility: 'visible', opacity: this.options.opacity});

				if (this.options.trigger == 'hovertip') {
					var $this = this;
					this.options.delayOut = this.options.delayOut || 200;
					$tip.hover(function() {$this.hoverState = 'in';}, function() {$this.leave();});
				}
			}
		},

		hide: function() {
			if (this.options.fade)
				this.tip().stop().fadeOut(function() { $(this).remove(); });
			else
				this.tip().remove();

		},

		fixTitle: function() {
			var $e = this.$element;
			$e.attr('original-title', $e.attr('title') || $e.attr('original-title') || '').removeAttr('title');
		},

		getTitle: function() {
			this.fixTitle();
			var $e = this.$element, o = this.options, title = maybeCall(o.title, $e[0]);
			if (title === 'title')
				title = $e.attr('original-title');
			return $.trim(title || '') || o.fallback || '';
		},

		tip: function() {
			return this.$tip = this.$tip ||
				$('<div>', {'class': 'tipsy'})
					.addClass(this.options.className)
					.append($('<div>', {'class': 'tipsy-arrow'}))
					.append($('<div>', {'class': 'tipsy-inner'}));
		},

		validate: function() {
			if (!this.$element[0].parentNode) {
				this.hide();
				this.$element = null;
				this.options = null;
			}
		},

		enter: function() {
			var $this = this, delay = this.options.delayIn;
			this.hoverState = 'in';
			setTimeout(function() {if ($this.hoverState == 'in') $this.show();}, delay);
		},

		leave: function() {
			var $this = this, delay = this.options.delayOut;
			this.hoverState = 'out';
			setTimeout(function() { if ($this.hoverState == 'out') $this.hide();}, delay);
		},

		enable: function() {this.enabled = true;},
		disable: function() {this.enabled = false; },
		toggleEnabled: function() {this.enabled ^= true;}
	};

	$.fn.tipsy = function(options) {

		if (options === true) 
			return this.data('tipsy');
		else if (typeof options == 'string') {
			var tipsy = this.data('tipsy');
			if (tipsy)
				maybeCall(tipsy[options]);
			return this;
		}

		options = $.extend({}, $.fn.tipsy.defaults, options);

		function get(ele) {
			var tipsy = $.data(ele, 'tipsy');
			if (!tipsy) {
				tipsy = new Tipsy(ele, $.fn.tipsy.elementOptions(ele, options));
				$.data(ele, 'tipsy', tipsy);
			}
			return tipsy;
		}

		function enter() {get(this).enter();}
		function leave() {get(this).leave();}

		if (!options.live) this.each(function() { get(this); });

		if (options.trigger != 'manual') {
			var binder = options.live ? 'live' : 'bind',
				hover = $.inArray(options.trigger, ['hover', 'hovertip']) + 1,
				eventIn  = hover ? 'mouseenter' : 'focus',
				eventOut = hover ? 'mouseleave' : 'blur';
			this[binder](eventIn, enter)[binder](eventOut, leave);
		}
		return this;
	};

	$.fn.tipsy.defaults = {
		className: null,
		delayIn: 0,
		delayOut: 0,
		fade: false,
		fallback: '',
		gravity: 'n',
		html: false,
		live: false,
		offset: 0,
		opacity: 0.8,
		title: 'title',
		trigger: 'hover'
	};

	// Overwrite this method to provide options on a per-element basis.
	// For example, you could store the gravity in a 'tipsy-gravity' attribute:
	// return $.extend({}, options, {gravity: $(ele).attr('tipsy-gravity') || 'n' });
	// (remember - do not modify 'options' in place!)
	$.fn.tipsy.elementOptions = function(ele, options) {
		return $.metadata ? $.extend({}, options, $(ele).metadata()) : options;
	};

	$.fn.tipsy.autoNS = function() {
		return $(this).offset().top > ($(document).scrollTop() + $(window).height() / 2) ? 's' : 'n';
	};

	$.fn.tipsy.autoWE = function() {
		return $(this).offset().left > ($(document).scrollLeft() + $(window).width() / 2) ? 'e' : 'w';
	};

	/**
	 * yields a closure of the supplied parameters, producing a function that takes
	 * no arguments and is suitable for use as an autogravity function like so:
	 *
	 * @param margin (int) - distance from the viewable region edge that an
	 *		element should be before setting its tooltip's gravity to be away
	 *		from that edge.
	 * @param prefer (string, e.g. 'n', 'sw', 'w') - the direction to prefer
	 *		if there are no viewable region edges effecting the tooltip's
	 *		gravity. It will try to vary from this minimally, for example,
	 *		if 'sw' is preferred and an element is near the right viewable
	 *		region edge, but not the top edge, it will set the gravity for
	 *		that element's tooltip to be 'se', preserving the southern
	 *		component.
	 */
	 $.fn.tipsy.autoBounds = function(margin, prefer) {
		return function() {
			var 
				hasNS = !!('ns'.indexOf(prefer[0]) + 1),
				ns = hasNS ? prefer[0] : '', 
				ew = prefer[hasNS] || '',
				thisOffset = $(this).offset(),
				$doc = $(document),
				$win = $(window);

			ns = thisOffset.top - $doc.scrollTop() < margin // too close to top - force 'n'
				? 'n'
				: $win.height() + $doc.scrollTop() - thisOffset.top < margin // too close to bottom - force 's'
					? 's'
					: ns; // let it be
			ew = thisOffset.left - $doc.scrollLeft() < margin // too close to left - force 'w'
				? 'w'
				: $win.width() + $doc.scrollLeft() - thisOffset.left < margin // too close to right - force 'e'
					? 'e'
					: ew; // let it be
			return ns + ew;
		}
	};

})(jQuery);
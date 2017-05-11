(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var appius = appius || {};
var modulePlugin = {}

// Check to see if plugins array has already been defined.
if (typeof appius.plugins == "undefined") {
    appius.plugins = [];
}

// Create object of the current plugin details
modulePlugin = {
    version: '1.0.0',
    authors: 'Phil Hazelton',
    name: 'Equaliser',
    filename: 'equalise.js',
    description: 'Provides support for the equal-height helper attribute "data-equal". Use different values to creating unique "groupings" of elements. Layout is adjusted automatically on resize based on element offsets, not source order. Call init() to resize after markup changes (e.g. on accordions).'
};
appius.plugins.push(modulePlugin);



/** querySelectorAll polyfill (IE6/7) */
if (!document.querySelectorAll) {
    document.querySelectorAll = function (selectors) {
        var style = document.createElement('style'), elements = [], element;
        document.documentElement.firstChild.appendChild(style);
        document._qsa = [];

        style.styleSheet.cssText = selectors + '{x-qsa:expression(document._qsa && document._qsa.push(this))}';
        window.scrollBy(0, 0);
        style.parentNode.removeChild(style);

        while (document._qsa.length) {
            element = document._qsa.shift();
            element.style.removeAttribute('x-qsa');
            elements.push(element);
        }
        document._qsa = null;
        return elements;
    };
}

/** Cross-browser document.ready handler */
(function () {
    'use strict';
    var readyList = [],
    readyFired = false,
    readyEventHandlersInstalled = false;

    function ready() {
        if (readyFired) return null;

        readyFired = true;
        for (var i = 0; i < readyList.length; i++) readyList[i].call(window);
        readyList = [];
    }

    window.docReady = function (callback) {
        if (readyFired) return setTimeout(callback, 1), null;

        readyList.push(callback);

        if (document.readyState === 'complete' || (!document.attachEvent && document.readyState === 'interactive'))
            return setTimeout(ready, 1), null;

        if (!readyEventHandlersInstalled) {
            if (document.addEventListener) {
                document.addEventListener('DOMContentLoaded', ready, false);
                window.addEventListener('load', ready, false);
            } else {
                document.attachEvent('onreadystatechange', function () {
                    if (document.readyState == 'complete') ready();
                });
                window.attachEvent('onload', ready);
            }
            readyEventHandlersInstalled = true;
        }
    };
})();


/**
* @fileOverview Provides support for the equal-height helper attribute "data-equal"
*   Use different values to creating unique "groupings" of elements. Layout is
*   adjusted automatically on resize based on element offsets, not source order.
*   Call init() to resize after markup changes (e.g. on accordions).
* @author Phil Hazelton [phil@appius.com]
* @version 1.0.0
*/
var equalise = (function () {
    var module = {};
    var ATTR = 'data-equalise';

    // Simplified debouncing function from John Hann
    // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
    var debounce = function (func) {
        var timeout;

        return function debounced() {
            var obj = this, args = arguments;
            function delayed() {
                func.apply(obj, args);
                timeout = null;
            };

            if (timeout)
                clearTimeout(timeout);

            timeout = setTimeout(delayed, 100);
        };
    };

    window.onresize = debounce(init);

    /** Run on start and resize, should also be triggeres on DOM changes. */
    function init() {
        var nodeList = document.querySelectorAll('[' + ATTR + ']');
        var nodes = new Array();

        for (var i = nodeList.length >>> 0; i--;) {
            var node = nodeList[i];
            var isVisible = (node.offsetWidth > 0 || node.offsetHeight > 0);

            node.style.height = 'auto';
            if (isVisible)
                nodes.push(node);
        }

        processRow(nodes);
    }

    /** Finds and resizes the next row (recursive). */
    function processRow(nodes) {
        if (nodes.length < 1) return null;

        var row = [];
        var maxHeight = 0;
        var nextNode = findNextNode(nodes);

        var offset, node, group;

        for (var i = nodes.length >>> 0; i--;) {
            offset = getOffset(nodes[i]);
            group = getGroup(nodes[i]);

            if (offset == nextNode.offset && group == nextNode.group) {
                node = nodes.splice(i, 1)[0];
                row.push(node);
                if (node.offsetHeight > maxHeight)
                    maxHeight = node.offsetHeight;
            }
        }

        if (row.length > 1)
            for (var i = row.length >>> 0; i--;)
                row[i].style.height = maxHeight + 'px';

        if (nodes.length > 0)
            processRow(nodes);
    }

    /** Searches an array of nodes for the uppermost element offset. */
    function findNextNode(nodes) {
        if (nodes.length < 1) return null;
        var offset = getOffset(nodes[0]);
        var group = getGroup(nodes[0]);
        var thisOffset;

        for (var i = nodes.length >>> 0; i--;) {
            offset = getOffset(nodes[i]);
            if (thisOffset < offset) {
                offset = thisOffset;
                group = getGroup(nodes[i]);
            }
        }

        return {
            offset: offset,
            group: group
        };
    }

    /** Get the upper offset of an individual node (for checking alignment) */
    function getOffset(node) {
        return node.getBoundingClientRect().top;
    }

    /** Get the group of a node */
    function getGroup(node) {
        return node.getAttribute(ATTR);
    }

    window.docReady(init);

    module.init = init;
    return module;
}());

// Reinitialise on window load, used to recalculate heights once images are loaded.
window.onload = function () {
    equalise.init();
}
},{}],2:[function(require,module,exports){
module.exports = {
    init: function() {
        $("footer .additional__button").on('click', function (e) {
            e.preventDefault();
            var scrollPos;

            $(this).toggleClass("additional__button--is-active");

            $("#additional").toggle(2, function () {
                scrollPos = $(".additional__button").offset().top - 10;
                $('html, body').animate({ scrollTop: scrollPos }, 700);
            });
        });
    }
};

},{}],3:[function(require,module,exports){
/**
* @fileOverview Form field validation using data attributes
* @author John Akerman [john.akerman@appius.com]
* @version 0.1.0
*/

"use strict";

var FORMAT_VALIDATION_MSG_SELECTOR = 'data-formatvalidationmessage';
var VALIDATION_MSG_SELECTOR = 'data-validationmessage';
var REGEX_SELECTOR = 'data-validationregex';
var REQUIRED_SELECTOR = 'data-required';
var VALIDATABLE_SELECTOR = 'data-validatable';

function validateAll () {
    $('[' + VALIDATABLE_SELECTOR + ']').each(function() {
        validateField($(this));
    });
}

function validateDirty() {
    var hiddenFields = $("#hfValidation").val().split(",");
    $.each(hiddenFields,function(index,elem) {
        validateField($("#" + elem));
    });
}

function validateField($elem) {
    validateField($elem);
}

function init() {
    $('[' + VALIDATABLE_SELECTOR + ']').each(function() {
        var $this = $(this);
        $this.on("blur", function() {
            validateField($(this));
        });
    });
}

// A list of elements that have been focused is stored in a hidden input field
function addElementValidationList($elem) {
    var id = $elem.attr("id");
    var currentList = $("#hfValidation").val();

    if (currentList.indexOf(id) === -1) {
        if (currentList.length !== 0) {
            currentList += ",";
        }
        currentList += $elem.attr("id");
        $("#hfValidation").val(currentList);
    }
}

function removeElementValidationList($elem) {
    var id = $elem.attr("id");
    var currentList = $("#hfValidation").val();

    if (currentList === ",") {
        currentList = "";
    } else {
        currentList = currentList.replace(id, "");
    }

    currentList = currentList.replace(/\,$/, '');
    $("#hfValidation").val(currentList);
}

function showError($elem, msg) {
    var $elemParent = $elem.parents(".form-group");
    addElementValidationList($elem);

    if ($elem.hasClass("has-error")) return; // If field already has an error set, don't show another.

    $elemParent.addClass("has-error");
    $elem.addClass("has-error");

    // Create popup bubble with error message
    $("<div class='bubble bubble--bottom bubble--ketchup'>"+ msg  + "</div>").insertBefore($elemParent);
}

function hideError($elem) {
    var $elemParent = $elem.parents(".form-group");

    $elem.removeClass("has-error");
    $elemParent.removeClass("has-error");
    $elemParent.prev(".bubble").remove();

    removeElementValidationList($elem);
}

function validateField($elem) {
    var val = $elem.val();
    var reg = $elem.attr(REGEX_SELECTOR);

    // Check for select, if so only validate if its required and set to first item in index.
    if ($elem.is("select") && $elem.attr(REQUIRED_SELECTOR) === 'True') {
        if ($elem[0].selectedIndex === 0) {
            showError($elem, $elem.attr(VALIDATION_MSG_SELECTOR));
        }
        return;
    }

    if ($elem.attr(REQUIRED_SELECTOR) === 'True' && val.length === 0) {
        showError($elem, $elem.attr(VALIDATION_MSG_SELECTOR));
        return;
    }

    if (typeof $elem.attr(REGEX_SELECTOR) !== "undefined") {
        var regFilter = new RegExp(reg, "i");
        if (regFilter.test(val) === false) {
            showError($elem, (FORMAT_VALIDATION_MSG_SELECTOR));
            return;
        }
    }

    // If no errors found, hide message
    hideError($elem);
}

module.exports = {
    validateAll : validateAll,
    validateDirty: validateDirty,
    validateField : validateField,
    init: init
};

},{}],4:[function(require,module,exports){
module.exports = {
    init: function() {
        $(document).click(function (event) {
            if (!$(event.target).closest(".primary-nav__items").length) {
                if ($('.primary-nav__items.panel-open').length > 0) {
                    $('.primary-nav__items .is-open').removeClass('is-open');
                    $('primary-nav__items.panel-open').removeClass('panel-open');
    				panelCheckOpenStatus();
                }
            }
        });

        $('.primary-nav li.dropdown .primary-nav__top-level').on('click', function () {
            var $this = $(this);
    		var $panel = $this.next('.primary-nav__panel');

            // Panel is currently open, so close
            if ($this.parent().hasClass('is-open')) {
                $('.primary-nav li.dropdown').removeClass('is-open');
    			$panel.attr('style', '');
    			panelCheckOpenStatus();
            } else { // Panel is currently closed, so open
    			if (isMobile()) {
    				setFlyoutHeight($panel);
                    $('.primary-nav li.dropdown').removeClass('is-open');
                    window.setTimeout(function() {
        				$this.parent().addClass('is-open');
        				panelCheckOpenStatus();
        			}, 0);
    			} else {
                    resetFlyoutHeight($panel);
                    $('.primary-nav li.dropdown').removeClass('is-open');
                    $this.parent().addClass('is-open');
                    panelCheckOpenStatus();
                }
            }

        }).children().click(function (e) {
            e.stopPropagation();
        });

    	function isMobile() {
    		return ($(window).outerWidth() < 768);
    	}

        function setFlyoutHeight($panel) {
            $panel.attr('style', 'height: auto !important; transition: none !important');
    		$panel.attr('style', 'height: ' + $panel.outerHeight() + 'px');
        }

        function resetFlyoutHeight($panel) {
            $panel.attr('style', '');
        }

    	function panelCheckOpenStatus() {
    		if ($('.primary-nav li.dropdown.is-open').length > 0) {
                $('.primary-nav__items').addClass('panel-open');
            } else {
                $('.primary-nav__items').removeClass('panel-open');
            }
    	}
    }
};

},{}],5:[function(require,module,exports){
"use strict";
var speed = 400;

function checkErrors() {
    if ($(".has-error").length !== 0) {
        var $firstError = $(".has-error").eq(0);
        var $bubbleError = $firstError.prev(".bubble");
        var firstErrorOffset = $bubbleError.offset().top;
        scrollToPosition(firstErrorOffset, null, -10);
    }
}

function scrollToPosition(pos, hash, offset) {
    if (typeof offset === "undefined") { offset = 0; }

    $('html, body').animate({
        scrollTop: (pos + offset)
    }, {
        speed: speed
    }).promise().done(function () {
        if (typeof hash !== undefined && hash !== null) {
            window.location.hash = hash;
        }
    });
}

function init() {
    var $scroll		= $('html, body'),
        $body		= $scroll.filter('body');

    $body.on('click.internal', '[href*="#"]', function (event) {
        var $a		= $(event.target).closest('a'),
            href	= $a.attr('href'),
            hash,
            $target;

        if (href.length) {
            hash = href.substring(href.indexOf('#'));
            $target = $(hash);
        }
        if ($target.length) {
            event.preventDefault();
            // $body.find('[data-toggle="navigation"]').trigger('click.navigation.show-hide');
            scrollToPosition($target.offset().top, hash);
        }
    });
}

module.exports = {
    checkErrors: checkErrors,
    scrollToPosition: scrollToPosition,
    init: init
};

},{}],6:[function(require,module,exports){
module.exports = {
    init: function() {
        $('.accordion-tabs-minimal').each(function () {
            $(this).children('li').first().children('a').addClass('is-active').next().addClass('is-open').show();
        });

        $('.accordion-tabs-minimal').on('click', 'li > a.tab-link', function (event) {
            if (!$(this).hasClass('is-active')) {
                event.preventDefault();
                var accordionTabs = $(this).closest('.accordion-tabs-minimal');
                accordionTabs.find('.is-open').removeClass('is-open').hide();

                $(this).next().toggleClass('is-open').toggle();
                accordionTabs.find('.is-active').removeClass('is-active');
                $(this).addClass('is-active');
            } else {
                event.preventDefault();
            }
        });

        $('.js-accordion-trigger').on('click', function (event) {
            $(this).parent().find('.submenu').slideToggle('fast');  // apply the toggle to the ul
            $(this).parent().toggleClass('is-expanded');
            event.preventDefault();
        });
    }
};

},{}],7:[function(require,module,exports){
module.exports = {
    init: function() {
    	var $letters = $('[data-alphabet="sg-letters"]'),
    			$large = $('[data-alphabet="large"]'),
    			id = 'typography-letters',
    			activeClass = 'active',
    			enabled	= $.fn.carousel,
    			prev = [],
    			next = [],
    			options	= {
    				interval: 2500,
    				pause: 'hover',
    				wrap: true,
    				keyboard: true
    			};

    	if (enabled) {
    		$letters.html(function(index, text) {
    			var letters	= text.split(''),
    					html = [],
    					carousel = [],
    					i	= 0,
    					c	= 0;

    			for (i = 0; i < letters.length; i++) {
    				var letter	= letters[i];
    				html[i]		= '<a href="#" data-letter="' + letter + '" data-target="#' + id + '" data-slide-to="' + i + '" class="sg-letter' + (i === 0 ? ' ' + activeClass : '') + '">' + letter + '</a>';
    				carousel[c]	= '<div data-letter="' + letter + '" class="item' + (i === 0 ? ' ' + activeClass : '') + '">' + letter + '</div>';
    				c++;
    			}

    			// set the carousel HTML
    			$large.html(carousel.join(''));

    			return html.join('');
    		});

    		prev.push('<a data-slide="prev" role="button" href="#' + id + '" class="left carousel-control">');
    			prev.push('<span aria-hidden="true" class="icon-prev"></span>');
    			prev.push('<span class="sr-only">Previous</span>');
    		prev.push('</a>');

    		next.push('<a data-slide="next" role="button" href="#' + id + '" class="right carousel-control">');
    			next.push('<span aria-hidden="true" class="icon-next"></span>');
    			next.push('<span class="sr-only">Next</span>');
    		next.push('</a>');

    		$large.wrapInner('<div class="carousel-inner"></div>').append(prev.join('')).append(next.join(''));
    		$large.attr('id', id).addClass('carousel slide').carousel(options).on('slide.bs.carousel', function (event) {
    			var $current	= $(event.relatedTarget),
    				index		= $current.index();

    			$letters.find('a').removeClass(activeClass).eq(index).addClass(activeClass);
    		}).on('slid.bs.carousel', function () {});
    	}
    }
};

},{}],8:[function(require,module,exports){
module.exports = {
    init: function() {
        var activeClass = 'active';

        $('.sg-help').each(function (i, element) {
            var	$help		= $(element),
            $sections	= $help.find('.sg-help__section'),
            html		= [],
            h			= 0;

            $sections.each(function (s, section) {
                var $section	= $(section),
                title		= $section.find('.sg-help__section__title').text(),
                tab			= $section.data('tab'),
                classes		= ['btn', 'btn--link'];

                html[h++] = '<a class="' + classes.join(' ') + '" data-toggle="collapse" data-target="' + tab + '" href="#' + tab + '">' + title + '</a>';
            });

            $help.prepend('<div class="sg-help__nav btn-group" data-count="' + h + '">' + html.join('') + '</div>');
        }).on('click.help', '.btn', function (event) {
            var $button	= $(event.target).closest('.btn'),
            $group	= $button.closest('.sg-help__nav'),
            $help	= $button.closest('.sg-help'),
            target	= $button.data('target'),
            $target	= $help.find('[data-tab="' + target + '"]');

            $group.find('.btn').removeClass(activeClass);
            $target.siblings().removeClass(activeClass);

            if ($target.is('.' + activeClass)) {
                $target.add($button).removeClass(activeClass);
            } else {
                $target.add($button).addClass(activeClass);
            }

            event.preventDefault();
        });
    }
};

},{}],9:[function(require,module,exports){
module.exports = {
    init: function() {
    	var $body		= $('body'),
    		before		= $body.data('navigation-trigger') || '.logo',
    		shownClass	= $body.data('navigation-class') || 'sidebar--shown',
    		$before		= $(before),
    		html		= [],
    		h			= 0;

    	html[h++] = '<button data-toggle="navigation">';
    		html[h++] = '<span></span>';
    		html[h++] = '<span></span>';
    		html[h++] = '<span></span>';
    	html[h++] = '</button>';

    	$(html.join('')).insertBefore($before);

    	$body.on('click.navigation.show-hide', '[data-toggle="navigation"]', function (event) {
    		if ($body.is('.' + shownClass)) {
    			$body.removeClass(shownClass);
    		} else {
    			$body.addClass(shownClass);
    		}

    		event.preventDefault();
    	}).on('click.navigation.sub', '.nav__item--has-sub > a', function (event) {
    		var $li	= $(event.target).closest('.nav__item--has-sub'),
    			$ul	= $li.children('ul');

    		if ($ul.is(':visible')) {
    			$ul.stop().slideUp();
    		} else {
    			$ul.stop().slideDown();
    		}

    		event.preventDefault();
    	});
    }
};

},{}],10:[function(require,module,exports){
module.exports = {
    init: function() {
        var $container	= $('[data-show-hide="container"]'),
        html		= [],
        h			= 0;

        html[h++] = '<div class="btn-group" data-show-hide="show-hide">';
        html[h++] = '<a href="#" class="btn btn--small btn--link" data-show-hide="show">Show All</a>';
        html[h++] = '<a href="#" class="btn btn--small btn--link" data-show-hide="hide">Hide All</a>';
        html[h++] = '</div>';

        $container.on('click', '[data-show-hide="toggle"]', function (event) {
            var $toggle	= $(event.target).closest('[data-show-hide="toggle"]'),
            $show	= $toggle.parent().find('[data-show-hide="value"]');

            if ($show.is('[data-default="true"]')) {
                $show.attr('data-default', 'false');
            } else {
                $show.attr('data-default', 'true');
            }

            event.preventDefault();
        }).each(function (i, element) {
            $(element).append(html.join(''));
        }).on('click', '[data-show-hide="show"], [data-show-hide="hide"]', function (event) {
            var $link	= $(event.target).closest('[data-show-hide="show"], [data-show-hide="hide"]'),
            $c		= $link.closest('[data-show-hide="container"]'),
            $values	= $c.find('[data-show-hide="value"]'),
            type	= $link.data('show-hide');

            if (type === 'show') {
                $values.attr('data-default', 'true');
            } else if (type === 'hide') {
                $values.attr('data-default', 'false');
            }

            event.preventDefault();
        });

        $('.expander-trigger').on('click', function () {
    		$(this).toggleClass("expander-hidden");
    	});
    }
};

},{}],11:[function(require,module,exports){
window.appius = {
	scroller: require('./_appius.scroller.js'),
	primaryNav: require('./_appius.primaryNav.js'),
	accordion: require('./_sunlife.accordions.js'),
	showHide: require('./_sunlife.showHide.js'),
	help: require('./_sunlife.help.js'),
	alphabetCarousel: require('./_sunlife.alphabetCarousel.js'),
	footerToggle: require('./_appius.footerToggle.js'),
	nav: require('./_sunlife.nav.js')
};

﻿require('./vendor/bootstrap.js');
require('./_appius.equalise.js');
require('./_appius.formRegexValidation.js');

$(document).ready(function () {
	appius.scroller.init();
	appius.primaryNav.init();
	appius.accordion.init();
	appius.showHide.init();
	appius.help.init();
	appius.alphabetCarousel.init();
	appius.footerToggle.init();
	appius.nav.init();
});

},{"./_appius.equalise.js":1,"./_appius.footerToggle.js":2,"./_appius.formRegexValidation.js":3,"./_appius.primaryNav.js":4,"./_appius.scroller.js":5,"./_sunlife.accordions.js":6,"./_sunlife.alphabetCarousel.js":7,"./_sunlife.help.js":8,"./_sunlife.nav.js":9,"./_sunlife.showHide.js":10,"./vendor/bootstrap.js":12}],12:[function(require,module,exports){
// require('./bootstrap/transition.js');
// require('./bootstrap/alert.js');
// require('./bootstrap/button.js');
require('./bootstrap/carousel.js');
// require('./bootstrap/collapse.js');
// require('./bootstrap/dropdown.js');
// require('./bootstrap/modal.js');
require('./bootstrap/tab.js');
// require('./bootstrap/affix.js');
// require('./bootstrap/scrollspy.js');
// require('./bootstrap/tooltip.js');
// require('./bootstrap/popover.js');

},{"./bootstrap/carousel.js":13,"./bootstrap/tab.js":14}],13:[function(require,module,exports){
/* ========================================================================
 * Bootstrap: carousel.js v3.3.7
 * http://getbootstrap.com/javascript/#carousel
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CAROUSEL CLASS DEFINITION
  // =========================

  var Carousel = function (element, options) {
    this.$element    = $(element)
    this.$indicators = this.$element.find('.carousel-indicators')
    this.options     = options
    this.paused      = null
    this.sliding     = null
    this.interval    = null
    this.$active     = null
    this.$items      = null

    this.options.keyboard && this.$element.on('keydown.bs.carousel', $.proxy(this.keydown, this))

    this.options.pause == 'hover' && !('ontouchstart' in document.documentElement) && this.$element
      .on('mouseenter.bs.carousel', $.proxy(this.pause, this))
      .on('mouseleave.bs.carousel', $.proxy(this.cycle, this))
  }

  Carousel.VERSION  = '3.3.7'

  Carousel.TRANSITION_DURATION = 600

  Carousel.DEFAULTS = {
    interval: 5000,
    pause: 'hover',
    wrap: true,
    keyboard: true
  }

  Carousel.prototype.keydown = function (e) {
    if (/input|textarea/i.test(e.target.tagName)) return
    switch (e.which) {
      case 37: this.prev(); break
      case 39: this.next(); break
      default: return
    }

    e.preventDefault()
  }

  Carousel.prototype.cycle = function (e) {
    e || (this.paused = false)

    this.interval && clearInterval(this.interval)

    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

    return this
  }

  Carousel.prototype.getItemIndex = function (item) {
    this.$items = item.parent().children('.item')
    return this.$items.index(item || this.$active)
  }

  Carousel.prototype.getItemForDirection = function (direction, active) {
    var activeIndex = this.getItemIndex(active)
    var willWrap = (direction == 'prev' && activeIndex === 0)
                || (direction == 'next' && activeIndex == (this.$items.length - 1))
    if (willWrap && !this.options.wrap) return active
    var delta = direction == 'prev' ? -1 : 1
    var itemIndex = (activeIndex + delta) % this.$items.length
    return this.$items.eq(itemIndex)
  }

  Carousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'))

    if (pos > (this.$items.length - 1) || pos < 0) return

    if (this.sliding)       return this.$element.one('slid.bs.carousel', function () { that.to(pos) }) // yes, "slid"
    if (activeIndex == pos) return this.pause().cycle()

    return this.slide(pos > activeIndex ? 'next' : 'prev', this.$items.eq(pos))
  }

  Carousel.prototype.pause = function (e) {
    e || (this.paused = true)

    if (this.$element.find('.next, .prev').length && $.support.transition) {
      this.$element.trigger($.support.transition.end)
      this.cycle(true)
    }

    this.interval = clearInterval(this.interval)

    return this
  }

  Carousel.prototype.next = function () {
    if (this.sliding) return
    return this.slide('next')
  }

  Carousel.prototype.prev = function () {
    if (this.sliding) return
    return this.slide('prev')
  }

  Carousel.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.item.active')
    var $next     = next || this.getItemForDirection(type, $active)
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var that      = this

    if ($next.hasClass('active')) return (this.sliding = false)

    var relatedTarget = $next[0]
    var slideEvent = $.Event('slide.bs.carousel', {
      relatedTarget: relatedTarget,
      direction: direction
    })
    this.$element.trigger(slideEvent)
    if (slideEvent.isDefaultPrevented()) return

    this.sliding = true

    isCycling && this.pause()

    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
      $nextIndicator && $nextIndicator.addClass('active')
    }

    var slidEvent = $.Event('slid.bs.carousel', { relatedTarget: relatedTarget, direction: direction }) // yes, "slid"
    if ($.support.transition && this.$element.hasClass('slide')) {
      $next.addClass(type)
      $next[0].offsetWidth // force reflow
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one('bsTransitionEnd', function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () {
            that.$element.trigger(slidEvent)
          }, 0)
        })
        .emulateTransitionEnd(Carousel.TRANSITION_DURATION)
    } else {
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger(slidEvent)
    }

    isCycling && this.cycle()

    return this
  }


  // CAROUSEL PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.carousel')
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : options.slide

      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }

  var old = $.fn.carousel

  $.fn.carousel             = Plugin
  $.fn.carousel.Constructor = Carousel


  // CAROUSEL NO CONFLICT
  // ====================

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }


  // CAROUSEL DATA-API
  // =================

  var clickHandler = function (e) {
    var href
    var $this   = $(this)
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) // strip for ie7
    if (!$target.hasClass('carousel')) return
    var options = $.extend({}, $target.data(), $this.data())
    var slideIndex = $this.attr('data-slide-to')
    if (slideIndex) options.interval = false

    Plugin.call($target, options)

    if (slideIndex) {
      $target.data('bs.carousel').to(slideIndex)
    }

    e.preventDefault()
  }

  $(document)
    .on('click.bs.carousel.data-api', '[data-slide]', clickHandler)
    .on('click.bs.carousel.data-api', '[data-slide-to]', clickHandler)

  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this)
      Plugin.call($carousel, $carousel.data())
    })
  })

}(jQuery);

},{}],14:[function(require,module,exports){
/* ========================================================================
 * Bootstrap: tab.js v3.3.7
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    // jscs:disable requireDollarBeforejQueryAssignment
    this.element = $(element)
    // jscs:enable requireDollarBeforejQueryAssignment
  }

  Tab.VERSION = '3.3.7'

  Tab.TRANSITION_DURATION = 150

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.data('target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var $previous = $ul.find('.active:last a')
    var hideEvent = $.Event('hide.bs.tab', {
      relatedTarget: $this[0]
    })
    var showEvent = $.Event('show.bs.tab', {
      relatedTarget: $previous[0]
    })

    $previous.trigger(hideEvent)
    $this.trigger(showEvent)

    if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) return

    var $target = $(selector)

    this.activate($this.closest('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $previous.trigger({
        type: 'hidden.bs.tab',
        relatedTarget: $this[0]
      })
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: $previous[0]
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length)

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
          .removeClass('active')
        .end()
        .find('[data-toggle="tab"]')
          .attr('aria-expanded', false)

      element
        .addClass('active')
        .find('[data-toggle="tab"]')
          .attr('aria-expanded', true)

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu').length) {
        element
          .closest('li.dropdown')
            .addClass('active')
          .end()
          .find('[data-toggle="tab"]')
            .attr('aria-expanded', true)
      }

      callback && callback()
    }

    $active.length && transition ?
      $active
        .one('bsTransitionEnd', next)
        .emulateTransitionEnd(Tab.TRANSITION_DURATION) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tab

  $.fn.tab             = Plugin
  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  var clickHandler = function (e) {
    e.preventDefault()
    Plugin.call($(this), 'show')
  }

  $(document)
    .on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler)
    .on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler)

}(jQuery);

},{}]},{},[11])

//# sourceMappingURL=main.js.map

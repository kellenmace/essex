/* global buttonTitle */
( function( $ ) {

	var button, resizeTimer;

	button = $( '<button />', {
		'class': 'back-top',
		'aria-hidden': true,
		text: buttonTitle.desc
	} );

	function createButton() {
		if ( $( window ).innerWidth() < 768 ) {
			if ( 0 === $( '.back-top' ).length ) {
				$( '#page' ).after( button );
			}

			$( '.back-top' ).on( 'click', function() {
				$( 'html, body' ).animate( {
					scrollTop: 0
				}, 250 );
			} );
		} else {
			$( '.back-top' ).remove();
		}
	}

	$( document ).ready( function() {
		$( window )
			.on( 'load.shoreditch', createButton )
			.on( 'resize.shoreditch', function() {
				clearTimeout( resizeTimer );
				resizeTimer = setTimeout( createButton, 300 );
			} )
			.on( 'scroll.shoreditch', function() {
				if ( $( window ).scrollTop() >= $( window ).innerHeight() ) {
					$( '.back-top' ).slideDown( 250 );
				} else {
					$( '.back-top' ).slideUp( 250 );
				}
			} );
	} );

} )( jQuery );

/* global screenReaderText */
( function( $ ) {

	var body, masthead, menuToggle, siteMenu, siteNavigation;

	function initMainNavigation( container ) {

		// Add dropdown toggle that displays child menu items.
		var dropdownToggle = $( '<button />', {
			'class': 'dropdown-toggle',
			'aria-expanded': false
		} ).append( $( '<span />', {
			'class': 'screen-reader-text',
			text: screenReaderText.expand
		} ) );

		container.find( '.menu-item-has-children > a' ).after( dropdownToggle );

		// Toggle buttons and submenu items with active children menu items.
		container.find( '.current-menu-ancestor > button' ).addClass( 'toggled-on' );
		container.find( '.current-menu-ancestor > .sub-menu' ).addClass( 'toggled-on' );

		// Add menu items with submenus to aria-haspopup="true".
		container.find( '.menu-item-has-children' ).attr( 'aria-haspopup', 'true' );

		container.find( '.dropdown-toggle' ).click( function( e ) {
			var _this            = $( this ),
				screenReaderSpan = _this.find( '.screen-reader-text' );

			e.preventDefault();
			_this.toggleClass( 'toggled-on' );
			_this.next( '.children, .sub-menu' ).toggleClass( 'toggled-on' );

			// jscs:disable
			_this.attr( 'aria-expanded', _this.attr( 'aria-expanded' ) === 'false' ? 'true' : 'false' );
			// jscs:enable
			screenReaderSpan.text( screenReaderSpan.text() === screenReaderText.expand ? screenReaderText.collapse : screenReaderText.expand );
		} );
	}
	initMainNavigation( $( '.main-navigation' ) );

	masthead         = $( '#masthead' );
	menuToggle       = masthead.find( '#menu-toggle' );
	siteMenu         = masthead.find( '#site-menu' );
	siteNavigation   = masthead.find( '#site-navigation' );

	// Enable menuToggle.
	( function() {

		// Return early if menuToggle is missing.
		if ( ! menuToggle.length ) {
			return;
		}

		// Add an initial values for the attribute.
		menuToggle.add( siteNavigation ).attr( 'aria-expanded', 'false' );

		menuToggle.on( 'click.shoreditch', function() {
			$( this ).add( siteMenu ).add( siteNavigation ).toggleClass( 'toggled-on' );

			// jscs:disable
			$( this ).add( siteMenu ).add( siteNavigation ).attr( 'aria-expanded', $( this ).add( siteNavigation ).attr( 'aria-expanded' ) === 'false' ? 'true' : 'false' );
			// jscs:enable
		} );
	} )();

	// Fix sub-menus for touch devices and better focus for hidden submenu items for accessibility.
	( function() {
		if ( ! siteNavigation.length || ! siteNavigation.children().length ) {
			return;
		}

		// Toggle `focus` class to allow submenu access on tablets.
		function toggleFocusClassTouchScreen() {
			if ( window.innerWidth >= 896 ) {
				$( document.body ).on( 'touchstart.shoreditch', function( e ) {
					if ( ! $( e.target ).closest( '.main-navigation li' ).length ) {
						$( '.main-navigation li' ).removeClass( 'focus' );
					}
				} );
				siteNavigation.find( '.menu-item-has-children > a' ).on( 'touchstart.shoreditch', function( e ) {
					var el = $( this ).parent( 'li' );

					if ( ! el.hasClass( 'focus' ) ) {
						e.preventDefault();
						el.toggleClass( 'focus' );
						el.siblings( '.focus' ).removeClass( 'focus' );
					}
				} );
			} else {
				siteNavigation.find( '.menu-item-has-children > a' ).unbind( 'touchstart.shoreditch' );
			}
		}

		if ( 'ontouchstart' in window ) {
			$( window ).on( 'resize.shoreditch', toggleFocusClassTouchScreen );
			toggleFocusClassTouchScreen();
		}

		siteNavigation.find( 'a' ).on( 'focus.shoreditch blur.shoreditch', function() {
			$( this ).parents( '.menu-item' ).toggleClass( 'focus' );
		} );
	} )();

	// Add the default ARIA attributes for the menu toggle and the navigations.
	function onResizeARIA() {
		if ( window.innerWidth < 896 ) {
			if ( menuToggle.hasClass( 'toggled-on' ) ) {
				menuToggle.attr( 'aria-expanded', 'true' );
				siteMenu.attr( 'aria-expanded', 'true' );
				siteNavigation.attr( 'aria-expanded', 'true' );
			} else {
				menuToggle.attr( 'aria-expanded', 'false' );
				siteMenu.attr( 'aria-expanded', 'false' );
				siteNavigation.attr( 'aria-expanded', 'false' );
			}
		} else {
			menuToggle.removeAttr( 'aria-expanded' );
			siteMenu.removeAttr( 'aria-expanded' );
			siteNavigation.removeAttr( 'aria-expanded' );
		}
	}

	$( document ).ready( function() {
		body = $( document.body );

		$( window )
			.on( 'load.shoreditch', onResizeARIA )
			.on( 'resize.shoreditch', onResizeARIA );
	} );

} )( jQuery );

/**
 * skip-link-focus-fix.js
 *
 * Helps with accessibility for keyboard only users.
 *
 * Learn more: https://git.io/vWdr2
 */
( function() {
	var is_webkit = navigator.userAgent.toLowerCase().indexOf( 'webkit' ) > -1,
	    is_opera  = navigator.userAgent.toLowerCase().indexOf( 'opera' )  > -1,
	    is_ie     = navigator.userAgent.toLowerCase().indexOf( 'msie' )   > -1;

	if ( ( is_webkit || is_opera || is_ie ) && document.getElementById && window.addEventListener ) {
		window.addEventListener( 'hashchange', function() {
			var id = location.hash.substring( 1 ),
				element;

			if ( ! ( /^[A-z0-9_-]+$/.test( id ) ) ) {
				return;
			}

			element = document.getElementById( id );

			if ( element ) {
				if ( ! ( /^(?:a|select|input|button|textarea)$/i.test( element.tagName ) ) ) {
					element.tabIndex = -1;
				}

				element.focus();
			}
		}, false );
	}
})();

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhY2stdG9wLmpzIiwibmF2aWdhdGlvbi5qcyIsInNraXAtbGluay1mb2N1cy1maXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InByb2plY3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBnbG9iYWwgYnV0dG9uVGl0bGUgKi9cbiggZnVuY3Rpb24oICQgKSB7XG5cblx0dmFyIGJ1dHRvbiwgcmVzaXplVGltZXI7XG5cblx0YnV0dG9uID0gJCggJzxidXR0b24gLz4nLCB7XG5cdFx0J2NsYXNzJzogJ2JhY2stdG9wJyxcblx0XHQnYXJpYS1oaWRkZW4nOiB0cnVlLFxuXHRcdHRleHQ6IGJ1dHRvblRpdGxlLmRlc2Ncblx0fSApO1xuXG5cdGZ1bmN0aW9uIGNyZWF0ZUJ1dHRvbigpIHtcblx0XHRpZiAoICQoIHdpbmRvdyApLmlubmVyV2lkdGgoKSA8IDc2OCApIHtcblx0XHRcdGlmICggMCA9PT0gJCggJy5iYWNrLXRvcCcgKS5sZW5ndGggKSB7XG5cdFx0XHRcdCQoICcjcGFnZScgKS5hZnRlciggYnV0dG9uICk7XG5cdFx0XHR9XG5cblx0XHRcdCQoICcuYmFjay10b3AnICkub24oICdjbGljaycsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkKCAnaHRtbCwgYm9keScgKS5hbmltYXRlKCB7XG5cdFx0XHRcdFx0c2Nyb2xsVG9wOiAwXG5cdFx0XHRcdH0sIDI1MCApO1xuXHRcdFx0fSApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkKCAnLmJhY2stdG9wJyApLnJlbW92ZSgpO1xuXHRcdH1cblx0fVxuXG5cdCQoIGRvY3VtZW50ICkucmVhZHkoIGZ1bmN0aW9uKCkge1xuXHRcdCQoIHdpbmRvdyApXG5cdFx0XHQub24oICdsb2FkLnNob3JlZGl0Y2gnLCBjcmVhdGVCdXR0b24gKVxuXHRcdFx0Lm9uKCAncmVzaXplLnNob3JlZGl0Y2gnLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KCByZXNpemVUaW1lciApO1xuXHRcdFx0XHRyZXNpemVUaW1lciA9IHNldFRpbWVvdXQoIGNyZWF0ZUJ1dHRvbiwgMzAwICk7XG5cdFx0XHR9IClcblx0XHRcdC5vbiggJ3Njcm9sbC5zaG9yZWRpdGNoJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmICggJCggd2luZG93ICkuc2Nyb2xsVG9wKCkgPj0gJCggd2luZG93ICkuaW5uZXJIZWlnaHQoKSApIHtcblx0XHRcdFx0XHQkKCAnLmJhY2stdG9wJyApLnNsaWRlRG93biggMjUwICk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JCggJy5iYWNrLXRvcCcgKS5zbGlkZVVwKCAyNTAgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSApO1xuXHR9ICk7XG5cbn0gKSggalF1ZXJ5ICk7XG4iLCIvKiBnbG9iYWwgc2NyZWVuUmVhZGVyVGV4dCAqL1xuKCBmdW5jdGlvbiggJCApIHtcblxuXHR2YXIgYm9keSwgbWFzdGhlYWQsIG1lbnVUb2dnbGUsIHNpdGVNZW51LCBzaXRlTmF2aWdhdGlvbjtcblxuXHRmdW5jdGlvbiBpbml0TWFpbk5hdmlnYXRpb24oIGNvbnRhaW5lciApIHtcblxuXHRcdC8vIEFkZCBkcm9wZG93biB0b2dnbGUgdGhhdCBkaXNwbGF5cyBjaGlsZCBtZW51IGl0ZW1zLlxuXHRcdHZhciBkcm9wZG93blRvZ2dsZSA9ICQoICc8YnV0dG9uIC8+Jywge1xuXHRcdFx0J2NsYXNzJzogJ2Ryb3Bkb3duLXRvZ2dsZScsXG5cdFx0XHQnYXJpYS1leHBhbmRlZCc6IGZhbHNlXG5cdFx0fSApLmFwcGVuZCggJCggJzxzcGFuIC8+Jywge1xuXHRcdFx0J2NsYXNzJzogJ3NjcmVlbi1yZWFkZXItdGV4dCcsXG5cdFx0XHR0ZXh0OiBzY3JlZW5SZWFkZXJUZXh0LmV4cGFuZFxuXHRcdH0gKSApO1xuXG5cdFx0Y29udGFpbmVyLmZpbmQoICcubWVudS1pdGVtLWhhcy1jaGlsZHJlbiA+IGEnICkuYWZ0ZXIoIGRyb3Bkb3duVG9nZ2xlICk7XG5cblx0XHQvLyBUb2dnbGUgYnV0dG9ucyBhbmQgc3VibWVudSBpdGVtcyB3aXRoIGFjdGl2ZSBjaGlsZHJlbiBtZW51IGl0ZW1zLlxuXHRcdGNvbnRhaW5lci5maW5kKCAnLmN1cnJlbnQtbWVudS1hbmNlc3RvciA+IGJ1dHRvbicgKS5hZGRDbGFzcyggJ3RvZ2dsZWQtb24nICk7XG5cdFx0Y29udGFpbmVyLmZpbmQoICcuY3VycmVudC1tZW51LWFuY2VzdG9yID4gLnN1Yi1tZW51JyApLmFkZENsYXNzKCAndG9nZ2xlZC1vbicgKTtcblxuXHRcdC8vIEFkZCBtZW51IGl0ZW1zIHdpdGggc3VibWVudXMgdG8gYXJpYS1oYXNwb3B1cD1cInRydWVcIi5cblx0XHRjb250YWluZXIuZmluZCggJy5tZW51LWl0ZW0taGFzLWNoaWxkcmVuJyApLmF0dHIoICdhcmlhLWhhc3BvcHVwJywgJ3RydWUnICk7XG5cblx0XHRjb250YWluZXIuZmluZCggJy5kcm9wZG93bi10b2dnbGUnICkuY2xpY2soIGZ1bmN0aW9uKCBlICkge1xuXHRcdFx0dmFyIF90aGlzICAgICAgICAgICAgPSAkKCB0aGlzICksXG5cdFx0XHRcdHNjcmVlblJlYWRlclNwYW4gPSBfdGhpcy5maW5kKCAnLnNjcmVlbi1yZWFkZXItdGV4dCcgKTtcblxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0X3RoaXMudG9nZ2xlQ2xhc3MoICd0b2dnbGVkLW9uJyApO1xuXHRcdFx0X3RoaXMubmV4dCggJy5jaGlsZHJlbiwgLnN1Yi1tZW51JyApLnRvZ2dsZUNsYXNzKCAndG9nZ2xlZC1vbicgKTtcblxuXHRcdFx0Ly8ganNjczpkaXNhYmxlXG5cdFx0XHRfdGhpcy5hdHRyKCAnYXJpYS1leHBhbmRlZCcsIF90aGlzLmF0dHIoICdhcmlhLWV4cGFuZGVkJyApID09PSAnZmFsc2UnID8gJ3RydWUnIDogJ2ZhbHNlJyApO1xuXHRcdFx0Ly8ganNjczplbmFibGVcblx0XHRcdHNjcmVlblJlYWRlclNwYW4udGV4dCggc2NyZWVuUmVhZGVyU3Bhbi50ZXh0KCkgPT09IHNjcmVlblJlYWRlclRleHQuZXhwYW5kID8gc2NyZWVuUmVhZGVyVGV4dC5jb2xsYXBzZSA6IHNjcmVlblJlYWRlclRleHQuZXhwYW5kICk7XG5cdFx0fSApO1xuXHR9XG5cdGluaXRNYWluTmF2aWdhdGlvbiggJCggJy5tYWluLW5hdmlnYXRpb24nICkgKTtcblxuXHRtYXN0aGVhZCAgICAgICAgID0gJCggJyNtYXN0aGVhZCcgKTtcblx0bWVudVRvZ2dsZSAgICAgICA9IG1hc3RoZWFkLmZpbmQoICcjbWVudS10b2dnbGUnICk7XG5cdHNpdGVNZW51ICAgICAgICAgPSBtYXN0aGVhZC5maW5kKCAnI3NpdGUtbWVudScgKTtcblx0c2l0ZU5hdmlnYXRpb24gICA9IG1hc3RoZWFkLmZpbmQoICcjc2l0ZS1uYXZpZ2F0aW9uJyApO1xuXG5cdC8vIEVuYWJsZSBtZW51VG9nZ2xlLlxuXHQoIGZ1bmN0aW9uKCkge1xuXG5cdFx0Ly8gUmV0dXJuIGVhcmx5IGlmIG1lbnVUb2dnbGUgaXMgbWlzc2luZy5cblx0XHRpZiAoICEgbWVudVRvZ2dsZS5sZW5ndGggKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gQWRkIGFuIGluaXRpYWwgdmFsdWVzIGZvciB0aGUgYXR0cmlidXRlLlxuXHRcdG1lbnVUb2dnbGUuYWRkKCBzaXRlTmF2aWdhdGlvbiApLmF0dHIoICdhcmlhLWV4cGFuZGVkJywgJ2ZhbHNlJyApO1xuXG5cdFx0bWVudVRvZ2dsZS5vbiggJ2NsaWNrLnNob3JlZGl0Y2gnLCBmdW5jdGlvbigpIHtcblx0XHRcdCQoIHRoaXMgKS5hZGQoIHNpdGVNZW51ICkuYWRkKCBzaXRlTmF2aWdhdGlvbiApLnRvZ2dsZUNsYXNzKCAndG9nZ2xlZC1vbicgKTtcblxuXHRcdFx0Ly8ganNjczpkaXNhYmxlXG5cdFx0XHQkKCB0aGlzICkuYWRkKCBzaXRlTWVudSApLmFkZCggc2l0ZU5hdmlnYXRpb24gKS5hdHRyKCAnYXJpYS1leHBhbmRlZCcsICQoIHRoaXMgKS5hZGQoIHNpdGVOYXZpZ2F0aW9uICkuYXR0ciggJ2FyaWEtZXhwYW5kZWQnICkgPT09ICdmYWxzZScgPyAndHJ1ZScgOiAnZmFsc2UnICk7XG5cdFx0XHQvLyBqc2NzOmVuYWJsZVxuXHRcdH0gKTtcblx0fSApKCk7XG5cblx0Ly8gRml4IHN1Yi1tZW51cyBmb3IgdG91Y2ggZGV2aWNlcyBhbmQgYmV0dGVyIGZvY3VzIGZvciBoaWRkZW4gc3VibWVudSBpdGVtcyBmb3IgYWNjZXNzaWJpbGl0eS5cblx0KCBmdW5jdGlvbigpIHtcblx0XHRpZiAoICEgc2l0ZU5hdmlnYXRpb24ubGVuZ3RoIHx8ICEgc2l0ZU5hdmlnYXRpb24uY2hpbGRyZW4oKS5sZW5ndGggKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gVG9nZ2xlIGBmb2N1c2AgY2xhc3MgdG8gYWxsb3cgc3VibWVudSBhY2Nlc3Mgb24gdGFibGV0cy5cblx0XHRmdW5jdGlvbiB0b2dnbGVGb2N1c0NsYXNzVG91Y2hTY3JlZW4oKSB7XG5cdFx0XHRpZiAoIHdpbmRvdy5pbm5lcldpZHRoID49IDg5NiApIHtcblx0XHRcdFx0JCggZG9jdW1lbnQuYm9keSApLm9uKCAndG91Y2hzdGFydC5zaG9yZWRpdGNoJywgZnVuY3Rpb24oIGUgKSB7XG5cdFx0XHRcdFx0aWYgKCAhICQoIGUudGFyZ2V0ICkuY2xvc2VzdCggJy5tYWluLW5hdmlnYXRpb24gbGknICkubGVuZ3RoICkge1xuXHRcdFx0XHRcdFx0JCggJy5tYWluLW5hdmlnYXRpb24gbGknICkucmVtb3ZlQ2xhc3MoICdmb2N1cycgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gKTtcblx0XHRcdFx0c2l0ZU5hdmlnYXRpb24uZmluZCggJy5tZW51LWl0ZW0taGFzLWNoaWxkcmVuID4gYScgKS5vbiggJ3RvdWNoc3RhcnQuc2hvcmVkaXRjaCcsIGZ1bmN0aW9uKCBlICkge1xuXHRcdFx0XHRcdHZhciBlbCA9ICQoIHRoaXMgKS5wYXJlbnQoICdsaScgKTtcblxuXHRcdFx0XHRcdGlmICggISBlbC5oYXNDbGFzcyggJ2ZvY3VzJyApICkge1xuXHRcdFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRcdFx0ZWwudG9nZ2xlQ2xhc3MoICdmb2N1cycgKTtcblx0XHRcdFx0XHRcdGVsLnNpYmxpbmdzKCAnLmZvY3VzJyApLnJlbW92ZUNsYXNzKCAnZm9jdXMnICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9ICk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzaXRlTmF2aWdhdGlvbi5maW5kKCAnLm1lbnUtaXRlbS1oYXMtY2hpbGRyZW4gPiBhJyApLnVuYmluZCggJ3RvdWNoc3RhcnQuc2hvcmVkaXRjaCcgKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoICdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdyApIHtcblx0XHRcdCQoIHdpbmRvdyApLm9uKCAncmVzaXplLnNob3JlZGl0Y2gnLCB0b2dnbGVGb2N1c0NsYXNzVG91Y2hTY3JlZW4gKTtcblx0XHRcdHRvZ2dsZUZvY3VzQ2xhc3NUb3VjaFNjcmVlbigpO1xuXHRcdH1cblxuXHRcdHNpdGVOYXZpZ2F0aW9uLmZpbmQoICdhJyApLm9uKCAnZm9jdXMuc2hvcmVkaXRjaCBibHVyLnNob3JlZGl0Y2gnLCBmdW5jdGlvbigpIHtcblx0XHRcdCQoIHRoaXMgKS5wYXJlbnRzKCAnLm1lbnUtaXRlbScgKS50b2dnbGVDbGFzcyggJ2ZvY3VzJyApO1xuXHRcdH0gKTtcblx0fSApKCk7XG5cblx0Ly8gQWRkIHRoZSBkZWZhdWx0IEFSSUEgYXR0cmlidXRlcyBmb3IgdGhlIG1lbnUgdG9nZ2xlIGFuZCB0aGUgbmF2aWdhdGlvbnMuXG5cdGZ1bmN0aW9uIG9uUmVzaXplQVJJQSgpIHtcblx0XHRpZiAoIHdpbmRvdy5pbm5lcldpZHRoIDwgODk2ICkge1xuXHRcdFx0aWYgKCBtZW51VG9nZ2xlLmhhc0NsYXNzKCAndG9nZ2xlZC1vbicgKSApIHtcblx0XHRcdFx0bWVudVRvZ2dsZS5hdHRyKCAnYXJpYS1leHBhbmRlZCcsICd0cnVlJyApO1xuXHRcdFx0XHRzaXRlTWVudS5hdHRyKCAnYXJpYS1leHBhbmRlZCcsICd0cnVlJyApO1xuXHRcdFx0XHRzaXRlTmF2aWdhdGlvbi5hdHRyKCAnYXJpYS1leHBhbmRlZCcsICd0cnVlJyApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bWVudVRvZ2dsZS5hdHRyKCAnYXJpYS1leHBhbmRlZCcsICdmYWxzZScgKTtcblx0XHRcdFx0c2l0ZU1lbnUuYXR0ciggJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnICk7XG5cdFx0XHRcdHNpdGVOYXZpZ2F0aW9uLmF0dHIoICdhcmlhLWV4cGFuZGVkJywgJ2ZhbHNlJyApO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRtZW51VG9nZ2xlLnJlbW92ZUF0dHIoICdhcmlhLWV4cGFuZGVkJyApO1xuXHRcdFx0c2l0ZU1lbnUucmVtb3ZlQXR0ciggJ2FyaWEtZXhwYW5kZWQnICk7XG5cdFx0XHRzaXRlTmF2aWdhdGlvbi5yZW1vdmVBdHRyKCAnYXJpYS1leHBhbmRlZCcgKTtcblx0XHR9XG5cdH1cblxuXHQkKCBkb2N1bWVudCApLnJlYWR5KCBmdW5jdGlvbigpIHtcblx0XHRib2R5ID0gJCggZG9jdW1lbnQuYm9keSApO1xuXG5cdFx0JCggd2luZG93IClcblx0XHRcdC5vbiggJ2xvYWQuc2hvcmVkaXRjaCcsIG9uUmVzaXplQVJJQSApXG5cdFx0XHQub24oICdyZXNpemUuc2hvcmVkaXRjaCcsIG9uUmVzaXplQVJJQSApO1xuXHR9ICk7XG5cbn0gKSggalF1ZXJ5ICk7XG4iLCIvKipcbiAqIHNraXAtbGluay1mb2N1cy1maXguanNcbiAqXG4gKiBIZWxwcyB3aXRoIGFjY2Vzc2liaWxpdHkgZm9yIGtleWJvYXJkIG9ubHkgdXNlcnMuXG4gKlxuICogTGVhcm4gbW9yZTogaHR0cHM6Ly9naXQuaW8vdldkcjJcbiAqL1xuKCBmdW5jdGlvbigpIHtcblx0dmFyIGlzX3dlYmtpdCA9IG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5pbmRleE9mKCAnd2Via2l0JyApID4gLTEsXG5cdCAgICBpc19vcGVyYSAgPSBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkuaW5kZXhPZiggJ29wZXJhJyApICA+IC0xLFxuXHQgICAgaXNfaWUgICAgID0gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoICdtc2llJyApICAgPiAtMTtcblxuXHRpZiAoICggaXNfd2Via2l0IHx8IGlzX29wZXJhIHx8IGlzX2llICkgJiYgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgKSB7XG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdoYXNoY2hhbmdlJywgZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgaWQgPSBsb2NhdGlvbi5oYXNoLnN1YnN0cmluZyggMSApLFxuXHRcdFx0XHRlbGVtZW50O1xuXG5cdFx0XHRpZiAoICEgKCAvXltBLXowLTlfLV0rJC8udGVzdCggaWQgKSApICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggaWQgKTtcblxuXHRcdFx0aWYgKCBlbGVtZW50ICkge1xuXHRcdFx0XHRpZiAoICEgKCAvXig/OmF8c2VsZWN0fGlucHV0fGJ1dHRvbnx0ZXh0YXJlYSkkL2kudGVzdCggZWxlbWVudC50YWdOYW1lICkgKSApIHtcblx0XHRcdFx0XHRlbGVtZW50LnRhYkluZGV4ID0gLTE7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRlbGVtZW50LmZvY3VzKCk7XG5cdFx0XHR9XG5cdFx0fSwgZmFsc2UgKTtcblx0fVxufSkoKTtcbiJdfQ==

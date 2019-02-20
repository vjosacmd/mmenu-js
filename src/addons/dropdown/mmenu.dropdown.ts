Mmenu.addons.dropdown = function(
	this : Mmenu
) {
	if ( !this.opts.offCanvas ) {
		return;
	}

	var options = this.opts.dropdown,
		configs = this.conf.dropdown;


	//	Extend shorthand options
	if ( typeof options == 'boolean' && options ) {
		(options as mmLooseObject) = {
			drop: options
		};
	}

	if ( typeof options != 'object' ) {
		(options as mmLooseObject) = {};
	}

	if ( typeof options.position == 'string' ) {
		options.position = {
			of: options.position
		};
	}
	//	/Extend shorthand options


	this.opts.dropdown = Mmenu.extend( options, Mmenu.options.dropdown );


	if ( !options.drop ) {
		return;
	}


	var button : HTMLElement;

	this.bind( 'initMenu:after', () => {
		this.node.menu.classList.add( 'mm-menu_dropdown' );

		if ( typeof options.position.of != 'string' ) {
			let id = this.vars.orgMenuId;
			if ( id && id.length ) {
				options.position.of = '[href="#' + id + '"]';
			}
		}

		if ( typeof options.position.of != 'string' ) {
			return;
		}


		//	Get the button to put the menu next to
		button = Mmenu.DOM.find( document.body, options.position.of )[ 0 ];

		//	Emulate hover effect
		var events = options.event.split( ' ' );
		if ( events.length == 1 ) {
			events[ 1 ] = events[ 0 ];
		}

		if ( events[ 0 ] == 'hover' ) {
			button.addEventListener( 'mouseenter', ( evnt ) => {
				this.open();
			}, { passive: true });
		}

		if ( events[ 1 ] == 'hover' ) {
			this.node.menu.addEventListener( 'mouseleave', ( evnt ) => {
				this.close();
			}, { passive: true });
		}
	});


	//	Add/remove classname and style when opening/closing the menu
	this.bind( 'open:start', () => {
		this.node.menu[ 'mmStyle' ] = this.node.menu.getAttribute( 'style' );
		document.documentElement.classList.add( 'mm-wrapper_dropdown' );
	});

	this.bind( 'close:finish', () => {
		this.node.menu.setAttribute( 'style', this.node.menu[ 'mmStyle' ] );
		document.documentElement.classList.remove( 'mm-wrapper_dropdown' );
	});


	//	Update the position and sizes
	var getPosition = function( 
		this	: Mmenu,
		dir		: string,
		obj		: mmLooseObject
	) {
		var css = obj[ 0 ],
			cls = obj[ 1 ];

		var _scrollPos 	= dir == 'x' ? 'scrollLeft' 	: 'scrollTop',
			_outerSize 	= dir == 'x' ? 'offsetWidth' 	: 'offsetHeight',
			_startPos 	= dir == 'x' ? 'left' 			: 'top',
			_stopPos 	= dir == 'x' ? 'right' 			: 'bottom',
			_size 		= dir == 'x' ? 'width' 			: 'height',
			_winSize	= dir == 'x' ? 'innerWidth'		: 'innerHeight',
			_maxSize 	= dir == 'x' ? 'maxWidth' 		: 'maxHeight',
			_position 	= null;

		var scrollPos 	= document.documentElement[ _scrollPos ] || document.body[ _scrollPos ],
			startPos 	= Mmenu.DOM.offset( button, _startPos ) - scrollPos,
			stopPos 	= startPos + button[ _outerSize ],
			windowSize 	= window[ _winSize ];


		var offs = configs.offset.button[ dir ] + configs.offset.viewport[ dir ];

		//	Position set in option
		if ( options.position[ dir ] ) {
			switch ( options.position[ dir ] ) {
				case 'left':
				case 'bottom':
					_position = 'after';
					break;

				case 'right':
				case 'top':
					_position = 'before';
					break;
			}
		}

		//	Position not set in option, find most space
		if ( _position === null ) {
			_position = ( startPos + ( ( stopPos - startPos ) / 2 ) < windowSize / 2 ) ? 'after' : 'before';
		}

		//	Set position and max
		var val, max;
		if ( _position == 'after' ) {
			val = ( dir == 'x' ) ? startPos : stopPos;
			max = windowSize - ( val + offs );

			css[ _startPos ] = ( val + configs.offset.button[ dir ] ) + 'px';
			css[ _stopPos ]  = 'auto';

			if ( options.tip ) {
				cls.push( 'mm-menu_tip-' + ( dir == 'x' ? 'left' : 'top' ) );
			}

		} else {
			val = ( dir == 'x' ) ? stopPos : startPos;
			max = val - offs;

			css[ _stopPos ]  = 'calc( 100% - ' + ( val - configs.offset.button[ dir ] ) + 'px )';
			css[ _startPos ] = 'auto';

			if ( options.tip ) {
				cls.push( 'mm-menu_tip-' + ( dir == 'x' ? 'right' : 'bottom' ) );
			}
		}

		if ( options.fitViewport ) {
			css[ _maxSize ] = Math.min( configs[ _size ].max, max ) + 'px';
		}

		return [ css, cls ];
	};
	function position( 
		this : Mmenu
	) {
		if ( !this.vars.opened ) {
			return;
		}

		this.node.menu.setAttribute( 'style', this.node.menu[ 'mmStyle' ] );

		var obj : [ mmLooseObject, string[] ] = [{}, []];
			obj = getPosition.call( this, 'y', obj );
			obj = getPosition.call( this, 'x', obj );

		for ( let s in obj[ 0 ] ) {
			this.node.menu.style[ s ] = obj[ 0 ][ s ];
		}

		if ( options.tip ) {
			this.node.menu.classList.remove( 'mm-menu_tip-left', 'mm-menu_tip-right', 'mm-menu_tip-top', 'mm-menu_tip-bottom' );
			this.node.menu.classList.add( ...obj[ 1 ] );
		}
	};

	this.bind( 'open:start', position );

	window.addEventListener( 'resize', ( evnt ) => {
		position.call( this );
	}, { passive: true });

	if ( !this.opts.offCanvas.blockUI ) {
		window.addEventListener( 'scroll', ( evnt ) => {
			position.call( this );
		}, { passive: true });
	}

};

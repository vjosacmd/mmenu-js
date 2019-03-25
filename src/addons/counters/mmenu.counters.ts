import Mmenu from '../../core/oncanvas/mmenu.oncanvas';
import options from './_options';

import { extendShorthandOptions } from './_options';

Mmenu.options.counters = options;

Mmenu.configs.classNames.counters = {
	counter: 'Counter'
};


export default function(
	this : Mmenu
) {
	var options = extendShorthandOptions( this.opts.counters );
	this.opts.counters = Mmenu.extend( options, Mmenu.options.counters );


	//	Refactor counter class
	this.bind( 'initListview:after', (
		panel : HTMLElement
	) => {
		var cntrclss = this.conf.classNames.counters.counter,
			counters = panel.querySelectorAll( '.' + cntrclss );

		counters.forEach(( counter ) => {
			Mmenu.refactorClass( (counter as HTMLElement), cntrclss, 'mm-counter' );
		});
	});


	//	Add the counters after a listview is initiated.
	if ( options.add ) {
		this.bind( 'initListview:after', (
			panel : HTMLElement
		) => {

			if ( !panel.matches( options.addTo ) ) {
				return;
			}

			var parent : HTMLElement = panel[ 'mmParent' ];
			if ( parent ) {
				//	Check if no counter already excists.
				if ( !parent.querySelector( '.mm-counter' ) ) {
					let counter = Mmenu.DOM.create( 'span.mm-counter' );

					let btn = Mmenu.DOM.children( parent, '.mm-btn' )[ 0 ];
					if ( btn ) {
						btn.prepend( counter );
					}
				}
			}
		});
	}

	if ( options.count ) {
		function count(
			this 	 : Mmenu,
			panel	?: HTMLElement
		) {
			var panels = panel ? [ panel ] : Mmenu.DOM.children( this.node.pnls, '.mm-panel' );
			panels.forEach(( panel ) => {
				var parent : HTMLElement = panel[ 'mmParent' ];

				if ( !parent ) {
					return;
				}

				var counter = parent.querySelector( '.mm-counter' );
				if ( !counter ) {
					return;
				}

				var listitems : HTMLElement[] = [];
				Mmenu.DOM.children( panel, '.mm-listview' )
					.forEach(( listview ) => {
						listitems.push( ...Mmenu.DOM.children( listview ) );
					});

				counter.innerHTML = Mmenu.filterListItems( listitems ).length.toString();
			});
		};

		this.bind( 'initListview:after', count );
		this.bind( 'updateListview', count );
	}
};

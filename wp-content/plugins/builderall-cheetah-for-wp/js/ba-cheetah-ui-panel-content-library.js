(function($, BACheetah) {

    /**
    * Panel tab  controller. A controller object exists for each of the tabs
    * in the content panel.
    */
    var PanelTab = BACheetahExtendableObject.create({

        handle: "",

        name: "",

        panel: null,

        shouldShowTabItem: true,

        isShowing: false,

        views: {},

        activeView: null,

        defaultView: null,

        categorySelector: null,

        /**
        * Initialize the tab
        *
        * @param {Object} args
        * @return void
        */
        init: function(args) {

            // Order matters here

            // Init category selector
            this.categorySelector = CategorySelector.create({
                handle: 'selector-' + this.handle,
                tab: this,
                items: []
            });
            this.categorySelector.init();
            $(this.categorySelector).on('categorySelected', this.onViewSelected.bind(this));

            // Init view object
            var views = args.views;
            this.initViews(args.views);

            // Ensure at least one view
            if (Object.keys(this.views).length === 0) {
                var view = {
                    handle: "noViews",
                    name: "No Views",
                    templateName: "ba-cheetah-content-panel-no-view"
                };
                this.addView(view);
            }

            // Ensure an Active View
            if (!this.activeView) {
                var key = Object.keys(this.views)[0];
                var view = this.views[key];
                this.activeView = view;
            }
            this.defaultView = this.activeView;

            $(this.panel).on('afterRender', this.renderView.bind(this, this.activeView ));
            $(this.panel).on('onShow onShowTab', this.initScroller.bind(this) );
            BACheetah.addHook('contentItemsChanged', this.onLibraryDataChanged.bind(this));
        },

        /**
        * Initialize all views
        *
        * @param {Object} views
        * @return void
        */
        initViews: function(views) {
            for( var i in views) {
                var args = views[i];

                this.categorySelector.addItem(args);
                if ( 'separator' !== args.type ) {
                    this.addView(args);
                }
            }
        },

        /**
        * Init a new view and add to this.views
        *
        * @param {Object} args
        * @return void
        */
        addView: function(args) {

            var viewType = PanelView;
            switch(this.handle) {
                case 'modules':
                    viewType = ModulesPanelView;
                    break;
                case 'rows':
                    viewType = RowsPanelView;
                    break;
                case 'templates':
                    viewType = TemplatesPanelView;
                    break;
                case 'saved':
                    viewType = SavedPanelView;
                    break;
                default:
                    viewType = PanelView;
            }

            if (!_.isNull(this.viewController) && !_.isUndefined(this.viewController)) {
                viewType = window[this.viewController];
            }

            var view = viewType.create(args),
                handle = view.handle;

            view.init();

            this.views[handle] = view;
            if (view.isShowing) this.activeView = view;
        },

        /**
        * Render a view into the tab dom
        *
        * @param String | {Object} name
        * @return void
        */
        renderView: function(name) {

            this.$el = this.panel.$el.find('.ba-cheetah--panel-view[data-tab="' + this.handle + '"]');

            // Test if object was passed or string handle
            if (_.isObject(name)) {
                var view = name;
            } else {
                var view = this.views[name];
            }
            if (!_.isObject(view) || !_.isFunction(view.render)) return;

            var html = view.render();
            this.$el.find('.ba-cheetah-nanoscroller-content').html(html);

            this.activeView = view;

            BACheetah._initSortables();

            if ( this === this.panel.activeTab ) {
                this.renderGroupSelector();
            }

            this.initScroller();

            this.$el.find('.ba-cheetah-nanoscroller-content').scrollTop(0);
        },

        /**
        * Setup nanoscroller on the current panel view.
        *
        * @return void
        */
        initScroller: function() {
            this.$el.nanoScroller({
				alwaysVisible: true,
				preventPageScrolling: true,
				paneClass: 'ba-cheetah-nanoscroller-pane',
				sliderClass: 'ba-cheetah-nanoscroller-slider',
				contentClass: 'ba-cheetah-nanoscroller-content'
			});
        },

        /**
        * Show this tab
        *
        * @return void
        */
        show: function() {
            $(this.activeView).trigger('onBeforeShow');
            this.renderGroupSelector();
            this.isShowing = true;
            this.$el.addClass('is-showing');

            this.$el.find('.ba-cheetah-nanoscroller-content').scrollTop(0);
        },

        /**
        * Hide the tab
        *
        * @return void
        */
        hide: function() {
            this.isShowing = false;
            this.$el.removeClass('is-showing');
            if ( this.activeView !== this.defaultView ) {
                this.renderView( this.defaultView );
            }
            if (_.isObject(this.categorySelector)) {
                this.categorySelector.close();
            }
        },

        /**
        * Render the group selector into the panel header if tab has multiple views.
        *
        * @return void
        */
        renderGroupSelector: function() {
            var $groupSelect = this.panel.$groupSelect,
                $search = this.panel.$el.find('.ba-cheetah-panel-search');

            if ( this.isSearchEnabled ) {
                $search.show();
            } else {
                $search.hide();
            }

            if ( Object.keys(this.views).length > 0 && !_.isUndefined( this.categorySelector ) ) {

                var html = this.categorySelector.render(),
                    header = this.panel.$el.find('.ba-cheetah-content-group-select');

                $groupSelect.html(html);

                $groupSelect.show();
                this.panel.$el.removeClass('single-view');
            } else {
                $groupSelect.hide();
                $search.hide();
                this.panel.$el.addClass('single-view');
            }
			
			// hide panel controls in saved tab
			const panelControls = this.panel.$el.find('.ba-cheetah--panel-controls');
			this.handle === 'saved' ? panelControls.hide() : panelControls.show()
        },

        /**
        * Handle a view being chosen
        *
        * @param {Event} e
        * @param {Object} viewName
        * @return void
        */
        onViewSelected: function(e, viewName) {
            this.renderView(viewName);
            this.categorySelector.close();
        },

        /**
        * Handle update of library data
        *
        * @return void
        */
        onLibraryDataChanged: function() {
            this.renderView( this.activeView );
        },
    });

    /**
    * Panel view controller prototype. See controllers for module,
    * row, template and saved views below.
    */
    var PanelView = BACheetahExtendableObject.create({

        /**
        * The wp.template reference.
        */
        templateName: '',

        /**
        * String name of the view.
        */
        name: '',

        /**
        * String handle for the view.
        */
        handle: '',

        /**
        * Query to retrieve content items.
        */
        query: null,

        /**
        * Initialize view controller
        *
        * @return void
        */
        init: function() {
            this.template = wp.template(this.templateName);

            $(this).on('afterRender', this.bindEvents.bind(this));
            $(this).trigger('afterInit');
        },

        /**
        * Filter the data object before it's passed to the wp.template function
        *
        * @param {object} data
        * @return {object}
        */
        filterTemplateData: function(data) {

            if (!_.isNull(this.query) && !_.isUndefined(this.query)) {
                data.queryResults = BACheetah.Search.byQuery(this.query);
            }
            return data;
        },

        /**
        * Render view html.
        *
        * @return jQuery DOM
        */
        render: function() {
            $(this).trigger('beforeRender');

            var data = this;
            data = this.filterTemplateData(data);

            var $html = $(this.template(data));
            this.$el = $html;
            $(this).trigger('afterRender');
            return $html;
        },

        /**
        * Setup event listeners. Fired after render.
        *
        * @return void
        */
        bindEvents: function() {},

        /**
        * Stub for child objects to extend
        *
        * @return void
        */
        transitionIn:function() {},

        /**
        * Stub for child objects to extend
        *
        * @return void
        */
        transitionOut: function() {},
    });

    /**
    * Panel view controller for module views.
    */
    var ModulesPanelView = PanelView.create({

        /**
        * The wp.template reference.
        */
        templateName: 'ba-cheetah-content-panel-modules-view',

        /**
        * Bind Events
        *
        * @return void
        */
        bindEvents: function() {

            this.$sections = this.$el; // should really change this in the template.

            this.$items = this.$el.find('.ba-cheetah-block, .ba-cheetah-blocks-section-title');

			this.$collapsibleItems = this.$el.find('.ba-cheetah-blocks-section-header');

			this.$collapsibleItems.on('click', this.onCollapseModuleClicked.bind(this));

			this.$items.find('.ba-cheetah--element-denied').tipTip({edgeOffset: 25});
        },

		onCollapseModuleClicked: function(event) {
			$(event.delegateTarget).parent().toggleClass('is-collapsed')
		}
    });

    /**
    * Panel view controller for row views.
    */
    var RowsPanelView = PanelView.create({

        /**
        * The wp.template reference.
        */
        templateName: 'ba-cheetah-content-panel-row-templates-view',

        /**
        * Bind events
        *
        * @return void
        */
        bindEvents: function() {
            this.$items = this.$el.find('.ba-cheetah-block, .ba-cheetah-blocks-section-title');
			this.$items.find('.ba-cheetah--template-incompatible, .ba-cheetah--template-denied').tipTip({edgeOffset: 25});
			this.$items.find('.ba-preview-row').tipTip({edgeOffset: 5, defaultPosition: 'right'});
        },
    });

    /**
    * Panel view controller for template views
    */
    var TemplatesPanelView = PanelView.create({

        /**
        * The wp.template reference.
        */
        templateName: 'ba-cheetah-content-panel-templates-view',

        /**
        * Bind event listeners. Fires after render.
        *
        * @return void
        */
        bindEvents: function() {

            this.$items = this.$el.find('.ba-cheetah--template-collection-item');

            this.$items.find('.ba-cheetah--template-apply').on('click', this.onTemplateClick.bind(this));
			this.$items.find('.ba-cheetah--template-incompatible, .ba-cheetah--template-denied').tipTip({
				maxWidth: 100,
				edgeOffset: 25
			});

            this.$userTemplateSections = $('.ba-cheetah-user-templates');

            this.$userTemplates = this.$el.find('.ba-cheetah-user-template, .ba-cheetah--save-new-user-template');

            this.$saveNewTemplateInput = this.$el.find('.ba-cheetah-save-control input[name="template-name"]');
            this.$saveNewTemplateCat = this.$el.find('.ba-cheetah-save-control input[name="template-category"]');
            this.$saveNewTemplateBtn = this.$el.find('.ba-cheetah-save-control button');
            this.$saveNewMask = this.$el.find('.ba-cheetah-save-control-mask');

            this.$saveNewTemplateInput.on('focus', this.onSaveInputFocus.bind(this));
            this.$saveNewTemplateInput.on('keyup', this.onSaveInputKeyup.bind(this));
            this.$saveNewTemplateBtn.on('click', this.onSaveButtonClick.bind(this));
            this.$saveNewMask.on('click', this.resetSaveInput.bind(this));
        },

        /**
        * Handle input focus
        *
        * @return void
        */
        onSaveInputFocus: function() {
            this.resetSaveInput();
            this.$saveNewMask.show();
        },

        /**
        * Clear the input and collapse
        *
        * @return void
        */
        resetSaveInput: function() {
            this.$saveNewTemplateInput.val("");
            this.$saveNewTemplateBtn.hide();
            this.$saveNewMask.hide();
        },

        /**
        * Handle key up
        *
        * @param {Event} e
        * @return void
        */
        onSaveInputKeyup: function(e) {
            var input = $(e.currentTarget),
                value = input.val(),
                button = input.siblings('button');
            if (value !== '') {
                button.show();
            } else {
                button.hide();
            }
        },

        /**
        * Handle save button click
        *
        * @param {Event} e
        * @return void
        */
        onSaveButtonClick: function(e) {
            var button = $(e.currentTarget),
                value = button.siblings('input[name="template-name"]').val(),
                category = button.siblings('input[name="template-category"]').val(),
                settings = {
                    name: value,
                    category: category
                };

            if ("" !== value) {

                BACheetah.ajax({
					action: 'save_user_template',
					settings: settings,
				}, BACheetah._saveUserTemplateSettingsComplete);
            }
        },

        /**
        * Handle template clicked event
        * @return void
        */
        onTemplateClick: function(e) {
            var $item = $(e.currentTarget).closest('.ba-cheetah--template-collection-item'),
                id = $item.data('id'),
                type = $item.data('type'),
                content_central_id = $item.data('content-central-id');

			// BACheetah._showProMessage( $item.find( '.ba-cheetah--template-name' ).text() );
			BACheetah._requestTemplateInsert(id, type, content_central_id);
        },
    });

    /**
    * Panel view controller for saved modules and rows.
    */
    var SavedPanelView = PanelView.create({

        /**
        * The wp.template reference
        */
        templateName: 'ba-cheetah-content-panel-saved-view',

        /**
        * Filter the data before it's given to the template function
        *
        * @param {object} data
        * @return {object}
        */
        filterTemplateData: function(data) {

            data.queryResults = BACheetah.Search.byQuery({
                kind: "template",
                type: "user",
                content: ["module", "column", "row"]
            });

            return data;
        },
    });

    /**
    * Controller for category chooser.
    * One of these objects gets used by a PanelTab and rendered above the current panel view.
    */
    var CategorySelector = BACheetahExtendableObject.create({

        /**
        * The wp.template reference.
        */
        templateName: 'ba-cheetah-content-panel-category-selector',

        /**
        * Template function retreived by wp.template()
        */
        template: null,

        /**
        * Reference to the tab controller that owns this selector.
        */
        tab: null,

        /**
        * Whether or not the selector's menu is currently open.
        */
        isOpen: false,

        /**
        * The items to list in the menu
        */
        items: {},

        /**
        * Initial setup
        *
        * @return void
        */
        init: function() {
            this.template = wp.template(this.templateName);
            $(this).on('afterRender', this.bindEvents.bind(this));
            $(this.tab.panel).on('didShowSearchControls', this.close.bind(this) );
        },

        /**
        * Render the html for the selector. Requires this.tab to be set.
        *
        * @return jQuery DOM
        */
        render: function() {
            this.close();
            var $html = $(this.template(this));
            this.$el = $html;
            $(this).trigger('afterRender');
            return $html;
        },

        /**
        * Bind event listeners. Triggered after render.
        *
        * @return void
        */
        bindEvents: function() {
            this.$selectorTitle = this.$el.find('.ba-cheetah--selector-display');
            this.$selectorTitle.on('click', this.toggleOpenClose.bind(this));

            this.$categories = this.$el.find('.ba-cheetah--selector-menu .ba-cheetah--menu-item');
            this.$categories.on('click', this.onCategoryClick.bind(this));
        },

        /**
        * Add an item to the menu
        *
        * @param {object} item
        * @return void
        */
        addItem: function(item) {

            var handle;
            if( _.isUndefined(item.handle)) {
                handle = _.uniqueId('sep_');
            } else {
                handle = item.handle;
            }
            this.items[handle] = item;
        },

        /**
        * Open the menu.
        *
        * @return void
        */
        open: function() {
            if (this.isOpen) return;
            this.$el.addClass('is-showing');
            this.isOpen = true;
        },

        /**
        * Close the menu.
        *
        * @return void
        */
        close: function() {
            if (!this.isOpen) return;
            this.$el.removeClass('is-showing');
            this.isOpen = false;
            this.$selectorTitle.find("button").focus();
        },

        /**
        * Toggle the menu between open and closed states.
        *
        * @return void
        */
        toggleOpenClose: function() {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        },

        /**
        * Fired one would of the menu items is clicked.
        *
        * {Event} e
        * @return void
        */
        onCategoryClick: function( e ) {
			var item = $( e.target );
            var viewName = item.data( 'view' );

			if ( item.hasClass( 'ba-cheetah-has-children' ) ) {
				var children = $( '[data-parent="' + viewName + '"]' );

				if ( ! children.is( ':visible' ) ) {
					this.items[ viewName ].hasChildrenOpen = true;
					item.addClass( 'ba-cheetah-has-children-showing' );
					children.show();
				} else {
					this.items[ viewName ].hasChildrenOpen = false;
					item.removeClass( 'ba-cheetah-has-children-showing' );
					children.hide();
				}

				item.blur();
			} else {
				$( this ).trigger( 'categorySelected', viewName );
			}
        },
    });

    /**
    * Panel housing all the draggable content items and templates for the builder.
    */
    BACheetah.ContentPanel = BACheetahExtendableObject.create({

        /**
        * Name of the js template for the panel.
        */
        templateName: 'ba-cheetah-content-panel-base',

        /**
        * wp.template function to render the panel
        */
        template: null,

        /**
        * Tab section controller objects.
        */
        tabs: {},

        /**
        * A reference to the active tab controller object.
        */
        activeTab: null,

        /**
        * Whether or not the panel is currently visible.
        */
        isShowing: false,

        /**
        * Initialize and render the panel.
        *
        * @return void
        */
        init: function() {

            if (!BACheetahConfig.panelData) return;

            var items = BACheetahConfig.panelData.tabs;

            for( var i in items) {
                var item = items[i];

                tab = PanelTab.create(item);
                tab.panel = this;
                tab.views = {};
                tab.init(item);

                this.tabs[i] = tab;
                if (tab.isShowing) {
                    this.activeTab = tab;
                }

                if (!this.activeTab) {
                    var firstTab = Object.keys(this.tabs)[0];
                    var tab = this.tabs[firstTab];
                    tab.isShowing = true;
                    this.activeTab = tab;
                }
            }

            // Render panel
            this.template = wp.template(this.templateName);
            this.render();

            this.renderSearchResults = wp.template('ba-cheetah-search-results-panel');
            this.renderNoResults = wp.template('ba-cheetah-search-no-results');

            BACheetah.triggerHook('contentPanelDidInit');
        },

        /**
        * Render the base HTML for the panel
        *
        * @return void
        */
        render: function() {
            $('body').prepend(this.template(this));
            this.$el = $(".ba-cheetah--content-library-panel");
            this.bindEvents();
            this.$groupSelect = this.$el.find('.ba-cheetah-content-group-select');
			$(this).trigger('afterRender');
        },

        /**
        * Setup event listeners for the base panel.
        *
        * @return void
        */
        bindEvents: function() {

            this.$tabs = this.$el.find('.ba-cheetah--tabs [data-tab]');
            this.$tabs.on('mouseup', this.onTabItemMouseUp.bind( this ));
            this.$tabs.on('click', this.onTabItemClick.bind( this ));

            this.$search = this.$el.find('.ba-cheetah-panel-search');
            this.$searchBtn = this.$search.find('.ba-cheetah-toggle-panel-search');
            this.$searchInput = this.$search.find('input[name="search-term"]');
            this.$searchBtn.on('click', this.onSearchButtonClicked.bind(this) );
            this.$search.find('.ba-cheetah-dismiss-panel-search').on('click', this.onDismissButtonClicked.bind(this) );
            this.$searchInput.on('keyup', this.onSearchTermChanged.bind(this) );
            this.$searchPanel = this.$el.find('.ba-cheetah--search-results-panel');

            BACheetah.addHook('showContentPanel', this.show.bind( this ));
            BACheetah.addHook('showModules', this.show.bind( this, 'modules' ));
            BACheetah.addHook('showRows', this.show.bind( this, 'rows' ));
            BACheetah.addHook('showTemplates', this.show.bind( this, 'templates' ));
            BACheetah.addHook('showSaved', this.show.bind( this, 'saved' ));
            BACheetah.addHook('showSearch', this.goToSearch.bind(this) );

            var hide = this.hide.bind(this);
            BACheetah.addHook('hideContentPanel', hide );
            BACheetah.addHook('didShowLightbox', hide );
            BACheetah.addHook('didShowPublishActions', hide );
            BACheetah.addHook('didBeginSearch', hide );
            BACheetah.addHook('didInitDrag', hide );
            BACheetah.addHook('didOpenMainMenu', hide );
            BACheetah.addHook('didApplyTemplate', hide );

            var toggle = this.toggleShowHide.bind( this );
            BACheetah.addHook('toggleContentPanel', toggle );

            BACheetah.addHook('didStopDrag', this.hideSearchControls.bind(this) );
        },

        /**
        * Align the panel arrow with the + button
        */
        alignPanelArrow: function() {
            var $panel = this.$el,
                panelOffset = null,
                $arrow = this.$el.find('.ba-cheetah--panel-arrow'),
                $button = $('.ba-cheetah-content-panel-button'),
                arrowOffset,
                arrowX,
                animationDuration = this.$el.css('animation-duration');

            if ( $button.length == 0 ) return;
            this.$el.css('animation-duration', '0s');
            this.show();
            panelOffset = $panel[0].getBoundingClientRect();
            arrowOffset = $arrow[0].getBoundingClientRect();
            this.hide();
            this.$el.css('animation-duration', animationDuration );

            var buttonOffset = $button[0].getBoundingClientRect();
            var buttonCenterX = buttonOffset.x + ( buttonOffset.width / 2 );


            if ( buttonCenterX < panelOffset.x ) {
                // move the panel & the arrow
                arrowX = 20;
            } else {
                arrowX = ( buttonCenterX - panelOffset.x ) - ( arrowOffset.width / 2 );
            }

            /* Position the arrow */
            $arrow.css({
                right: 'auto',
                left: arrowX + 'px'
            });
        },

        /**
        * Show content panel
        *
        * @param String tabName
        * @return void
        */
        show: function(tabName) {

			if ( 'module' === BACheetahConfig.userTemplateType || BACheetahConfig.simpleUi ) {
				return;
			}

            BACheetah.triggerHook('willShowContentPanel');

            if (typeof tabName !== 'undefined') {
                this.showTab(tabName);
            }

            if (this.isShowing) return;

            // Save existing settings first if any exist. Don't proceed if it fails.
			if ( ! BACheetah._triggerSettingsSave( false, true ) ) {
				return;
			}

            $('body').addClass('ba-cheetah-content-panel-is-showing');
            this.isShowing = true;
            $(this).trigger('onShow');
            BACheetah.triggerHook('didShowContentPanel');

            // Clear any visible registered panels
            if ( 'Builder' in BA && 'data' in BA.Builder ) {
                const actions = BA.Builder.data.getSystemActions()
                actions.hideCurrentPanel()
            }
        },

        /**
        * Hide content panel
        *
        * @return void
        */
        hide: function() {
            if ( ! this.isShowing ) {
	            return;
            } else if ( this.$el.hasClass( 'ba-cheetah-ui-pinned' ) ) {
	            return;
            }

            $('body').removeClass('ba-cheetah-content-panel-is-showing');
            this.isShowing = false;
            $(this).trigger('onHide');
            BACheetah.triggerHook('didHideContentPanel');
        },

        /**
        * Toggle between show and hide states.
        *
        * @return void
        */
        toggleShowHide: function() {
            if (this.isShowing) {
                this.hide();
            } else {
                this.show();
            }
        },

        /**
        * Display one of the panel tabs
        *
        * @param String handle
        * @return void
        */
        showTab: function(handle) {
            var tab = this.tabs[handle];
            if (!_.isObject(tab)) return;

            if (_.isObject(this.activeTab)) {
				if (this.activeTab.handle == 'modules') {
					BACheetah._triggerSettingsSave(false, false, false)
				}
                this.activeTab.hide();
                this.$tabs.filter('.is-showing').removeClass('is-showing');
            }
            this.hideSearchControls();
            tab.show();
            this.$tabs.filter('[data-tab="' + tab.handle + '"]').addClass('is-showing');
            this.activeTab = tab;
            $(this).trigger('onShowTab');
        },

        goToSearch: function() {
            this.show('modules');
            this.$el.find('.ba-cheetah-toggle-panel-search').trigger('click');
        },

        onTabItemMouseUp: function(e) {
            $(e.currentTarget).blur();
        },

        /**
        * Handle tab clicks.
        *
        * @param {Event} e
        * @return void
        */
        onTabItemClick: function(e) {
            var el = $(e.target),
                name = el.data('tab');
            this.showTab(name);
        },

        /**
        * Handle search icon click
        */
        onSearchButtonClicked: function() {
            this.showSearchControls();
        },

        onDismissButtonClicked: function() {
            this.hideSearchControls();
            this.$searchBtn.focus();
        },

        showSearchControls: function() {
            this.$search.addClass('is-showing-input');
            this.$search.find('input[name="search-term"]').focus();

            $('.ba-cheetah--selector-display-label').attr('tabindex', -1 );
            this.$searchBtn.attr('tabindex', -1 );

            $(this).trigger('didShowSearchControls');
        },

        hideSearchControls: function() {
            this.$search.removeClass('is-showing-input');
            this.clearSearchInput();
            this.hideSearchResults();
            $('.ba-cheetah--selector-display-label').attr('tabindex', null );
            this.$searchBtn.attr('tabindex', null );
        },

        onSearchTermChanged: function(e) {
            var value = this.$searchInput.val();
            if ( "" !== value ) {
                var results = BACheetah.Search.byTerm(value);
                if (results.term != "") {
                	this.showSearchResults(results);
                } else {
                	this.hideSearchResults();
                }
            } else {
                this.hideSearchResults();
            }
        },

        clearSearchInput: function() {
            this.$searchInput.val("");
            this.hideSearchResults();
        },

        /**
        * Display the found results in the results panel.
        * @var Object - the found results
        * @return void
        */
        showSearchResults: function(data) {

            if (data.total > 0) {
                var $html = $(this.renderSearchResults(data));
    			this.$searchPanel.html($html);

    			BACheetah._initSortables();
            } else {
                var $html = $(this.renderNoResults(data));
    			this.$searchPanel.html($html);
            }
			$('body').addClass('ba-cheetah-search-results-panel-is-showing');
        },

        /**
        * Hide the search results panel
        * @return void
        */
        hideSearchResults: function() {
        	$('body').removeClass('ba-cheetah-search-results-panel-is-showing');
        },

    });

})(jQuery, BACheetah);

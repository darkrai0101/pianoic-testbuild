(function () {
    CAAT.Button = function () {
        CAAT.Button.superclass.constructor.call(this);
        return this;
    }

    CAAT.Button.prototype = {
        director: null,
        buttonImage: null,
        iNormal: null,
        iPress: null,
        iDisabled: null,
        iOver: null,
        fn: null,
        dragFn: null,
        upFn:null,
        enabled: null,

        isDrag: false,
        /**
        * Set this actor behavior as if it were a Button. The actor size will be set as SpriteImage's
        * single size.
        *
        * @param buttonImage {CAAT.Foundation.SpriteImage} sprite image with button's state images.
        * @param iNormal {number} button's normal state image index
        * @param iOver {number} button's mouse over state image index
        * @param iPress {number} button's pressed state image index
        * @param iDisabled {number} button's disabled state image index
        * @param fn {function(button{CAAT.Foundation.Actor})} callback function
        */
        initialize: function (director,  buttonImage, iNormal, iOver, iPress, iDisabled, fn, dragFn,upFn,enterFn,exitFn) {
            this.director = director;
            this.buttonImage = buttonImage;
            this.setBackgroundImage(buttonImage, true);
            this.iNormal = iNormal || 0;
            this.iOver = iOver || this.iNormal;
            this.iPress = iPress || this.iNormal;
            this.iDisabled = (typeof iDisabled == "undefined")? this.iNormal: iDisabled;
            this.fn = fn;
            this.dragFn = dragFn || function () { };
            this.upFn = upFn || function () { };
			this.enterFn = enterFn || function () { };
			this.exitFn = exitFn || function () { };
            this.enabled = true;
            this.setSpriteIndex(iNormal);
            
            return this;
        },

        /**
        * This method will set action performed for button when mousedown/touchstart
        * @param fn {function}
        * @ignore
        */
        setActionPerformed: function(fn) {
            this.fn = fn;
            return this;
        },

        /**
        * This method will set action performed for button when mousedrag/touchdrag
        * @param fn {function}
        * @ignore
        */
        setDragAction: function (fn) {
            this.dragFn = fn;
            return this;
        },

        /**
       * This method will set action performed for button when mouseUp/touchUp
       * @param fn {function}
       * @ignore
       */
        setUpAction: function (fn) {
            this.upFn = fn;
            return this;
        },

        setDirector: function(director) {
            this.director = director;
            return this;
        },
        /**
        * Enable or disable the button.
        * @param enabled {boolean}
        * @ignore
        */
        setEnabled: function (enabled) {
            this.enabled = enabled;
            this.setSpriteIndex(enabled ? this.iNormal : this.iDisabled);
            return this;
        },
        /**
        * Return disabled state of button
        */
        isEnabled: function () {
            return this.enabled;
        },

        /**
        * Button's mouse enter handler. It makes the button provide visual feedback
        * @param mouseEvent {CAAT.Event.MouseEvent}
        * @ignore
        */
        mouseEnter: function (mouseEvent) {
            if (!this.enabled) {
                return;
            }
            this.setSpriteIndex(this.iOver);
			this.enterFn();
        },

        /**
         * Button's mouse exit handler. Release visual apperance.
         * @param mouseEvent {CAAT.MouseEvent}
         * @ignore
         */
        mouseExit: function (mouseEvent) {
            if (!this.enabled) {
                return;
            }
            this.setSpriteIndex(this.iNormal);
			this.exitFn();
        },
        /**
         * Button's tocuh handler.
         * @param mouseEvent {CAAT.MouseEvent}
         * @ignore
         */
        touchStart: function (e) {
            var self = this;
            touch = e.changedTouches[0];
            self._down(self, touch);
        },
        touchMove: function (e) {
            var self = this;
            touch = e.getSourceEvent().changedTouches[0]; //console.log(touch.screenY);
            self._drag(self, touch.pageX, touch.pageY);
        },
        touchEnd: function (e) {
            var self = this;
            touch = e.getSourceEvent().changedTouches[0];
            self._up(self, touch.pageX, touch.pageY);
        },

        /**
         * Button's mouse down handler.
         * @param mouseEvent {CAAT.MouseEvent}
         * @ignore
         */
        mouseDown: function (mouseEvent) {
            var self = this;
            self._down(self, mouseEvent.screenPoint.x,mouseEvent.screenPoint.y);
        },

        /**
         * Button's mouse up handler.
         * @param mouseEvent {CAAT.MouseEvent}
         * @ignore
         */
        mouseUp: function (mouseEvent) {
            var self = this;
            self._up(self, mouseEvent.screenPoint.x, mouseEvent.screenPoint.y);
        },

        /**
         * Button's mouse drag handler.
         * @param mouseEvent {CAAT.MouseEvent}
         * @ignore
         */
        mouseDrag: function (mouseEvent) {
            var self = this; 
            self._drag(self, mouseEvent.screenPoint.x, mouseEvent.screenPoint.y);
        },

        /**
         * Button's mouse click handler. Do nothing by default. This event handler will be
         * called ONLY if it has not been drag on the button.
         * @param mouseEvent {CAAT.MouseEvent}
         * @ignore
         */
        mouseClick: function (mouseEvent) {
        },
		/** Set scene for scene paused
		* @param setScene {scene}
         * @ignore
		*/
		setScene : function (scene){
			this.scene=scene;
			return this;
		},
        /** Event for touch and mouse */
        _down: function(self, ex, ey) {
            if (!self.enabled) {
                return;
            }
			if (self.scene&&self.scene.isTimePaused) {
				return;
			}
            self.isDrag = true;
            self.setSpriteIndex(self.iPress);
            self.fn(self,ex,ey);
        },

        _up: function (self, ex,ey) {
            if (!self.enabled) {
                return;
            }
			if (self.scene&&self.scene.isTimePaused) {
				return;
			}
            self.isDrag = false;
            self.setSpriteIndex(self.iOver);
            self.upFn(self, ex,ey);
        },

        _drag: function (self, ex,ey) {
            if (!self.enabled) {
                return;
            }
			if (self.scene&&self.scene.isTimePaused) {
				return;
			}
            if (self.isDrag) {
                self.dragFn(self,ex,ey);
            }
        }
    }
    extend(CAAT.Button, CAAT.Foundation.ActorContainer);
})()
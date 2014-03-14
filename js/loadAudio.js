AudioPreloader = function() {
	var descriptor= function(id, path, loader) {
		var self = this;
		this.id=    id;
		this.path=  path;
		
		this.loader= loader;
		this.load = function(){
			self.audio= new Howl({
				urls: 	typeof path == "string"?[path] : path,
				volume: 1,
				onload: function(){
					self.loader.onloadOne(self);
				}
			});
		}
		return this;
	};
	return {
		elements: [],
		loadedCount:0,
		addElement : function( id, path ) {
			this.elements.push( new descriptor(id,path,this));
			return this;
		},

		onloadOne : function( descriptor ) {
			if ( this.cloaded ) {
				this.cloaded(descriptor.id);
			}
			this.loadedCount++;
			
			if ( this.loadedCount===this.elements.length ) {
				if ( this.cfinished ) {
					this.cfinished( this.elements );
				}
			}
		},

		load: function( onfinished, onload_one) {

			this.cfinished= onfinished;
			this.cloaded= onload_one;
			
			for(var i=0; i<this.elements.length; i++ ) {
				this.elements[i].load();
			}

			return this;
		}
	}
}
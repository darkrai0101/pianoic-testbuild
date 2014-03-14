(function () {
    CAAT.SoundPiano = function () {
        CAAT.SoundPiano.superclass.constructor.call(this);
        return this;
    }
 CAAT.SoundPiano.prototype  = {
	
	initialize: function(director,audioDescriptor){
		this.director = director;
		this.audioDescriptor = audioDescriptor;
		this.audioObjects =  {};
		this.sfxChannelId = [];
		this.musicChannelId;
		this.audioMusic;
		this.sfxLength = 25;
		this.velocity = 127;
		return this;
	},
	playSfx: function(soundId){
		var self = this;
		if (soundId<25) {
			var mmm=soundId%5;
			switch(mmm){
				case 0:soundId=(soundId/5>>0)*12+1; break;
				case 1:soundId=(soundId/5>>0)*12+3;break;
				case 2:soundId=(soundId/5>>0)*12+6;break;
				case 3:soundId=(soundId/5>>0)*12+8;break;
				case 4:soundId=(soundId/5>>0)*12+10;break;
			}			
		} else {

			soundId-=25;
			var mmm=soundId%7;
			switch(mmm){
				case 0:soundId=(soundId/7>>0)*12+0; break;
				case 1:soundId=(soundId/7>>0)*12+2;break;
				case 2:soundId=(soundId/7>>0)*12+4;break;
				case 3:soundId=(soundId/7>>0)*12+5;break;
				case 4:soundId=(soundId/7>>0)*12+7;break;
				case 5:soundId=(soundId/7>>0)*12+9;break;
				case 6:soundId=(soundId/7>>0)*12+11;break;
			}
		}
		soundId+=36;
		var delay = 0; // play one note every quarter second
                       
        var velocity = this.velocity; // how hard the note hits

		MIDI.noteOn(0,soundId, velocity, delay);
		MIDI.noteOff(0, soundId, delay + 5);
		return this;
	},
	playMusic: function(soundId,canplayCallback,justLoad){
		var self = this;
		this.musicChannelId = (soundId);
		var audio = this.audioObjects[soundId];
		var audioDescriptor = this.audioDescriptor;
		if(typeof audio == "undefined"){
			var i = 0;
			for(i;i<audioDescriptor.length;i++){
				if(audioDescriptor[i].id==soundId){
					break;
				}
			}
			audio = new Audio(audioDescriptor[i].path);
			this.audioObjects[audioDescriptor[i].id] = audio;
			if(!audio){
				return;
			}
			audio.addEventListener("canplay", function(){
				console.log("audio start");
				if(canplayCallback) canplayCallback();
			
				if(!justLoad){
					audio.volume=(self.director.globalVariables.SFX_VOLUME/100);
					audio.play();
				}
			});
			this.audioMusic = audio;
			this.loaded = false;
		}
		else{
			this.audioMusic = audio;
			this.loaded = true;
			if(canplayCallback) canplayCallback();
			if(!justLoad){
				audio.volume=(self.director.globalVariables.SFX_VOLUME/100);
				audio.play();
			}
		}
		audio.addEventListener("ended", function(){
			console.log("audio ended");
			self.musicChannelId = undefined;
		});
		
	},
	endMusic: function(){
		if(this.musicChannelId){
			if(this.musicChannelId) this.musicChannelId.pause();
			if(this.musicChannelId.currentTime) this.musicChannelId.currentTime = 0;
		}
		this.musicChannelId = undefined;
	},
	setVolume: function(value){
		if(value) this.director.globalVariables.SFX_VOLUME = value;
		if(this.musicChannelId) {
			var audio = this.audioObjects[this.musicChannelId];
			audio.volume=this.director.globalVariables.SFX_VOLUME/100;
		}
		this.velocity = (this.director.globalVariables.SFX_VOLUME*127/100)<<0;
	},
	setSfxVolume: function(value){
		if(value) this.director.globalVariables.SFX_VOLUME = value;
		for(var i=0;i<this.sfxChannelId.length;i++){
			var audio = this.audioObjects[this.sfxChannelId[i]];
			audio.volume=this.director.globalVariables.SFX_VOLUME/100;
		}
		return this;
	},
	setMusicVolume: function(value){
		this.director.globalVariables.MUSIC_VOLUME = value;
		var audio = this.audioObjects[this.musicChannelId];
		audio.volume(value/100);
		audio._audioNode[0].volume = (value/100);
		return this;
	}
}
 extend(CAAT.SoundPiano, CAAT.Foundation.ActorContainer);
})();
function get_browser(){
    var N=navigator.appName, ua=navigator.userAgent, tem;
    var M=ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
    if(M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
    M=M? [M[1], M[2]]: [N, navigator.appVersion, '-?'];
    return M[0];
}
function getExtension(src){
	return src.substr(src.lastIndexOf(".")+1);
}
function getName(src){
	return src.substr(src.lastIndexOf("/")+1);
}
var browserCheck = [];
browserCheck["ogg"] = ["Firefox","Opera","Chrome"];
browserCheck["mp3"] = ["Chrome","Safari"];
checkBrowser = function(extension){
	if(browserCheck[extension].indexOf(get_browser()!=-1)){
		return true;
	}
	else return false;
}

AudioPreloader = function() {
	var descriptor= function(id, path, loader) {
		var self = this;
		this.id=    id;
		
		this.loader= loader;
		this.load = function(){
			if(typeof path == "string") {
				self.path = path;
			}
			else{
				for(var i=0;i<path.length;i++){
					if(checkBrowser(getExtension(path[i]))){
						self.path = path[i];
						break;
					}
				}
				if(!self.path){
					for(var i=0;i<path.length;i++){
						if(getExtension(path[i]=="mp3")){
							self.path = path[i];
							break;
						}
					}
				}
				if(!self.path) self.path = path[0];
			}
			//console.log(self.path);
			self.loader.onloadOne(self)
		}
		return this;
	};
	return {
		elements: [],
		loadedCount:0,
		addElement : function( id, path ) {
			if(!path) path = id;
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


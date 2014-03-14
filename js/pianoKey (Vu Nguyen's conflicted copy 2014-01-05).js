
(function () {
    CAAT.HighScoreContainer = function () {
        CAAT.HighScoreContainer.superclass.constructor.call(this);
        return this;
    }

    CAAT.HighScoreContainer.prototype = {
        initialize: function (menuContainer,posX,posY,width,height) {
			var self = this;
            this.director = menuContainer.director;
			this.menuContainer = menuContainer;
			this.setBounds(posX,posY,width,height);
			this.difficultyText = ["EASY","HARD","INSANE"];
			this.playButtonWidth = 100;
			this.playButtonHeight = 40;
			this.playButtonY = this.height - 110;
            return this;
        },
        paint: function (director,time) {
			CAAT.HighScoreContainer.superclass.paint.call(this, director, time);
            var ctx = director.ctx;
			ctx.fillStyle = "#433";
			ctx.fillRect(this.width-5,0,5,this.height);
			ctx.fillStyle = "#FFF";
			ctx.font = "24px Verdana";
			var highScoreText = "HIGHSCORE";
			ctx.fillText(highScoreText,this.width/2 - ctx.measureText(highScoreText).width/2,60);
			var pointData=JSON.parse(localStorage.pianoHighscore);
			var score = pointData[SELECTING_RECORD][DIFFICULTY]+"";
			ctx.fillText(score,this.width/2 - ctx.measureText(score).width/2,100);
			
			var musicAllData = musicList[SELECTING_RECORD].Data;
			var singleMusicData;
			switch(DIFFICULTY){
				case DIFFICULTY_EASY: singleMusicData = musicAllData.Easy; break;
				case DIFFICULTY_HARD: singleMusicData = musicAllData.Hard; break;
				case DIFFICULTY_INSANE: singleMusicData = musicAllData.Insane; break;
			}
			var lastIndex = singleMusicData.NodeData.lastIndexOf(" ");
			var duration = ((singleMusicData.NodeData.substr(lastIndex+1)<<0)/1000)<<0;
			var minute = ""+((duration/60)>>0);
			minute = (minute.length==2)? minute : "0"+minute;
			var second = ""+((duration%60)>>0);
			second = (second.length==2)? second : "0"+second;
			var timeText = minute +" : "+ second;
			ctx.fillText(timeText,this.width/2-ctx.measureText(timeText).width/2,this.height-130);
			
			ctx.strokeStyle = "#FFF";
			ctx.strokeRect(this.width/2-this.playButtonWidth/2,this.playButtonY,this.playButtonWidth,this.playButtonHeight);
			var playText = "PLAY";
			ctx.fillText(playText,this.width/2-ctx.measureText(playText).width/2,this.playButtonY+30);
			for(var i=0;i<3;i++){
				ctx.fillStyle = (i==DIFFICULTY)?"#FFF":"#BBB";
				var text = this.difficultyText[i];
				ctx.fillText(text,this.width/2 - ctx.measureText(text).width/2,this.height/2+(i-1)*70);
			}
			
			if(this.loading){
				ctx.globalAlpha = 0.7;
				ctx.fillStyle = "#000";
				ctx.fillRect(-this.x,-this.y,director.width,director.height);
				ctx.fillStyle = "#FFF";
				var loadText = "LOADING.";
				var dotNumber = ((time/500)<<0)%4;
				for(var i=0;i<dotNumber;i++) loadText+="."
				ctx.fillText(loadText,this.width/2-60,this.height-30);
			}
            return this;
        },
		closeBehavior: function(type){
			var self = this;
			var path= new CAAT.PathUtil.LinearPath().
				setInitialPosition(this.x,this.y).
				setFinalPosition(-this.width,0);
			var pathBehavior= new CAAT.PathBehavior().setPath(path).setFrameTime(self.time,369).
			addListener({
				behaviorExpired: function(director,time){
					self.emptyBehaviorList();
				}
			});
			self.addBehavior(pathBehavior);
			if(type==2){
				if(self.loaded) this.menuContainer.playButton.fn();
			}
		},
		mouseDown: function(e){
			var self = this;
			if((e.x>this.width/4)&&(e.x<this.width*3/4)){
				for(var i=0;i<3;i++){
					if((e.y>this.height/2+(i-1)*70-50)&&(e.y<this.height/2+i*70-50)){
						DIFFICULTY = i;
						break;
					}
				}
			}
			if((e.x>this.width/2-this.playButtonWidth/2)&&(e.x<this.width/2+this.playButtonWidth/2)
				&&(e.y>this.playButtonY)&&(e.y<this.playButtonY+this.playButtonHeight)){
				self.playButtonFunction();
			}
		},
		playButtonFunction: function(){
			var self = this;
			self.menuContainer.stopButton.fn();
			self.loading = true;
			self.menuContainer.playListContainer.loading = true;
			self.enableEvents(false);
			self.menuContainer.playListContainer.enableEvents(false);
			var musicAllData = musicList[SELECTING_RECORD].Data;
			var singleMusicData;
			switch(DIFFICULTY){
				case DIFFICULTY_EASY: singleMusicData = musicAllData.Easy; break;
				case DIFFICULTY_HARD: singleMusicData = musicAllData.Hard; break;
				case DIFFICULTY_INSANE: singleMusicData = musicAllData.Insane; break;
			}
			var audioLink;
			if((!PLAY_FULL_FILE)&&(singleMusicData.Simple))audioLink = singleMusicData.Simple;
			else audioLink = singleMusicData.Full;
			Sound.playMusic(audioLink,
			function(){
				self.loaded = Sound.loaded;
				self.loading = false;
				self.menuContainer.playListContainer.loading = false;
				playingAudio = Sound.audioMusic;
				self.menuContainer.closeBehavior(2);
			},true);
		}
		
    }
    extend(CAAT.HighScoreContainer, CAAT.Foundation.ActorContainer);
})();

(function () {
    CAAT.PlayListContainer = function () {
        CAAT.PlayListContainer.superclass.constructor.call(this);
        return this;
    }

    CAAT.PlayListContainer.prototype = {
        initialize: function (menuContainer,posX,posY,width,height) {
			var self = this;
            this.director = menuContainer.director;
			this.menuContainer = menuContainer;
			this.setBounds(posX,posY,width,height);
			this.playListMaxSong = 7;
			this.textStartX = 70;
			this.textStartY = 180;
			this.textHeight = 60;
			this.offButtonPosition = {x:40,y:40};
			this.circleRadius = this.textHeight*0.3;
			this.scrollPosition = 0;
			
			var mouseWheelEventFn = function(e){
				var orientation = e.wheelDelta || -e.detail;
				if(!self.scrollBar) return;
				if(self.x<self.director.width){
					var delta = (self.scroller.maxHeight/self.scroller.maxValue)<<0;
					if(orientation>0){
						if(self.scroller.y>=delta)self.scroller.y-=delta;
						else self.scroller.y = 0;
					}
					else{
						if(self.scroller.y<=self.scroller.maxHeight-delta) self.scroller.y+=delta;
						else self.scroller.y = self.scroller.maxHeight;
					}
				}
			}
			
			window.onmousewheel = mouseWheelEventFn;
			document.addEventListener("DOMMouseScroll", mouseWheelEventFn);
			
			if(musicList.length>this.playListMaxSong){
				this.scrollBar = new CAAT.ActorContainer().
									setBounds(this.width-20,this.textStartY - this.textHeight*2/3,
											20,this.textHeight*this.playListMaxSong );
									//setFillStyle("#CCC");
				this.scroller = new CAAT.ActorContainer().
									setBounds(0,this.scrollBar.width/2 - 5,
											10,this.scrollBar.height/(musicList.length-this.playListMaxSong+1)).
									setFillStyle("#333").
									enableEvents(false).
									setAlpha(0.5);
				this.scrollBar.addChild(this.scroller);
				this.addChild(this.scrollBar);
				this.scroller.maxHeight = this.scrollBar.height-this.scroller.height;
				this.scroller.maxValue = musicList.length-this.playListMaxSong+1;
				this.scrollBar.mouseDown = function(e){
					if((e.y>self.scroller.y)&&(e.y<self.scroller.y+self.scroller.height)) {
						self.lastMouseY = e.y;
						self.dragging = true;
					}
				}
				this.scrollBar.mouseDrag = function(e){
					if(self.dragging){
						var nextY = self.scroller.y + e.y - self.lastMouseY;
						self.lastMouseY = e.y;
						if((nextY>=0)&&(nextY<=self.scrollBar.height - self.scroller.height)){
							self.scroller.y = nextY;
						}
					}
				}
				this.scrollBar.mouseUp = function(e){
					if(self.dragging) self.dragging = false;
				}
			}
            return this;
        },
        paint: function (director,time) {
			CAAT.PlayListContainer.superclass.paint.call(this, director, time);
            var ctx = director.ctx;
			
			var font = "22px Arial";
			ctx.font = "bold "+font;
			ctx.fillStyle = "#FFF";
			
			var headX = this.offButtonPosition.x;
			var headY = this.offButtonPosition.y;
			var textPosY = headY+10;
			var text = "SONG LIST";
			ctx.fillText(text,this.width/2 - ctx.measureText(text).width/2,textPosY);
			var textStartX = this.textStartX;
			var textStartY = this.textStartY;
			var textHeight = this.textHeight;
			
			ctx.strokeStyle = "#FFF";
			ctx.fillStyle = "#ECC";
			
			this.drawCircle(ctx,headX,headY,this.circleRadius);
			ctx.fillText("X",headX-ctx.measureText("X").width/2,textPosY);
			
			if(this.scrollBar) 	{
				var scrollPercent =  (100*(this.scroller.y/(this.scrollBar.height-this.scroller.height)))<<0;
				var percent = (scrollPercent==100)?scrollPercent-1:scrollPercent;
				this.scrollPosition = (this.scroller.maxValue*percent/100)<<0;
			}
			else this.scrollPosition = 0;
			var scrollPosition = this.scrollPosition
			if((SELECTING_RECORD-scrollPosition>=0)&&(SELECTING_RECORD-scrollPosition<this.playListMaxSong))
			ctx.fillRect(0,textStartY+textHeight*(SELECTING_RECORD-scrollPosition) - textHeight*2/3,this.width,textHeight);
			for(var i=scrollPosition;i<musicList.length;i++){
				if(i>=scrollPosition+this.playListMaxSong) return;
				ctx.fillStyle = (i==SELECTING_RECORD)?"#000":"#FFF";
				ctx.strokeStyle = (i==SELECTING_RECORD)?"#000":"#FFF";
				ctx.font = font;
				this.drawCircle(ctx,headX,textStartY+(i-scrollPosition)*textHeight - textHeight/6,this.circleRadius);
				var textPosY = textStartY+(i-scrollPosition)*textHeight;
				ctx.fillText(musicList[i].Name.toUpperCase(),textStartX,textPosY);
				ctx.font = "bold "+font;
				var numberText = ""+(i+1);
				ctx.fillText(numberText,headX-ctx.measureText(numberText).width/2,textPosY);
			}
			
            return this;
        },
		drawCircle: function(ctx,centerX,centerY,radius){
			ctx.save();
			ctx.beginPath()
			ctx.arc(centerX,centerY,radius,0,2*Math.PI);
			ctx.closePath();
			ctx.stroke();
			ctx.restore();
		},
		checkMouseInCircle: function(ex,ey,centerX,centerY,radius){
			if(Math.pow(centerX-ex,2)+Math.pow(centerY-ey,2)<Math.pow(radius,2)) return true;
			return false;
		},
		closeBehavior: function(type){
			var self = this;
			var path= new CAAT.PathUtil.LinearPath().
				setInitialPosition(this.x,this.y).
				setFinalPosition(this.director.width,0);
			var pathBehavior= new CAAT.PathBehavior().setPath(path).setFrameTime(self.time,369).
			addListener({
				behaviorExpired: function(director,time){
					self.emptyBehaviorList();
				}
			});
			self.addBehavior(pathBehavior);
			if(type == 1){
				SELECTING_RECORD = this.currentRecord;
				DIFFICULTY = this.currentDifficulty;
			}
		},
		mouseDown: function(e){
			var self = this;
			if(this.checkMouseInCircle(e.x,e.y,this.offButtonPosition.x,this.offButtonPosition.y,this.circleRadius)){
				this.menuContainer.closeBehavior(1);
			}
			var startY = this.textStartY - this.textHeight*2/3;
			for(var i=0;i<this.playListMaxSong;i++){
				if((e.y>startY+i*this.textHeight)&&(e.y<startY+(i+1)*this.textHeight)){
					SELECTING_RECORD = i+self.scrollPosition;
					break;
				}
			}
		},
		mouseDblClick: function(e){
			var self = this;
			var startY = this.textStartY - this.textHeight*2/3;
			for(var i=0;i<this.playListMaxSong;i++){
				if((e.y>startY+i*this.textHeight)&&(e.y<startY+(i+1)*this.textHeight)){
					SELECTING_RECORD = i+self.scrollPosition;
					self.menuContainer.highScoreContainer.playButtonFunction();
					break;
				}
			}
		}
		
    }
    extend(CAAT.PlayListContainer, CAAT.Foundation.ActorContainer);
})();

(function () {
    CAAT.SettingContainer = function () {
        CAAT.SettingContainer.superclass.constructor.call(this);
        return this;
    }

    CAAT.SettingContainer.prototype = {
        initialize: function (menuContainer,posX,posY,width,height) {
			var self = this;
            this.director = menuContainer.director;
			this.menuContainer = menuContainer;
			this.setBounds(posX,posY,width,height);
			this.offButtonPosition = {x:self.director.width - 70 ,y:40};
			this.circleRadius = 18;
			var settingList = [
				LANG.setting.autoplay[LANGUAGE],
				LANG.setting.playfile[LANGUAGE],
				LANG.setting.playfullfile[LANGUAGE]
			]
			this.settingFont = "bold 22px Arial";
			var settingTextWidth = [];
			this.director.ctx.font = this.settingFont;
			for(var i=0;i<settingList.length;i++){
				settingTextWidth.push(this.director.ctx.measureText(settingList[i]).width);
			}
			console.log(settingTextWidth);
			this.settingList = settingList;
			this.settingTextWidth = settingTextWidth;
			this.buttonStartX = 80;
			this.buttonStartY = 140;
			this.lineHeight = 40;
			this.lineSpace = 10;
            return this;
        },
        paint: function (director,time) {
			CAAT.SettingContainer.superclass.paint.call(this, director, time);
			var ctx = director.ctx;
			ctx.fillStyle = "#FFF";
			ctx.strokeStyle = "#FFF";
			ctx.font = "bold 30px Times New Roman";
			var settingText = LANG.setting.texts[LANGUAGE];
			ctx.fillText(settingText,this.width/2 - ctx.measureText(settingText).width/2,60);
			
			ctx.font = this.settingFont;
			this.drawCircle(ctx,this.offButtonPosition.x,this.offButtonPosition.y,this.circleRadius);
			ctx.fillText("X",this.offButtonPosition.x -ctx.measureText("X").width/2,this.offButtonPosition.y+10);
			var startX = this.buttonStartX ,startY = this.buttonStartY;
			var startTextX = startX + 30,startTextY = startY + 20;
			var textHeight = this.lineHeight + this.lineSpace;
			var settingList = this.settingList;
			for(var i=0;i<settingList.length;i++){
				var text = settingList[i];
				ctx.fillText(text,startTextX,startTextY + i*textHeight);
				ctx.strokeRect(startX,startY+i*textHeight,20,20);
			}
			var tickIcon = director.getImage("tickIcon");
			var iconPosX = startX-5;
			var iconPosY = startY-10;
			if(AUTOPLAY) ctx.drawImage(tickIcon,iconPosX,iconPosY,30,30);
			if(ENABLE_PLAY_FILE) ctx.drawImage(tickIcon,iconPosX,iconPosY+textHeight,30,30);
			if(PLAY_FULL_FILE) ctx.drawImage(tickIcon,iconPosX,iconPosY+textHeight*2,30,30);
            return this;
        },
		mouseDown: function(e){
			var self = this;
			if(this.checkMouseInCircle(e.x,e.y,this.offButtonPosition.x,this.offButtonPosition.y,this.circleRadius)){
				this.closeBehavior();
			}
			for(var i=0;i<this.settingList.length;i++){
				if((e.x>=this.buttonStartX)&&
				(e.x<=this.buttonStartX+30+this.settingTextWidth[i])&&
				(e.y>=this.buttonStartY+i*(this.lineHeight+this.lineSpace))&&
				(e.y<=this.buttonStartY+i*(this.lineHeight+this.lineSpace)+this.lineHeight)){
					switch(i){
						case 0:
							AUTOPLAY = !AUTOPLAY;
							break;
						case 1:
							ENABLE_PLAY_FILE = !ENABLE_PLAY_FILE;
							break;
						case 2:
							PLAY_FULL_FILE = !PLAY_FULL_FILE;
							break;
					}
				}
			}
		},
		drawCircle: function(ctx,centerX,centerY,radius){
			ctx.save();
			ctx.beginPath()
			ctx.arc(centerX,centerY,radius,0,2*Math.PI);
			ctx.closePath();
			ctx.stroke();
			ctx.restore();
		},
		checkMouseInCircle: function(ex,ey,centerX,centerY,radius){
			if(Math.pow(centerX-ex,2)+Math.pow(centerY-ey,2)<Math.pow(radius,2)) return true;
			return false;
		},
		closeBehavior: function(){
			var self = this;
			var path= new CAAT.PathUtil.LinearPath().
				setInitialPosition(this.x,this.y).
				setFinalPosition(this.director.width,0);
			var pathBehavior= new CAAT.PathBehavior().setPath(path).setFrameTime(self.time,369).
			addListener({
				behaviorExpired: function(director,time){
					self.emptyBehaviorList();
				}
			});
			self.addBehavior(pathBehavior);
		},
    }
    extend(CAAT.SettingContainer, CAAT.Foundation.ActorContainer);
})();
(function () {
    CAAT.MenuContainer = function () {
        CAAT.MenuContainer.superclass.constructor.call(this);
        return this;
    }

    CAAT.MenuContainer.prototype = {
        initialize: function (director,playList,posX,posY,width,height) {
			var self = this;
            this.director = director;
			this.currentScene = director.currentScene;
			this.setBounds(posX,posY,width,height);
			this.playList = playList;
			this.listNumber = playList.length;
			this.nameList = [];
			this.audioIdList = [];
			for(var i =0;i<playList.length;i++){
				this.nameList.push(playList[i].name);
				this.audioIdList.push(playList[i].audio);
			}
			this.setFillStyle("#9b2929");
			this.marginLeft = 5;
			this.lineHeight = 20;
			this.inAnimation = false;
			var playListImage =  new CAAT.SpriteImage().initialize(director.getImage("playListButton"),1,3);
			var playListButton = new CAAT.Button().initialize(director,playListImage,0,1,2,0,
			function(e){
				if(self.inAnimation) return;
				if(PLAYING_RECORD&&(!PAUSING_RECORD)) self.playButton.fn();
				else if(playingAudio.currentTime == 0)self.stopButton.fn();
				self.inAnimation = true;
				playListPosX = director.width/2 - 100;
				playListWidth = director.width - playListPosX;
				if(!this.firstTime){
					self.playListContainer = new CAAT.PlayListContainer().initialize(self,playListPosX,self.y,playListWidth,self.height).setFillStyle(self.fillStyle);
					self.highScoreContainer = new CAAT.HighScoreContainer().initialize(self,0,self.y,playListPosX,self.height).setFillStyle("#444");
				}
				else {
					self.playListContainer.setLocation(playListPosX,self.y);
					self.highScoreContainer.setLocation(0,self.y);
					self.highScoreContainer.enableEvents(true);
					self.playListContainer.enableEvents(true);
				}
				self.playListContainer.currentRecord = SELECTING_RECORD;
				self.playListContainer.currentDifficulty = DIFFICULTY;
				var path= new CAAT.PathUtil.LinearPath().
					setInitialPosition(director.width,self.y).
					setFinalPosition(self.playListContainer.x,self.playListContainer.y);
				var pathBehavior= new CAAT.PathBehavior().setPath( path ).setFrameTime(self.time,369).
				addListener({
					behaviorExpired: function(director,time){
						self.inAnimation = false;
					}
				});
				self.playListContainer.addBehavior(pathBehavior);
				
				var path2= new CAAT.PathUtil.LinearPath().
					setInitialPosition(-self.highScoreContainer.width,self.y).
					setFinalPosition(self.highScoreContainer.x,self.highScoreContainer.y);
				var pathBehavior2= new CAAT.PathBehavior().setPath( path2 ).setFrameTime(self.time,369);
				self.highScoreContainer.addBehavior(pathBehavior2);
				
				if(!this.firstTime){
					self.currentScene.addChild(self.playListContainer);
					self.currentScene.addChild(self.highScoreContainer);
					this.firstTime = true;
				}
			}).setLocation(this.width/2 - playListImage.singleWidth/2,20);
			
			this.playListButton = playListButton;
			this.addChild(playListButton);
			
			var volumeImage =  new CAAT.SpriteImage().initialize(director.getImage("volumeButton"),1,3);
			var volumeButton = new CAAT.Button().initialize(director,volumeImage,0,1,2,0,
			function(){
				self.volumeBar.setVisible(!self.volumeBar.visible);
			}).setLocation(this.width/2 - playListImage.singleWidth/2,this.height - 45);
			
			var volumeBarWidth = 200;
			var volumeBarHeight = 20;
			var volumeBar = new CAAT.ActorContainer().setBounds(this.x-volumeBarWidth,volumeButton.y+volumeButton.height/2-volumeBarHeight/2,volumeBarWidth,volumeBarHeight).setVisible(false);
			volumeBar.paint = function(director,time){
				var ctx = director.ctx;
				ctx.strokeStyle = "#FFF";
				ctx.lineWidth = 5;
				ctx.fillStyle = self.fillStyle;
				ctx.fillRect(0,0,(SFX_VOLUME/100*this.width)<<0,this.height);
				ctx.strokeRect(0,0,this.width,this.height);
			}
			volumeBar.mouseDown = function(e){
				Sound.setVolume((100*e.x/this.width)<<0);
				this.startX = e.x;
			}
			volumeBar.mouseDrag = function(e){
				var newVolume = SFX_VOLUME + (100*(e.x-this.startX)/this.width)<<0;
				this.startX = e.x;
				if((newVolume>=0)&&(newVolume<=100)) Sound.setVolume(newVolume);
			}
			this.volumeBar = volumeBar;
			this.currentScene.addChild(volumeBar);
			
			var settingImage =  new CAAT.SpriteImage().initialize(director.getImage("settingButton"),1,3);
			var settingButton = new CAAT.Button().initialize(director,settingImage,0,1,2,0,
			function(){
				if(self.inAnimation) return;
				if(PLAYING_RECORD&&(!PAUSING_RECORD)) self.playButton.fn();
				else if(playingAudio.currentTime == 0) self.stopButton.fn();
				self.inAnimation = true;
				if(!this.firstTime){
					self.settingBoard = new CAAT.SettingContainer().initialize(self,0,0,this.director.width,this.director.height).setFillStyle(self.fillStyle);
					
				}
				var path= new CAAT.PathUtil.LinearPath().
					setInitialPosition(director.width,self.y).
					setFinalPosition(self.y,self.y);
				var pathBehavior= new CAAT.PathBehavior().setPath( path ).setFrameTime(self.time,369).
				addListener({
					behaviorExpired: function(director,time){
						self.inAnimation = false;
					}
				});
				self.settingBoard.addBehavior(pathBehavior);
				if(!this.firstTime){
					this.firstTime = true;
					self.currentScene.addChild(self.settingBoard);
				}
				
			}).setLocation(this.width/2 - playListImage.singleWidth/2,this.height - 50 - settingImage.singleHeight);
			
			this.addChild(volumeButton);
			this.addChild(settingButton);
			
            return this;
        },
		closeBehavior:function(type){
			this.playListContainer.closeBehavior(type);
			this.highScoreContainer.closeBehavior(type);
		},
        paint: function (director,time) {
			CAAT.MenuContainer.superclass.paint.call(this, director, time);
            var ctx = director.ctx;

            return this;
        },
    }
    extend(CAAT.MenuContainer, CAAT.Foundation.ActorContainer);
})();

(function () {
    CAAT.KeyBoardContainer = function () {
        CAAT.KeyBoardContainer.superclass.constructor.call(this);
        return this;
    }

    CAAT.KeyBoardContainer.prototype = {
        initialize: function (director,keys,posX,posY,width,height) {
            this.director = director;
			this.keys = keys;
			this.setBounds(posX,posY,width,height);
            return this;
        },
        paint: function (director,time) {
			CAAT.KeyBoardContainer.superclass.paint.call(this, director, time);
            var ctx = director.ctx;
			if(!this.painted){
				this.painted = true;
				this.startTime = time;
			}
			if(time<this.startTime+1){
				for(var i=0;i<this.keys.length;i++) {
					var key = this.keys[i];
					var width = key.width;
					var height = key.height;
					var x = key.x;
					var y = key.y;
					ctx.fillStyle = (key.type == "white")?"#FFF":"#000";
					ctx.strokeStyle = "#000";
					var radius = 5;
					ctx.beginPath();
					ctx.moveTo(radius+x,  y);
					ctx.lineTo(width - radius+x, y);
					ctx.quadraticCurveTo(width+x, y, width+x, radius+y);
					ctx.lineTo(width+x, height - radius+y);
					ctx.quadraticCurveTo(width+x , height+y, width - radius+x, height+y);
					ctx.lineTo(radius+x, height+y);
					ctx.quadraticCurveTo(x, height+y, x, height - radius+y);
					ctx.lineTo(x, radius+y);
					ctx.quadraticCurveTo(x, y, radius+x, y);
					
					ctx.closePath();
					ctx.fill();
					ctx.stroke();
					ctx.fillStyle = (key.type == "black")?"#FFF":"#000";
					var keyString = String.fromCharCode(keyData[key.keyIndex].keyCode);
					if(key.type == "white") keyString = keyString.toLowerCase();
					ctx.fillText(keyString,x + width/2 - ctx.measureText(keyString).width/2,y+height-3);
				}
			}
			else if(!this.cached){
				this.cached = true;
				this.cacheAsBitmap(this.startTime,CAAT.Foundation.Actor.CACHE_DEEP);
			}
            return this;
        },
		
    }
    extend(CAAT.KeyBoardContainer, CAAT.Foundation.ActorContainer);
})();
(function () {
	CAAT.PianoKey = function () {
        CAAT.PianoKey.superclass.constructor.call(this);
        return this;
    }
    CAAT.PianoKey.prototype = {
	initialize : function (director,keyBoardActor, posX, posY, width, height, type, keyIndex) {
		this.director = director;
		this.keyBoardActor = keyBoardActor;
		this.x = posX;
		this.y = posY;
		this.width = width;
		this.height = height;
		this.keyIndex = keyIndex;
		this.hitting = false;
		this.type = type;
		var shadowGradient= director.ctx.createLinearGradient(0,0,0,height);
		shadowGradient.addColorStop(1,"#666");
		shadowGradient.addColorStop(0,"#FFF");
		this.shadow = new CAAT.ActorContainer().
			setBounds(posX,posY,width,height).
			setFillStyle(type=="white"?shadowGradient:"#555").
			setAlpha(0).
			enableEvents(false).setVisible(false);
		var fireEff=new CAAT.Foundation.SpriteImage().initialize(
                            director.getImage('fireEff'),  1, 5);
		this.fireEff = new CAAT.ActorContainer().
			setBounds(posX,posY-64,50,64).
			setBackgroundImage(fireEff,true).
			setAnimationImageIndex( [0,1,2,3,4] ).
			setChangeFPS(50).
			enableEvents(false).setVisible(false);
		keyBoardActor.addChild(this.shadow);
		keyBoardActor.addChild(this.fireEff);
		
		return this;
	},
	score: function(time){
		this.fireEff.setVisible(true).setFrameTime(time,300);
		return this;
	},
	hit : function(){
			var self = this;
			if(this.hitting){
				this.shadow.emptyBehaviorList();
			}
			this.hitting = true;
			var alphaBehavior = new CAAT.Behavior.AlphaBehavior().setValues(1, 0).setDelayTime(0, 1000).setCycle(false).
			addListener({
				behaviorExpired: function(director, time) {
					self.shadow.setVisible(false);
					self.shadow.emptyBehaviorList();
				}
			});
			this.shadow.addBehavior(alphaBehavior);
			this.shadow.setVisible(true);
			return this;
		}
	}
	extend(CAAT.PianoKey, CAAT.Foundation.ActorContainer);

})();
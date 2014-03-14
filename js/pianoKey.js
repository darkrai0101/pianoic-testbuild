
(function () {
    CAAT.HighScoreContainer = function () {
        CAAT.HighScoreContainer.superclass.constructor.call(this);
        return this;
    }

    CAAT.HighScoreContainer.prototype = {
        initialize: function (menuContainer,posX,posY,width,height) {
			var self = this;
            this.director = menuContainer.director;
			this.global = this.director.globalVariables;
			this.menuContainer = menuContainer;
			this.setBounds(posX,posY,width,height);
			this.difficultyText = ["EASY","HARD","INSANE"];
			this.playButtonWidth = 100;
			this.playButtonHeight = 40;
			this.playButtonY = this.height - 110;
			//readHash(menuContainer);
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
			//Check xem đã lưu điểm chưa, nếu chưa thì thêm vào
			
				
			//localStorage.pianoHighscore=JSON.stringify(pointData);
			var score;
			var global = this.global;
			var pointData = global.pointData;
			for (var i=0;i<pointData.length;i++)
				if(pointData[i].ID==global.SELECTING_RECORD)
					score = pointData[i].lv[global.DIFFICULTY]+"";
			ctx.fillText(score,this.width/2 - ctx.measureText(score).width/2,100);
			
			var musicAllData = musicList[global.SELECTING_RECORD].Data;
			var singleMusicData;
			switch(global.DIFFICULTY){
				case global.DIFFICULTY_EASY: singleMusicData = musicAllData.Easy; break;
				case global.DIFFICULTY_HARD: singleMusicData = musicAllData.Hard; break;
				case global.DIFFICULTY_INSANE: singleMusicData = musicAllData.Insane; break;
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
				ctx.fillStyle = (i==global.DIFFICULTY)?"#FFF":"#BBB";
				var text = this.difficultyText[i];
				ctx.fillText(text,this.width/2 - ctx.measureText(text).width/2,this.height/2+(i-1)*70);
			}
			
			if(!this.menuContainer.selectPlayList){
				ctx.strokeStyle = "#CCC";
				ctx.lineWidth = 7;
				ctx.strokeRect(0,0,this.width,this.height);
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
				this.global.JUST_LOAD_A_SONG = true;
				//if(self.loaded) this.menuContainer.playButton.fn();
			}
		},
		mouseDown: function(e){
			var self = this;
			if(self.menuContainer.inAnimation) return;
			if((e.x>this.width/4)&&(e.x<this.width*3/4)){
				for(var i=0;i<3;i++){
					if((e.y>this.height/2+(i-1)*70-50)&&(e.y<this.height/2+i*70-50)){
						this.global.DIFFICULTY = i;
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
			var global = this.director.globalVariables;
			if(self.menuContainer.inAnimation) return;
			self.menuContainer.stopButton.fn();
			self.loading = true;
			self.menuContainer.playListContainer.loading = true;
			self.enableEvents(false);
			self.menuContainer.playListContainer.enableEvents(false);
			var musicAllData = musicList[global.SELECTING_RECORD].Data;
			var singleMusicData;
			switch(global.DIFFICULTY){
				case global.DIFFICULTY_EASY: singleMusicData = musicAllData.Easy; break;
				case global.DIFFICULTY_HARD: singleMusicData = musicAllData.Hard; break;
				case global.DIFFICULTY_INSANE: singleMusicData = musicAllData.Insane; break;
			}
			var audioLink;
			if((!global.PLAY_FULL_FILE)&&(singleMusicData.Simple))audioLink = singleMusicData.Simple;
			else audioLink = singleMusicData.Full;
			global.Sound.playMusic(audioLink,
			function(){
				self.loaded = global.Sound.loaded;
				self.loading = false;
				self.menuContainer.playListContainer.loading = false;
				global.playingAudio = global.Sound.audioMusic;
				self.menuContainer.closeBehavior(2);
			},true);
			global.Sound.setVolume(global.SFX_VOLUME);
			var musicName=musicList[global.SELECTING_RECORD].Name;
			document.title ="Pianoic - "+musicName;
			var EName=UnSign(musicName);
			var arr_name=EName.split(" ");
			var completeName="";
			for (x in arr_name)
				completeName+=arr_name[x];
			location.hash="/"+1+"-"+musicList[global.SELECTING_RECORD].ID+"-"+global.DIFFICULTY+"/"+completeName;
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
			this.global = this.director.globalVariables;
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
			var scrollPosition = this.scrollPosition;
			var global = this.global;
			if((global.SELECTING_RECORD-scrollPosition>=0)&&(global.SELECTING_RECORD-scrollPosition<this.playListMaxSong))
			ctx.fillRect(0,textStartY+textHeight*(global.SELECTING_RECORD-scrollPosition) - textHeight*2/3,this.width,textHeight);
			for(var i=scrollPosition;i<musicList.length;i++){
				if(i>=scrollPosition+this.playListMaxSong) break;
				ctx.fillStyle = (i==global.SELECTING_RECORD)?"#000":"#FFF";
				ctx.strokeStyle = (i==global.SELECTING_RECORD)?"#000":"#FFF";
				ctx.font = font;
				this.drawCircle(ctx,headX,textStartY+(i-scrollPosition)*textHeight - textHeight/6,this.circleRadius);
				var textPosY = textStartY+(i-scrollPosition)*textHeight;
				ctx.fillText(musicList[i].Name.toUpperCase(),textStartX,textPosY-10);
				ctx.font = "15px Arial";
				ctx.fillText("Author: "+musicList[i].Author,textStartX,textPosY+10);
				
				ctx.font = "bold "+font;
				var numberText = ""+(i+1);
				ctx.fillText(numberText,headX-ctx.measureText(numberText).width/2,textPosY);
			}
			if(this.menuContainer.selectPlayList){
				ctx.strokeStyle = "#CCC";
				ctx.lineWidth = 7;
				ctx.strokeRect(0,0,this.width,this.height);
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
			self.menuContainer.inAnimation = true;
			var pathBehavior= new CAAT.PathBehavior().setPath(path).setFrameTime(self.time,369).
			addListener({
				behaviorExpired: function(director,time){
					self.emptyBehaviorList();
					self.menuContainer.inAnimation = false;
				}
			});
			self.addBehavior(pathBehavior);
			if(type == 1){
				this.global.SELECTING_RECORD = this.currentRecord;
				this.global.DIFFICULTY = this.currentDifficulty;
			}
		},
		mouseDown: function(e){
			var self = this;
			if(self.menuContainer.inAnimation) return;
			if(this.checkMouseInCircle(e.x,e.y,this.offButtonPosition.x,this.offButtonPosition.y,this.circleRadius)){
				this.menuContainer.closeBehavior(1);
			}
			var startY = this.textStartY - this.textHeight*2/3;
			for(var i=0;i<this.playListMaxSong;i++){
				if((e.y>startY+i*this.textHeight)&&(e.y<startY+(i+1)*this.textHeight)){
					this.global.SELECTING_RECORD = i+self.scrollPosition;
					break;
				}
			}
		},
		mouseDblClick: function(e){
			var self = this;
			if(self.menuContainer.inAnimation) return;
			var startY = this.textStartY - this.textHeight*2/3;
			for(var i=0;i<this.playListMaxSong;i++){
				if((e.y>startY+i*this.textHeight)&&(e.y<startY+(i+1)*this.textHeight)){
					this.global.SELECTING_RECORD = i+self.scrollPosition;
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
				LANG.setting.autoplay,
				LANG.setting.playfile,
				LANG.setting.playfullfile,
				LANG.setting.autopause,
				LANG.setting.keyboardText,
				LANG.setting.playbackText
			]
			this.settingList = settingList;
			this.settingFont = "bold 22px Arial";
			this.calculateText();
			this.buttonStartX = 80;
			this.buttonStartY = 140;
			this.lineHeight = 40;
			this.lineSpace = 10;
            return this;
        },
		calculateText: function(){
			this.settingFont = "bold 22px Arial";
			var settingTextWidth = [];
			this.director.ctx.font = this.settingFont;
			for(var i=0;i<this.settingList.length;i++){
				settingTextWidth.push(this.director.ctx.measureText(this.settingList[i][this.director.globalVariables.LANGUAGE]).width);
			}
			
			this.settingTextWidth = settingTextWidth;
		},
        paint: function (director,time) {
			CAAT.SettingContainer.superclass.paint.call(this, director, time);
			var ctx = director.ctx;
			ctx.fillStyle = "#FFF";
			ctx.strokeStyle = "#FFF";
			ctx.font = "bold 30px Times New Roman";
			var global = this.director.globalVariables;
			var settingText = LANG.setting.texts[global.LANGUAGE];
			ctx.fillText(settingText,this.width/2 - ctx.measureText(settingText).width/2,60);
			
			ctx.font = this.settingFont;
			this.drawCircle(ctx,this.offButtonPosition.x,this.offButtonPosition.y,this.circleRadius);
			ctx.fillText("X",this.offButtonPosition.x -ctx.measureText("X").width/2,this.offButtonPosition.y+10);
			var startX = this.buttonStartX ,startY = this.buttonStartY;
			var startTextX = startX + 30,startTextY = startY + 20;
			var textHeight = this.lineHeight + this.lineSpace;
			var settingList = this.settingList;
			for(i=0;i<settingList.length;i++){
				var text = settingList[i][global.LANGUAGE];
				ctx.fillText(text,startTextX,startTextY + i*textHeight);
				ctx.strokeRect(startX,startY+i*textHeight,20,20);
			}
			var languageTextE = LANG.setting.languageE[global.LANGUAGE];
			this.languageTextWidthE = ctx.measureText(languageTextE).width;
			var languageTextV = LANG.setting.languageV[global.LANGUAGE];
			this.languageTextWidthV = ctx.measureText(languageTextV).width;
			ctx.fillText(languageTextE,startTextX,startTextY + settingList.length*textHeight);
			ctx.strokeRect(startX,startY+settingList.length*textHeight,20,20);
			var space = (startTextX-startX)*2+this.languageTextWidthE;
			ctx.fillText(languageTextV,startTextX+space,startTextY + settingList.length*textHeight);
			ctx.strokeRect(startX+ space,startY+settingList.length*textHeight,20,20);
			var tickIcon = director.getImage("tickIcon");
			var iconPosX = startX-5;
			var iconPosY = startY-10;
			iconSize = 30;
			if(global.AUTOPLAY) ctx.drawImage(tickIcon,iconPosX,iconPosY,iconSize,iconSize);
			if(global.ENABLE_PLAY_FILE) ctx.drawImage(tickIcon,iconPosX,iconPosY+textHeight,iconSize,iconSize);
			if(global.PLAY_FULL_FILE) ctx.drawImage(tickIcon,iconPosX,iconPosY+textHeight*2,iconSize,iconSize);
			if(global.AUTO_PAUSE) ctx.drawImage(tickIcon,iconPosX,iconPosY+textHeight*3,iconSize,iconSize);
			if(global.SHOW_KEYBOARD_TEXT) ctx.drawImage(tickIcon,iconPosX,iconPosY+textHeight*4,iconSize,iconSize);
			if(global.SHOW_PLAYBACK_TEXT) ctx.drawImage(tickIcon,iconPosX,iconPosY+textHeight*5,iconSize,iconSize);
			ctx.drawImage(tickIcon,iconPosX + ((global.LANGUAGE==1)?space:0) ,iconPosY+textHeight*6,iconSize,iconSize);
            return this;
        },
		mouseDown: function(e){
			var self = this;
			var global = this.director.globalVariables;
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
							self.menuContainer.toggleAutoplay();
							break;
						case 1:
							self.menuContainer.toggleEnablePlayFile();
							break;
						case 2:
							global.PLAY_FULL_FILE = !global.PLAY_FULL_FILE;
							break;
						case 3:
							global.AUTO_PAUSE = !global.AUTO_PAUSE;
							break;
						case 4:
							global.SHOW_KEYBOARD_TEXT = !global.SHOW_KEYBOARD_TEXT;
							if(this.menuContainer.repaintKeyboard){
								this.menuContainer.repaintKeyboard();
							}
							break;
						case 5:
							global.SHOW_PLAYBACK_TEXT = !global.SHOW_PLAYBACK_TEXT;
							break;
					}
				}
			}
			if((e.y>=this.buttonStartY+this.settingList.length*(this.lineHeight+this.lineSpace))&&
			(e.y<=this.buttonStartY+this.settingList.length*(this.lineHeight+this.lineSpace)+this.lineHeight)){
				if((e.x>=this.buttonStartX)&&(e.x<=this.buttonStartX+30+this.languageTextWidthE)){
					global.LANGUAGE = 0;
					this.calculateText();
				}
				else if((e.x>=this.buttonStartX+60+this.languageTextWidthE)&&
				(e.x<=this.buttonStartX+90+this.languageTextWidthE+this.languageTextWidthV)){
					global.LANGUAGE = 1;
					this.calculateText();
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
		}
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
			var global = director.globalVariables;
			this.currentScene = director.currentScene;
			this.setBounds(posX,posY,width,height);
			this.hoverButton = -1;
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
			var deltaButton = this.width/2 - playListImage.singleHeight/2;
			this.deltaButton = deltaButton;
			
			var playListButton = new CAAT.Button().initialize(director,playListImage,0,1,2,0,
			function(e){
				global.JUST_LOAD_A_SONG = false;
				if(self.inAnimation) return;
				if(global.PLAYING_RECORD&&(!global.PAUSING_RECORD)) self.playButton.fn();
				else if(global.countingDown)self.stopButton.fn();
				self.inAnimation = true;
				var playListPosX = 300;
				var playListWidth = director.width - playListPosX;
				
				self.playListContainer.setLocation(playListPosX,self.y);
				self.highScoreContainer.setLocation(0,self.y);
				self.highScoreContainer.enableEvents(true);
				self.playListContainer.enableEvents(true);
				self.selectPlayList = true;
				self.playListContainer.currentRecord = global.SELECTING_RECORD;
				self.playListContainer.currentDifficulty = global.DIFFICULTY;
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
				
			},
			function(){},
			function(){},
			function(){self.hoverButton = 2;},
			function(){self.hoverButton = -1;}).setLocation(deltaButton,deltaButton);
			
			this.playListButton = playListButton;
			this.addChild(playListButton);
			
			var volumeImage =  new CAAT.SpriteImage().initialize(director.getImage("volumeButton"),1,3);
			var volumeButton = new CAAT.Button().initialize(director,volumeImage,0,1,2,0,
			function(){
				self.volumeBar.setVisible(!self.volumeBar.visible);
			},
			function(){},
			function(){},
			function(){self.hoverButton = 3;},
			function(){self.hoverButton = -1;}).setLocation(deltaButton,this.height - playListImage.singleHeight - deltaButton);
			
			

			var settingImage =  new CAAT.SpriteImage().initialize(director.getImage("settingButton"),1,3);
			var settingButton = new CAAT.Button().initialize(director,settingImage,0,1,2,0,
			function(){
				global.JUST_LOAD_A_SONG = false;
				if(self.inAnimation) return;
				if(global.PLAYING_RECORD&&(!global.PAUSING_RECORD)) self.playButton.fn();
				else if(global.countingDown) self.stopButton.fn();
				self.inAnimation = true;
				var path= new CAAT.PathUtil.LinearPath().
					setInitialPosition(director.width,self.y).
					setFinalPosition(self.y,self.y);
				var pathBehavior= new CAAT.PathBehavior().setPath( path ).setFrameTime(self.time,369).
				addListener({
					behaviorExpired: function(director,time){
						self.inAnimation = false;
					}
				});
				self.settingContainer.addBehavior(pathBehavior);

			},
			function(){},
			function(){},
			function(){self.hoverButton = 4;},
			function(){self.hoverButton = -1;}).setLocation(deltaButton,this.height - deltaButton*3 - settingImage.singleHeight*2)
				//.setVisible(false);
			var recordImage = new CAAT.SpriteImage().initialize(director.getImage("recordButton"),1,3);
			var menuWidth = 60;
			var buttonSize = recordImage.singleHeight;
			var buttonX = menuWidth/2 - buttonSize/2;
			var buttonYStart = CANVAS_HEIGHT/3;
			var buttonYDelta = menuWidth/2 - buttonSize/2;
			self.buttonSize = buttonSize;
			
		
		
		var playImage = new CAAT.SpriteImage().initialize(director.getImage("playButton"),1,3);
		var pauseImage = new CAAT.SpriteImage().initialize(director.getImage("pauseButton"),1,3);
		var playButton = new CAAT.Button().initialize(director,playImage,0,1,2,0,function(){
			if (playButton._isDown) playButton._isDown();
			global.JUST_LOAD_A_SONG = false;
			if(global.RECORDING||global.countingDown) return;
			if(!global.PLAYING_RECORD){
				global.countingDown = true;
				global.startCountdownTime = self.time;
				var musicAllData = musicList[global.SELECTING_RECORD].Data;
				var singleMusicData;
				switch(global.DIFFICULTY){
					case global.DIFFICULTY_EASY: singleMusicData = musicAllData.Easy; break;
					case global.DIFFICULTY_HARD: singleMusicData = musicAllData.Hard; break;
					case global.DIFFICULTY_INSANE: singleMusicData = musicAllData.Insane; break;
				}
				self.currentScene.recordData = stringToRecordData(singleMusicData.NodeData);
				if(self.currentScene.playFunction) self.currentScene.playFunction();
				global.PAUSING_RECORD = true;
				if(global.PLAY_FILE) global.playingAudio.pause();
			}
			else {
				if(!global.PAUSING_RECORD){
					global.PAUSING_RECORD = true;
					playButton.setBackgroundImage(playImage,true);
					if(global.PLAY_FILE) global.playingAudio.pause();
				}
				else{
					global.PAUSING_RECORD = false;
					if(global.PLAY_FILE) global.playingAudio.play();
					playButton.setBackgroundImage(pauseImage,true);
				}
			}

		},
		function(){},
		function(){},
		function(){self.hoverButton = 0;},
		function(){self.hoverButton = -1;}).
			setLocation(buttonX,buttonYStart-buttonSize-buttonYDelta*2);
			//setScaleAnchored(buttonSize/playImage.singleHeight,buttonSize/playImage.singleWidth,0,0);
		playButton.setPauseImage=function(){
			playButton.setBackgroundImage(pauseImage,true);
		}
		self.playButton = playButton;
		self.addChild(playButton);
		//Sự kiện khi chuyển tab
		var eventPause=function(on){
			if (on&&global.PLAYING_RECORD&&!global.PAUSING_RECORD)
		  		{
		  		self.playButton.fn();
			global.JUST_LOAD_A_SONG=true;
		  	}
		};
		window.onblur = function () {
			eventPause(global.AUTO_PAUSE);
		};
		var stopImage = new CAAT.SpriteImage().initialize(director.getImage("stopButton"),1,3);
		var stopButton = new CAAT.Button().initialize(director,stopImage,0,1,2,0,
		function(){
			if(global.RECORDING) return;
			global.JUST_LOAD_A_SONG = false;
			if (stopButton._isDown) stopButton._isDown();
			if(global.PLAYING_RECORD) {
				currentRecordIndex = 0;
				playButton.setBackgroundImage(playImage,true);
				global.PLAYING_RECORD = false;
				global.PAUSING_RECORD = false;
				if(global.PLAY_FILE){
					global.playingAudio.pause();
					global.playingAudio.currentTime = 0;
				}
				pausedStart = 0;
			}
		},
		function(){},
		function(){},
		function(){self.hoverButton = 1;},
		function(){self.hoverButton = -1;}).
			setLocation(buttonX,buttonYStart);
			//setScaleAnchored(buttonSize/stopImage.singleHeight,buttonSize/stopImage.singleWidth,0,0);
		self.stopButton = stopButton;
		self.addChild(stopButton);

		var shareImage = new CAAT.SpriteImage().initialize(director.getImage("shareButton"),1,3);
		var shareButton = new CAAT.Button().initialize(director,shareImage,0,1,2,0,function(){	
			var musicName=musicList[global.SELECTING_RECORD].Name;
			var EName=UnSign(musicName);
			var arr_name=EName.split(" ");
			var completeName="";
			for (x in arr_name)
				completeName+=arr_name[x];
			var text="http://pianoic.com/#/"+0+"-"+global.SELECTING_RECORD+"-"+global.DIFFICULTY+"/"+completeName;
			var linkshare="https://www.facebook.com/sharer/sharer.php?u=http://pianoic.com";
			//var dv=document.getElementById('basic-modal-content');
			//dv.innerHTML='<h3>'+LANG.popup.popuplinkshare+'</h3>\n <p>'+LANG.popup.copylink+'</p>\n <p id="code"><code>'+text+' </p>\n<p><input type="checkbox" name="vehicle" value="play" id="check">'+LANG.popup.isplay+'</p>\n<p><a href='+linkshare+' target="_blank"><img src="img/facebook.png" alt height="20">'+LANG.popup.share+'</a></p>';		
		 	$('#basic-modal-content').modal({autoResize :true,appendTo:'#frame',overlayClose :true,focus:false,onShow:function(){shareButton._show=true},_onClose:function(){shareButton._show=false}});
		 	document.getElementById('basic-modal-content').innerHTML='<h3 id="popuplinkshare"></h3>\n<p id="copylink">Examples:</p>\n<p><code id="code"></code></p>\n<p><input type="checkbox" name="vehicle" value="play" id="check"><span id="checkboxtxt"></span></input></p>\n<p><a href="https://www.facebook.com/sharer/sharer.php?u=http://pianoic.com" target="_blank"><img src="img/facebook.png" alt height="20"><span id="share"></span></a></p>';
		 	document.getElementById('popuplinkshare').innerHTML=LANG.popup.popuplinkshare[global.LANGUAGE];
		 	document.getElementById('copylink').innerHTML=LANG.popup.copylink[global.LANGUAGE];		 	
		 	document.getElementById('code').innerHTML=text;
		 	document.getElementById('checkboxtxt').innerHTML=" "+LANG.popup.isplay[global.LANGUAGE];
		 	document.getElementById('share').innerHTML=" "+LANG.popup.share[global.LANGUAGE];
		 	
			
		 	var checkbox=document.getElementById('check');
		 	checkbox.onchange=function(e){
		 		if (checkbox.checked) text="http://pianoic.com/#/"+1+"-"+global.SELECTING_RECORD+"-"+global.DIFFICULTY+"/"+completeName;
		 			else text="http://pianoic.com/#/"+0+"-"+global.SELECTING_RECORD+"-"+global.DIFFICULTY+"/"+completeName;
 				document.getElementById('code').innerHTML=''+text;
 				selectText('code');
		 	}
		 	
		 	eventPause(true);
		 	selectText('code');
		},
		function(){},
		function(){},
		function(){self.hoverButton = 5;},
		function(){self.hoverButton = -1;}).
			setLocation(buttonX,buttonYStart-buttonSize*2-buttonYDelta*4);
		shareButton._show=false;
		self.shareButton = shareButton;
		self.addChild(shareButton);

		var fullscreenImage = new CAAT.SpriteImage().initialize(director.getImage("fullscreenButton"),1,3);
		var fullscreenButton = new CAAT.Button().initialize(director,fullscreenImage,0,1,2,0,function(){	
			var element=document.getElementById('frame');
			var _isFullscreen=document.fullscreenElement || document.mozFullscreenElement || document.webkitFullscreenElement ? true : false;
			if (!_isFullscreen)  {
			  if(element.requestFullscreen) {
			    element.requestFullscreen();
			  } else if(element.mozRequestFullScreen) {
			    element.mozRequestFullScreen();
			  } else if(element.webkitRequestFullscreen) {
			  	element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
			    element.webkitRequestFullscreen();
			  } else if(element.msRequestFullscreen) {
			    element.msRequestFullscreen();
			  }
			  director.setScaleProportional2(window.screen.width, window.screen.height);
			} else {
			  if(document.exitFullscreen) {
			    document.exitFullscreen();
			  } else if(document.mozCancelFullScreen) {
			    document.mozCancelFullScreen();
			  } else if(document.webkitExitFullscreen) {
			    document.webkitExitFullscreen();
			  }
			}
		},
		function(){},
		function(){},
		function(){self.hoverButton = 6;},
		function(){self.hoverButton = -1;}).
			setLocation(buttonX,buttonYStart+buttonSize+buttonYDelta*2);
		self.fullscreenButton = fullscreenButton;
		self.addChild(fullscreenButton);

		var sheetImage = new CAAT.SpriteImage().initialize(director.getImage("sheetButton"),1,3);
		var sheetButton = new CAAT.Button().initialize(director,sheetImage,0,1,2,0,function(){
			var speed=0.5;	
			var recordData=self.currentScene.recordData;
			var record="";console.log(recordData)
			var length=recordData.length;
			var len1=length-1;
			for (var i=0;i<length;i++){
				var currentKey = keyData[recordData[i].keyIndex];
				var key="";
				if (currentKey.type == "white")
					key=String.fromCharCode(currentKey.keyCode).toLowerCase();
				else
					key=String.fromCharCode(currentKey.keyCode);
				var time=recordData[i].time;
				if (i!=len1)
					if (time==recordData[i+1].time){
						if (recordData[i].keyIndex!=recordData[i+1].keyIndex)
						record+=key;
					}					
					else if (recordData[i+1].time-time>1000*speed)
						record +=key +"</br>";
					else
						record+=key+" ";
			}
			$('#basic-modal-content').modal({autoResize :true,appendTo:'#frame',overlayClose :true,focus:false,onShow:function(){shareButton._show=true},_onClose:function(){shareButton._show=false},fixed:false});
		 	document.getElementById('basic-modal-content').innerHTML='<h3 id="popupsheet"></h3>\n<p id="copysheet">Examples:</p>\n<p><code id="code"></code></p>';
		 	document.getElementById('popupsheet').innerHTML=LANG.popup.popupsheet[global.LANGUAGE];
		 	document.getElementById('copysheet').innerHTML=LANG.popup.copysheet[global.LANGUAGE];		 	
		 	document.getElementById('code').innerHTML=record;
		 	//document.getElementById('share').innerHTML=" "+LANG.popup.share[global.LANGUAGE];
		 	document.getElementById('code').onmousedown=function(){selectText('code')}
		 	selectText('code');
		 	eventPause(true);
		},
		function(){},
		function(){},
		function(){self.hoverButton = 7;},
		function(){self.hoverButton = -1;}).
			setLocation(buttonX,buttonYStart+buttonSize*2+buttonYDelta*4);
		self.sheetButton = sheetButton;
		self.addChild(sheetButton);

		//playButton.mouseClick=function(e){,director);};
		//stopButton.mouseClick=function(e){exitFullscreen()};
			this.volumeButton = volumeButton;
			this.settingButton = settingButton;
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
			ctx.fillStyle = "#DDD";
			var button;
			switch(this.hoverButton){
				case 0:
					button = this.playButton;
					break;
				case 1:
					button = this.stopButton;
					break;
				case 2:
					button = this.playListButton;
					break;
				case 3:
					button = this.volumeButton;
					break;
				case 4:
					button = this.settingButton;
					break;
				case 5:
					button = this.shareButton;
					break;
				case 6:
					button = this.fullscreenButton;
					break;
				case 7:
					button = this.sheetButton;
					break;
			}
			if(button){
				ctx.fillRect(0,button.y-this.deltaButton,this.width,button.height+this.deltaButton*2);
			}
            return this;
        }
    }
    function selectText(element) {
			    var doc = document
			        , text = doc.getElementById(element)
			        , range, selection;    
			    if (doc.body.createTextRange) { //ms
			        range = doc.body.createTextRange();
			        range.moveToElementText(text);
			        range.select();
			    } else if (window.getSelection) { //all others
			        selection = window.getSelection();        
			        range = doc.createRange();
			        range.selectNodeContents(text);
			        selection.removeAllRanges();
			        selection.addRange(range);
			    }
			}
    function stringToRecordData(str){
			var outputData = [];
			if(str.length==0) return outputData;
			var stringArray = str.split(",");
			//console.log(stringArray.length);
			for(var i=0;i<stringArray.length;i++){
				var temp = stringArray[i].split(" ");
				if(temp[0].charCodeAt(0)>57){
					for(var j=0;j<keyData.length;j++){
						if(temp[0] === keyData[j].name){
							temp[0] = j;
							break;
						}
					}
				}
				outputData.push({keyIndex:temp[0]<<0,time:temp[1]<<0});
			}
			return outputData;
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
					ctx.font = "20px Times New Roman";
					if(this.director.globalVariables.SHOW_KEYBOARD_TEXT) ctx.fillText(keyString,x + width/2 - ctx.measureText(keyString).width/2,y+height-3);
				}
			}
			else if(!this.cached){
				this.cached = true;
				this.cacheAsBitmap(this.startTime,CAAT.Foundation.Actor.CACHE_DEEP);
			}
            return this;
        },
		repaint: function(){
			this.painted  = false;
			this.stopCacheAsBitmap();
		}
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
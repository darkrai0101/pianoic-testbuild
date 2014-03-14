(function () {
	var statBg,
		statPerfect,
		statGreat,
		statCool,
		statNotbad,
		statMissed,
		statPassed,
		statTotal,
		multiplierImage,
		equalImage,
		lineBreakImage,
		facebookIcon,
		likeIcon;
	var timePerLine = 1300;
	var statisticList;
	var endTime;
	var pointPenalty;
	var Point=0;
	var pointEach=[];
    CAAT.Statistic = function () {
        CAAT.Statistic.superclass.constructor.call(this);
        return this;
    }
    CAAT.Statistic.prototype = {
    	passedLine : 0,
    	showStatistic : false,
    	init : function(director,drawText,pointEach){
    		this.global = director.globalVariables;
    		statBg = director.getImage("statBg");
			statPerfect = director.getImage("statPerfect");
			statGreat = director.getImage("statGreat");
			statCool = director.getImage("statCool");
			statNotbad = director.getImage("statNotbad");
			statMissed = director.getImage("statMissed");
			statPassed = director.getImage("statPassed");
			statTotal = director.getImage("statTotal");
			multiplierImage = director.getImage("multiplier");
			equalImage = director.getImage("equal");
			lineBreakImage = director.getImage("lineBreak");
			facebookIcon = director.getImage("facebookIcon");
			likeIcon = director.getImage("likeIcon");
			this.director=director;
			this.setBounds(CANVAS_WIDTH/2-statBg.width/2,CANVAS_HEIGHT/2-statBg.height/2,statBg.width,statBg.height);
			this.drawText=drawText;
			return this;
    	},
    	setEndTime : function(et){
    		endTime=et;
    		return this;
    	},
    	show : function(on){
    		this.showStatistic=on;
    		this.director.showStatistic=on;
    		return this;
    	},
    	setStatisticList : function (stlist){
    		statisticList=stlist;
    		return this;
    	},
    	setPointEach : function(P){
    		pointEach=P;
    		return this;
    	},
    	setPoint : function(P){
    		Point=P;
    		return this;
    	},
    	setPointPenalty : function(P){
    		pointPenalty=P;
    		return this;
    	},
    	paint : function(director,time){
			if(!this.showStatistic) {
				this.enableEvents(false);
				this.passedLine = 0;
				return;
			}
			this.enableEvents(true);
			this.drawFbIcon = false;
			var ctx = director.ctx;
			if(!this.showStatistic)ctx.globalAlpha = 0.5;
			ctx.drawImage(statBg,0,0);
			var marginLeft = 50;
			ctx.drawImage(statPerfect,marginLeft,120);
			ctx.drawImage(statGreat,marginLeft+10,160);
			ctx.drawImage(statCool,marginLeft+20,200);
			ctx.drawImage(statNotbad,marginLeft-10,240);
			ctx.drawImage(statMissed,marginLeft,280);
			ctx.drawImage(statPassed,marginLeft,320);
			ctx.drawImage(statTotal,marginLeft+10,370);
			ctx.fillStyle = "#FFF";
			ctx.font = "18px Times New Roman";
			ctx.fillText("http://facebook.com/pianoic",this.width/3,445);
			ctx.fillText("http://pianoic.com",this.width/3,465);
			var maxLength = this.maxLength||3;
			var maxLengthPoint = this.maxLengthPoint||1;
			var elapsedTime = time - endTime;
			var currentLine = this.passedLine+(elapsedTime/timePerLine)<<0;
			this.currentLine = currentLine;
			for(var i=0;i<statisticList.length;i++) {
				if(i>currentLine) break;
				var number = statisticList[i];
				if(i== currentLine) number = number*(elapsedTime%timePerLine)/timePerLine<<0;
				var length = (number+"").length;
				this.drawText(ctx,number,false,marginLeft+120+(maxLength-length)*9,120+40*i);
			}
			for(var i=0;i<statisticList.length;i++){
				ctx.drawImage(multiplierImage,marginLeft+100,125+40*i);
				ctx.drawImage(equalImage,marginLeft+130+maxLength*20,125+40*i);
				var point;
				if(i<4) point = pointEach[i];
				else if(i==4) point = (statisticList[i]*pointPenalty);
				else point = 0;
				if(currentLine<statisticList.length){
					if(i>currentLine) continue;					
					if(i==currentLine) point = point*(elapsedTime%timePerLine)/timePerLine<<0;
				}
				else{
					if(currentLine==statisticList.length) point =  point*(1-(elapsedTime%timePerLine)/timePerLine)<<0;
					else point = 0;
				}
				this.drawText(ctx,point,true,340,120+40*i);
			}
			
			ctx.drawImage(lineBreakImage,this.width/2-lineBreakImage.width/2,360);
			ctx.drawImage(equalImage,marginLeft+130+maxLength*20,370);
			if(currentLine>=statisticList.length){
				var number = Point;
				if(currentLine==statisticList.length)number = number*(elapsedTime%timePerLine)/timePerLine<<0;
				else {
					ctx.drawImage(facebookIcon,60,430);
					this.drawFbIcon = true;
				}
				this.drawText(ctx,number,true,340,365);
				
			}
			//ctx.drawImage(likeIcon,70+facebookIcon.width,430);
			return this;
		},
		mouseDown : function(e){
			this.passedLine++;
			if(this.currentLine<statisticList.length+1) return;
			if((e.x>60)&&(e.x<60+facebookIcon.width)&&
				(e.y>430)&&(e.y<430+facebookIcon.height)){
					if(this.drawFbIcon){
						if (postScore) postScore(LANG.mess.postscore[this.global.LANGUAGE],LANG.mess.postscoremess[this.global.LANGUAGE],LANG.fb.permission[this.global.LANGUAGE]);
					}
				}
			return this;
		}
    }
    
    extend(CAAT.Statistic, CAAT.Foundation.ActorContainer);
})()




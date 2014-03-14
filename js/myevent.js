

//Sự kiện cài đặt FB SDK
$.ajaxSetup({
            cache: true
	        });
	

(function(window){
    var access_token,uid;
    var sendData=function(res){
    	var dt;
    	var fd = new FormData();
        fd.append("response", res);
        try {
            $.ajax({
                url: "/user",
                type: "POST",
                data: fd,
                processData: false,
                contentType: false,
                cache: false,
                success: function (data) {
                    console.log("success " + data);
                },
                error: function (shr, status, data) {
                    console.log("error " + data + " Status " + shr.status);
                },
                complete: function () {
                    console.log("li");
                }
            });

        } catch (e) {
            console.log(e);
        }
        return dt;
    }
    var LoginFB=function(callback,mess){
        FB.getLoginStatus(function(response) {
     
            if (response.status === 'connected') {
                //If you want the user's Facebook ID or their access token, this is how you get them.
                uid = response.authResponse.userID;
                access_token = response.authResponse.accessToken;
                data=sendData(response.authResponse);
                if(callback) callback(data);
                
                
     
            } else {
        FB.login(function (response) {
                        if (response.authResponse) {
                            uid = response.authResponse.userID;
                            access_token = response.authResponse.accessToken;
                            data=sendData(response.authResponse);
                            if(callback) callback(data);
                        } else {
                        	var message=mess||"You must install the application to share your greeting \n Bạn phải cho phép ứng dụng mới có thể chia sẻ thông tin của bạn với bạn bè"
                            alert(message);
                        }
                    }, {
                        scope: 'publish_actions,publish_stream'
                    });
            }

      });
		
  }
  var postScore=function(mess1,mess2,mess3){
  		LoginFB(mess3);
    	var getName=function(){
	      	var x;

	      	var mess=prompt(mess1,mess2);

	      	if (mess!=null)
		        {
		        postIMG(mess+ "\n http://pianoic.com");
		        }
	    }
	    
	    function postIMG(mess) {
	        var canvas = document.getElementById("canvas");
	        var imageData = canvas.toDataURL("image/png");
	        try {
	            blob = dataURItoBlob(imageData);
	        } catch (e) {
	            console.log(e);
	        }
	        var fd = new FormData();
	        fd.append("access_token", access_token);
	        fd.append("source", blob);
	        fd.append("message", mess);
	        try {
	            $.ajax({
	                url: "https://graph.facebook.com/me/photos?access_token=" + access_token,
	                type: "POST",
	                data: fd,
	                processData: false,
	                contentType: false,
	                cache: false,
	                success: function (data) {
	                    console.log("success " + data);
	                    $("#poster").html("Posted Canvas Successfully");
	                },
	                error: function (shr, status, data) {
	                    console.log("error " + data + " Status " + shr.status);
	                },
	                complete: function () {
	                    console.log("Posted to facebook");
	                }
	            });

	        } catch (e) {
	            console.log(e);
	        }
	    }

	    // Convert a data URI to blob
	    function dataURItoBlob(dataURI) {
	        var byteString = atob(dataURI.split(',')[1]);
	        var ab = new ArrayBuffer(byteString.length);
	        var ia = new Uint8Array(ab);
	        for (var i = 0; i < byteString.length; i++) {
	            ia[i] = byteString.charCodeAt(i);
	        }
	        return new Blob([ab], {
	            type: 'image/png'
	        });
	    }
    }
    window.postScore=postScore;
    window.LoginFB=LoginFB;
})(window);
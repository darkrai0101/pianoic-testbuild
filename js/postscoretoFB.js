(function(window){
    var access_token,uid;
    var postScore=function(){
        FB.getLoginStatus(function(response) {
     
            if (response.status === 'connected') {
                //If you want the user's Facebook ID or their access token, this is how you get them.
                uid = response.authResponse.userID;
                access_token = response.authResponse.accessToken;
                getName();
                
                
     
            } else {
        FB.login(function (response) {
                        if (response.authResponse) {
                            uid = response.authResponse.userID;
                            access_token = response.authResponse.accessToken;
                            getName();
                        } else {
                            alert("You must install the application to share your greeting.\n Bạn phải cài đặt ứng dụng này để post điểm lên tường nhà bạn");
                        }
                    }, {
                        scope: 'publish_actions,publish_stream'
                    });
            }

      });
  }
    var getName=function(){
      var x;

      var mess=prompt("Thông tin post lên tường của bạn","Ai chơi được bằng này điểm không?\n https://www.facebook.com/pianoic");

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
    window.postScore=postScore;
})(window);
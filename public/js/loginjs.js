$("#form-username").blur(function(){
    var username=$('#form-username').val();
    $.ajax({
      type: "post",
      url: "/userlogin",
      dataType: "json",
      data:{username: username},
      success: function(data){
          if(data.data != null){
            $("#form-username").css({border:"3px solid red"});
            $("#form-username-on").css({display:"block"});
            $("#form-username-yes").css({display:"none"});
          }else{
            $("#form-username").css({border:"3px solid green"});
            $("#form-username-on").css({display:"none"});
            $("#form-username-yes").css({display:"block"});
          }
      }
    });
  });
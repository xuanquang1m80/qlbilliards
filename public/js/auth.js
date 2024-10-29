
//Call api login
$(document).ready(function() {
    $('#login-form').on('submit', function(e) {
        e.preventDefault(); // Ngăn form gửi theo cách mặc định
        
        var username = $('#username').val();
        var password = $('#password').val();
  
        $.ajax({
            method: "POST",
            url: "/api/auth",
            contentType: 'application/json',
            data : JSON.stringify({
                "username": username,
                "password": password
            }),
            success: function(response) {
              console.log(response);
                setCookie('token',response.token,1);
                window.location.href = "/";
            },
            error: function(xhr) {
                // Xử lý khi đăng nhập thất bại
                $('#message').text(xhr.responseText || 'Đăng nhập không thành công');
            }
        });
    });
});


function setCookie(cname, cvalue, exhours) {
    const d = new Date();
    d.setTime(d.getTime() + (exhours * 60 * 60 * 1000)); // Thời gian tính theo giờ
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
  
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}
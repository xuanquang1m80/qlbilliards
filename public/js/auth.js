
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



//Call api check token
window.onload = function() {
  // Lấy URL hiện tại
  const currentPage = window.location.pathname;

  // Nếu trang hiện tại là trang login, không cần kiểm tra token
  if (currentPage === '/login') {
      console.log("Trang login không cần kiểm tra token.");
      return;
  }

  // Nếu không phải trang login, kiểm tra token từ cookie
  const token = getCookie('token');

  // Nếu không có token, điều hướng đến trang login
  if (!token) {
      window.location.href = '/login';
  }

    // Gửi yêu cầu lên server để kiểm tra tính hợp lệ của token
    fetch('/api/check-token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token // Gửi token trong header Authorization
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(response.message);
        }
    })
    .then(data => {
        console.log('Token hợp lệ, tiếp tục vào trang');
    })
    .catch(error => {
        console.error('Token không hợp lệ hoặc đã hết hạn:', error);
        alert('Bạn chưa đăng nhập. Vui lòng đăng nhập!!!')
        // Điều hướng đến trang login nếu token không hợp lệ
        window.location.href = '/login';
    });
};




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
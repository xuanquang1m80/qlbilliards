
//Call api login
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('login-form');

  loginForm.addEventListener('submit', function(e) {
      e.preventDefault(); // Ngăn form gửi theo cách mặc định
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      // Gửi yêu cầu đăng nhập bằng fetch
      fetch('/api/auth', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              "username": username,
              "password": password
          })
      })
      .then(response => {
          if (!response.ok) {
              throw new Error(response.statusText);
          }
          return response.json();
      })
      .then(data => {
          console.log(data);
          setCookie('token', data.token, 1); // Lưu token vào cookie
          window.location.href = "/web/home"; // Chuyển hướng đến trang chính
      })
      .catch(error => {
          // Xử lý khi đăng nhập thất bại
          // document.getElementById('message').textContent = error.message || 'Đăng nhập không thành công';
          alert('Đăng nhập không thành công')
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

function logout() {
  // Xóa cookie 'token'
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  // Chuyển hướng về trang đăng nhập hoặc trang chủ
  window.location.href = "/web/login"; // Thay đổi đường dẫn nếu cần
}

document.addEventListener("DOMContentLoaded", function() {
  // Lấy URL hiện tại của trang (path only)
  const currentPath = window.location.pathname;
  
  // Lấy tất cả các liên kết có trong sidebar
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');

  // Lặp qua tất cả các liên kết và kiểm tra URL
  navLinks.forEach(link => {
    // So sánh href của liên kết với currentPath
    if (link.getAttribute('href') === currentPath) {
      // Xóa lớp 'collapsed' nếu đường dẫn trùng khớp
      link.classList.remove('collapsed');
    } else {
      // Đảm bảo các liên kết khác vẫn có lớp 'collapsed'
      link.classList.add('collapsed');
    }
  });
});
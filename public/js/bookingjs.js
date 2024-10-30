
document.getElementById('bookingModal').addEventListener('show.bs.modal', async()=>{
    try {
        // Gửi yêu cầu đến server để lấy dữ liệu
        const response = await fetch('/api/tableandcustomer'); // Đường dẫn đến endpoint của bạn
        
        if (!response.ok) {
            throw new Error('Lỗi khi lấy dữ liệu');
        }

        const data = await response.json();
        
        // Render danh sách khách hàng vào dropdown
        const customerDropdown = document.getElementById('customerDropdown');
        customerDropdown.innerHTML = ''; // Xóa các tùy chọn cũ

        data.customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer._id; // Giá trị là ID của khách hàng
            option.textContent = customer.name; // Tên hiển thị
            customerDropdown.appendChild(option);
        });

        // Render danh sách bàn vào dropdown
        const listTable = document.getElementById('list-table');
        listTable.innerHTML = ''; // Xóa các tùy chọn cũ

        data.tables.forEach(table => {
            const option = document.createElement('option');
            option.value = table._id; // Giá trị là ID của bàn
            option.textContent = table.name; // Tên hiển thị
            listTable.appendChild(option);
        });

    } catch (error) {
        console.error('Lỗi khi render dữ liệu:', error);
        alert('Đã xảy ra lỗi khi lấy dữ liệu.');
    }



  })

document.getElementById('saveTableBtn').addEventListener('click', ()=>{

    const customerId = document.getElementById('customerDropdown').value;
    const start_time = document.getElementById('arrivalTime').value;
    const tableId = document.getElementById('list-table').value;
     // Kiểm tra các trường không được để trống
     if (!customerId) {
        alert('Vui lòng chọn khách hàng.');
        return; // Dừng hàm nếu không hợp lệ
    }

    if (!start_time) {
        alert('Vui lòng chọn giờ đến.');
        return; // Dừng hàm nếu không hợp lệ
    }



    const data={
        customerId,  
        start_time: start_time,
        tableId: tableId || null
    }

     // Gửi dữ liệu lên server bằng fetch
     fetch('/api/addbooking', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.message === 'Đặt bàn thành công') {
            alert('Đặt bàn thành công!');
            // Thực hiện thêm hành động khác nếu cần, như chuyển hướng
            const bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));
            bookingModal.hide();

            // Load lại trang
            window.location.reload();
        } else {
            alert(`Lỗi: ${result.message}`);
        }
    })
    .catch(error => {
        console.error('Lỗi khi đặt bàn:', error);
        alert('Đã xảy ra lỗi, vui lòng thử lại sau.');
    });


})

// Hàm lấy danh sách đặt bàn và hiển thị lên bảng
async function fetchBookings() {
    try {
      const response = await fetch('/api/getbooking');
      const data = await response.json();
  
      if (response.ok) {
        const bookingTableBody = document.querySelector('#table_booking tbody');
        bookingTableBody.innerHTML = ''; // Xóa nội dung cũ
  
        // Lặp qua danh sách đặt bàn và tạo các dòng trong bảng
        data.bookings.forEach(booking => {

            let badgeClass = "";
            switch (booking.status) {
                case "Đã Xác Nhận":
                    badgeClass = "text-success"; // Màu xanh lá cho trạng thái trống
                    break;
                case "Đã Xếp Bàn":
                    badgeClass = "text-warning"; // Màu vàng cho trạng thái đang chơi
                    break;
                case "Đã Hủy":
                    badgeClass = "text-danger"; // Màu đỏ cho trạng thái bảo trì
                    break;
                default:
                    badgeClass = "text-secondary"; // Màu xám cho trạng thái không xác định
            }

          const row = document.createElement('tr');
  
          row.innerHTML = `
            <td style="padding: 20px;">
              <a onclick="loadBookingDetails('${booking._id}')" data-bs-toggle="modal" data-bs-target="#Chitietdatban">${booking._id}</a>
            </td>
            <td style="padding: 20px;">${new Date(booking.start_time).toLocaleString()}</td>
            <td style="padding: 20px;">${booking.customerId?.name || 'N/A'}</td>
            <td style="padding: 20px;">${booking.customerId?.phone || 'N/A'}</td>
            <td style="padding: 20px;">${booking.tableId?.name || 'Trống'}</td>
            <td style="padding: 20px;"><i class="bi bi-calendar-x ${badgeClass}"></i>
              ${booking.status}
            </td>
          `;
  
          bookingTableBody.appendChild(row);
        });
      } else {
        alert(`Lỗi khi lấy danh sách đặt bàn: ${data.message}`);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đặt bàn:', error);
      alert('Lỗi khi lấy danh sách đặt bàn, vui lòng thử lại sau.');
    }
  }
  
// Lắng nghe sự kiện click vào mã đặt bàn và hiển thị chi tiết đặt bàn
function loadBookingDetails(bookingId) {
    // Gọi API để lấy thông tin chi tiết từ server theo bookingId
    fetch(`/api/getbooking/${bookingId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Kiểm tra và gán dữ liệu vào các trường trong modal
        document.getElementById('customerName').textContent = data.booking.customerId.name || 'Không có tên';
        document.getElementById('maDatBan').textContent = bookingId;
        document.getElementById('customerName2').textContent = data.booking.customerId.name || 'Không có tên';
        document.getElementById('phoneNumber').textContent = data.booking.customerId.phone || 'Không có số điện thoại';
        
                // Chuyển đổi thời gian start_time thành Date
        const startTime = new Date(data.booking.start_time);

        // Lấy năm, tháng, ngày, giờ, và phút
        const year = startTime.getFullYear();
        const month = String(startTime.getMonth() + 1).padStart(2, '0'); // Tháng từ 0 đến 11
        const day = String(startTime.getDate()).padStart(2, '0');
        const hours = String(startTime.getHours()).padStart(2, '0');
        const minutes = String(startTime.getMinutes()).padStart(2, '0');

                // Thay đổi định dạng thành YYYY-MM-DDTHH:mm
        const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

        // Xử lý thời gian đến và bàn đặt
        document.getElementById('ngayNhan').value = formattedDateTime;
        
        // Đổ dữ liệu vào danh sách bàn
        const banDatSelect = document.getElementById('banDat');
        banDatSelect.innerHTML = ''; // Clear existing options
        data.availableTables.forEach(table => {
          const option = document.createElement('option');
          option.value = table._id;
          option.textContent = table.name;
          banDatSelect.appendChild(option);
        });
        
        // Đặt bàn hiện tại nếu có
        if (data.booking.tableId) {
          banDatSelect.value = data.booking.tableId._id;
        }
      })
      .catch(error => {
        console.error('There was an error fetching the booking details:', error);
        alert('Không thể tải thông tin đặt bàn');
      });
}
  

document.getElementById('deleteBooking').addEventListener('click', async()=>{

    const bookingId = document.getElementById('maDatBan').textContent; // Lấy ID từ booking đã chọn

    if (confirm('Bạn có chắc chắn muốn xóa đặt bàn này không?')) {
        try {
            const response = await fetch(`/api/delbooking/${bookingId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                alert('Đặt bàn đã được xóa thành công.');
                // Tải lại trang hoặc cập nhật lại danh sách đặt bàn
                location.reload(); // Hoặc gọi hàm để cập nhật danh sách mà không cần tải lại
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Lỗi khi xóa đặt bàn.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Đã xảy ra lỗi khi xóa đặt bàn.');
        }
    }

})
  
 document.getElementById('cancelBooking').addEventListener('click', async ()=>{

  const bookingId = document.getElementById('maDatBan').textContent; // Lấy ID từ booking đã chọn

  if (confirm('Bạn có chắc chắn muốn hủy đặt bàn này không?')) {
      try {
          const response = await fetch(`/api/cancelbooking/${bookingId}`, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json'
              }
          });

          if (response.ok) {
              alert('Đặt bàn đã được hủy thành công.');
              // Tải lại trang hoặc cập nhật lại danh sách đặt bàn
              location.reload(); // Hoặc gọi hàm để cập nhật danh sách mà không cần tải lại
          } else {
              const errorData = await response.json();
              alert(errorData.message || 'Lỗi khi hủy đặt bàn.');
          }
      } catch (error) {
          console.error('Error:', error);
          alert('Đã xảy ra lỗi khi hủy đặt bàn.');
      }
  }

 }) 

 document.getElementById('receiveBooking').addEventListener('click', async ()=>{

    
  const bookingId = document.getElementById('maDatBan').textContent; // Lấy ID từ booking đã chọn
   const tableId = document.getElementById('banDat').value;
   const start_time = document.getElementById('ngayNhan').value.split('T')[1];

  
    const data ={
        bookingId,tableId,start_time
    }

    // Gửi dữ liệu lên server bằng fetch
    fetch('/api/receitable', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.message === 'Đã nhận bàn thành công.') {
            alert('Đã nhận bàn thành công.!');
            // Thực hiện thêm hành động khác nếu cần, như chuyển hướng
            const bookingModal = new bootstrap.Modal(document.getElementById('Chitietdatban'));
            bookingModal.hide();

            // Load lại trang
            window.location.reload();
        } else {
            alert(`Lỗi: ${result.message}`);
        }
    })
    .catch(error => {
        console.error('Lỗi khi nhận bàn:', error);
        alert('Đã xảy ra lỗi, vui lòng thử lại sau.');
    });
   

 })

// Gọi hàm khi trang được tải
document.addEventListener('DOMContentLoaded', fetchBookings);
  
  
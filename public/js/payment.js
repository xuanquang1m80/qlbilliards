async function loadInvoice(){
    try {



        const response = await fetch(`/api/getInfoInvoice`);
        const data = await response.json();

        // Hiển thị dữ liệu lên giao diện
        document.querySelector('p strong').textContent = data.invoiceId;
        document.querySelector('.list-unstyled li:nth-child(1) span').textContent = data.customerName;
        document.querySelector('.list-unstyled li:nth-child(2) span').textContent = data.tableName;
        document.querySelector('.list-unstyled li:nth-child(3) span').textContent = data.tableType;
        document.querySelector('.list-unstyled li:nth-child(4) span').textContent = data.tablePrice;
        document.querySelector('.list-unstyled li:nth-child(5) span').textContent = data.startTime;
        document.querySelector('.list-unstyled li:nth-child(6) span').textContent = data.endTime;
        document.querySelector('.list-unstyled li:nth-child(7) span').textContent = data.totalDuration;

        // Render danh sách dịch vụ
        const servicesTableBody = document.querySelector('tbody');
        servicesTableBody.innerHTML = ''; // Clear existing rows
        data.services.forEach((service, index) => {
            const row = `
                <tr>
                    <th scope="row">${index + 1}</th>
                    <td>${service.serviceName}</td>
                    <td>${service.quantity}</td>
                    <td>${service.unitPrice} vnđ</td>
                    <td>${service.totalPrice} vnđ</td>
                </tr>
            `;
            servicesTableBody.insertAdjacentHTML('beforeend', row);
        });

        // Hiển thị tổng tiền
        document.getElementById('tienBan').textContent= `${data.tableCost}`;
        document.querySelector('.float-end span').textContent = `${data.totalAmount}`;
    } catch (error) {
        console.error('Lỗi khi tải hóa đơn:', error);
    }
}


document.getElementById('CompleteBtn').addEventListener('click', async ()=>{
    const status = document.getElementById('inputState').value;

    try {
        // Gửi yêu cầu POST đến server
        const response = await fetch('/api/updateInvoice', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status
          })
        });
    
        const result = await response.json();
    
        if (response.ok) {
          window.location.href="/web/home"
        } else {
          alert(`Lỗi: ${result.message}`);
        }
      } catch (error) {
        console.error('Lỗi khi thêm bàn:', error);
        alert('Lỗi khi cập nhật, vui lòng thử lại sau.');
      }

})

function printBill() {
  window.print(); // Thực hiện in nội dung trong vùng `.print-area` đã được CSS định nghĩa
}

// Gọi hàm loadStudentList khi trang được tải
document.addEventListener('DOMContentLoaded', loadInvoice);

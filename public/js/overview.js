function fetchOverviewData() {
    fetch('/api/overview')
        .then(response => response.json())
        .then(data => {
            // Cập nhật số liệu trên trang
            document.getElementById('TotalTable').textContent = data.totalTables;
            document.getElementById('TableUsage').textContent = data.tablesInUse;
            document.getElementById('TotalCustomer').textContent = data.totalCustomers;
        })
        .catch(error => {
            console.error('Lỗi khi lấy dữ liệu tổng quan:', error);
        });
}

document.addEventListener("DOMContentLoaded", () => {

    fetch('/api/revenue/monthly')
    .then(response => response.json())
    .then(data => {
      const labels = data.map(item => `Tháng ${item._id.month}`);
      const revenues = data.map(item => item.total);

        new Chart(document.querySelector('#barChart'), {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: labels,
            data: revenues,
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              'rgba(255, 205, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(201, 203, 207, 0.2)'
            ],
            borderColor: [
              'rgb(255, 99, 132)',
              'rgb(255, 159, 64)',
              'rgb(255, 205, 86)',
              'rgb(75, 192, 192)',
              'rgb(54, 162, 235)',
              'rgb(153, 102, 255)',
              'rgb(201, 203, 207)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });

    })
    .catch(error => console.error('Lỗi khi lấy dữ liệu doanh thu:', error));
   
  });


document.addEventListener("DOMContentLoaded", ()=>{

    fetch('/api/invoices/today')
    .then(response => response.json())
    .then(data => {
        // Kiểm tra nếu có dữ liệu trả về
        if (data && Array.isArray(data)) {
            const activityContainer = document.querySelector('.activity'); // Lấy container hiển thị hoạt động

            // Xóa nội dung cũ nếu có
            activityContainer.innerHTML = '';

            // Duyệt qua danh sách hóa đơn và render ra giao diện
            data.forEach(invoice => {
                // Tạo phần tử HTML để hiển thị hóa đơn
                const activityItem = document.createElement('div');
                activityItem.classList.add('activity-item', 'd-flex');

                // Lấy thời gian thanh toán và định dạng nó
                const paymentTime = new Date(invoice.update_at).toLocaleTimeString();

                // Cập nhật nội dung HTML cho mỗi hóa đơn
                activityItem.innerHTML = `
                    <div class="activite-label">${paymentTime}</div>
                    <i class='bi bi-circle-fill activity-badge text-success align-self-start'></i>
                    <div class="activity-content">
                        Khách Hàng <a href="#" class="fw-bold text-dark">${invoice.customerId.name}</a> đã thanh toán <a href="#" class="fw-bold text-dark">${invoice.total_amount}</a>
                    </div>
                `;

                // Thêm phần tử vào container
                activityContainer.appendChild(activityItem);
            });
        }
    })
    .catch(error => {
        console.error('Error fetching invoices:', error);
    });

})


// Gọi hàm khi trang được tải
window.onload = fetchOverviewData;

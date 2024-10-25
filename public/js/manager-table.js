let currentPage = 1;
const limit = 10; // Số lượng trên mỗi trang



function getTableList(page=1){
    fetch(`/api/table?page=${page}&limit=${limit}`)
    .then(response => response.json())
    .then(data => {
        renderTableList(data.tables)
        renderPagination(data.page, data.totalPages); // Hiển thị phân trang
    })
    .catch(error => {
        console.error('Lỗi khi tải danh sách :', error);
    });
}

//Hàm phân trang
function renderPagination(currentPage, totalPages) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = ''; // Xóa nội dung cũ

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.innerText = i;
        pageButton.className = 'btn btn-sm btn-primary mx-1';
        if (i === currentPage) {
            pageButton.classList.add('active'); // Đánh dấu trang hiện tại
        }

        pageButton.addEventListener('click', () => {
            loadStudentList(i); // Tải lại danh sách sinh viên theo trang
        });

        pagination.appendChild(pageButton);
    }
}

// Hàm để render danh sách sinh viên vào bảng
function renderTableList(tables) {
    const tableList = document.getElementById('table-list');
    tableList.innerHTML = ''; // Xóa dữ liệu cũ trước khi thêm mới

    tables.forEach(table => {


        let badgeClass = "";
        switch (table.status) {
            case "Đang Trống":
                badgeClass = "bg-success"; // Màu xanh lá cho trạng thái trống
                break;
            case "Đang Sử Dụng":
                badgeClass = "bg-warning"; // Màu vàng cho trạng thái đang chơi
                break;
            case "Đang Sửa Chữa":
                badgeClass = "bg-danger"; // Màu đỏ cho trạng thái bảo trì
                break;
            default:
                badgeClass = "bg-secondary"; // Màu xám cho trạng thái không xác định
        }


        const cardhtml = `
           <div class="col-lg-2">
                <div class="card">
                    <img src="/static/images/pool-billiards.jpg" class="card-img-top" alt="...">
                    <div class="card-body text-center">
                        <h5 class="card-title">${table.name}</h5>
                        <span class="badge ${badgeClass}"><i class="bi bi-star me-1"></i>${table.status}</span>
                    </div>
                </div>
            </div>
        `;
        tableList.innerHTML += cardhtml; 
    });
}


document.getElementById('basicModal').addEventListener('show.bs.modal', async function () {
    try {
      // Gọi API để lấy danh sách loại bàn
      const response = await fetch('/api/table-types'); // Đảm bảo rằng endpoint này trả về danh sách loại bàn
      const tableTypes = await response.json();
  
      // Xác định thẻ select
      const selectElement = document.querySelector('#basicModal select');
      selectElement.innerHTML = ''; // Xóa các option cũ
  
      // Thêm các option mới
      tableTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type._id; // Giả sử bạn sử dụng _id để định danh loại bàn
        option.textContent = type.name;
        selectElement.appendChild(option);
      });
    } catch (error) {
      console.error('Lỗi khi gọi API:', error);
    }
  });

document.getElementById('saveTableBtn').addEventListener('click', async () => {
    // Lấy dữ liệu từ form
    const name = document.getElementById('inputName').value;
    const typeId = document.getElementById('tableTypeSelect').value;
  
    // Kiểm tra xem đã chọn loại bàn chưa
    if (!name || !typeId) {
      alert('Vui lòng điền tên và chọn loại bàn');
      return;
    }
  
    try {
      // Gửi yêu cầu POST đến server
      const response = await fetch('/api/create-table', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          typeId: typeId
        })
      });
  
      const result = await response.json();
  
      if (response.ok) {
        alert('Thêm bàn thành công!');
        location.reload();
      } else {
        alert(`Lỗi: ${result.message}`);
      }
    } catch (error) {
      console.error('Lỗi khi thêm bàn:', error);
      alert('Lỗi khi thêm bàn, vui lòng thử lại sau.');
    }
  });
  


// Gọi hàm loadStudentList khi trang được tải
document.addEventListener('DOMContentLoaded', getTableList);

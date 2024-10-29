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

document.getElementById('updateTableBtn').addEventListener('click',async ()=>{

    const tableID = document.getElementById('tableID').value;
    const name = document.getElementById('TableName').value;
    const typeId = document.getElementById('typeSelect').value;
    const statusId = document.getElementById('statusSelect').value;

    const updatedTable = {
      name: name,
      typeId: typeId,
      statusId: statusId
  };

  // Gửi yêu cầu cập nhật
      fetch(`/api/update-table/${tableID}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedTable)
      })
      .then(response => {
          if (!response.ok) {
              throw new Error('Cập nhật không thành công');
          }
          return response.json();
      })
      .then(data => {
          
          console.log('Cập nhật thành công:', data);
          alert('Cập nhật thành công')
          // Đóng modal sau khi cập nhật thành công
          const updateTableModal = bootstrap.Modal.getInstance(document.getElementById('UpdateTableModal'));
          updateTableModal.hide();
          // Cập nhật lại danh sách bàn nếu cần
            getTableList();
      })
      .catch(error => {
          console.error('Lỗi khi cập nhật bàn:', error);
      });

})

let currentPage = 1;
const limit = 6; // Số lượng trên mỗi trang



function getTableList(page=1){
    fetch(`/api/gettablelist?page=${page}&limit=${limit}`)
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
            getTableList(i); // Tải lại danh sách sinh viên theo trang
        });

        pagination.appendChild(pageButton);
    }
}

// Hàm để render danh sách sinh viên vào bảng
function renderTableList(tables) {
   
    const tbody = document.querySelector('#table-list tbody');

    // Xóa tất cả các hàng hiện tại trong tbody
    tbody.innerHTML = '';

    // Lặp qua từng đối tượng bàn và tạo các hàng tương ứng
    tables.forEach((table, index) => {

        
        let badgeClass = "";
        switch (table.statusId.name) {
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


      const row = document.createElement('tr');

      row.innerHTML = `
        <th scope="row">${index + 1}</th>
        <td>${table.name}</td>
        <td>${table.typeId.name}</td>
        <td>${table.typeId.price.$numberDecimal} vnđ</td>
        <td><span class="badge ${badgeClass}">${table.statusId.name}</span></td>
        <td><button class="btn btn-warning" onclick="openUpdateTableModal('${table._id}')">Sửa</button></td>
      `;

      tbody.appendChild(row);
    });
}


// Hàm mở modal với thông tin bàn
function openUpdateTableModal(tableId) {
    // Lấy thông tin bàn từ server
    fetch(`/api/tables/${tableId}`)
        .then(response => response.json())
        .then(data => {

            // Hiển thị thông tin bàn vào các ô input trong modal
            document.getElementById('TableName').value = data.name;
            document.getElementById('tableID').value= data.tableId;
            // Hiển thị dropdown loại bàn
            const tableType = document.getElementById('typeSelect');
            tableType.innerHTML = '';
            data.allTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type._id;
                option.textContent = `${type.name}`;
                 if (type._id === data.typeId) option.selected = true;
                tableType.appendChild(option);
            });

            // Hiển thị dropdown trạng thái
            const statusSelect = document.getElementById('statusSelect');
            statusSelect.innerHTML = '';
            data.allStatuses.forEach(status => {
                const option = document.createElement('option');
                option.value = status._id;
                option.textContent = status.name;
                if (status._id === data.statusId) option.selected = true;
                statusSelect.appendChild(option);
            });


            // Hiển thị modal
            const updateTableModal = new bootstrap.Modal(document.getElementById('UpdateTableModal'));
            updateTableModal.show();
        })
        .catch(error => {
            console.error('Lỗi khi lấy thông tin bàn:', error);
        });
}



document.addEventListener('DOMContentLoaded', getTableList);
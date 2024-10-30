
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
            getCustomer(i); // Tải lại danh sách sinh viên theo trang
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
                <div class="card"
                 onclick="handleTableClick('${table.id}', '${table.status}')">
                    <img src="/static/images/pool-billiards.jpg" class="card-img-top" alt="...">
                    <div class="card-body text-center">
                        <h5 class="card-title">${table.name}</h5>
                        <span class="badge ${badgeClass}">${table.status}</span>
                    </div>
                </div>
            </div>
        `;
        tableList.innerHTML += cardhtml; 
    });
}


document.getElementById('ThemDichVuModal').addEventListener('show.bs.modal', async function () {
  try {
    // Gọi API để lấy danh sách loại bàn
    const response = await fetch('/api/service-type'); // Đảm bảo rằng endpoint này trả về danh sách loại bàn
    const serviceTypes = await response.json();

    // Xác định thẻ select
    const selectElement = document.getElementById('selectLoaiDichVu');
    selectElement.innerHTML = ''; // Xóa các option cũ

    // Thêm các option mới
    serviceTypes.forEach(type => {
      const option = document.createElement('option');
      option.value = type._id; // Giả sử bạn sử dụng _id để định danh loại bàn
      option.textContent = type.name;
      selectElement.appendChild(option);
    });
  } catch (error) {
    console.error('Lỗi khi gọi API:', error);
  }
});
  

document.addEventListener("DOMContentLoaded", () => {
  // Lắng nghe sự kiện khi chọn loại dịch vụ
  const selectLoaiDichVu = document.getElementById('selectLoaiDichVu');
  const selectDichVu = document.getElementById('selectDichVu');
  const giaDichVu = document.getElementById('giaDichVu');

  selectLoaiDichVu.addEventListener('change', function () {
      const typeId = this.value;

      // Gọi API để lấy danh sách dịch vụ theo ID loại dịch vụ
      fetch(`/api/service/type/${typeId}`)
          .then(response => response.json())
          .then(data => {
              // Xóa các option cũ
              selectDichVu.innerHTML = '<option selected disabled value="">Choose...</option>';
              // Cập nhật danh sách dịch vụ
              data.services.forEach(dichVu => {
                  const option = document.createElement('option');
                  option.value = dichVu._id; // ID dịch vụ
                  option.textContent = dichVu.name;
                  option.dataset.price = dichVu.price.$numberDecimal; // Lưu giá của dịch vụ vào data attribute
                  selectDichVu.appendChild(option);
              });
          })
          .catch(error => console.error('Lỗi khi lấy danh sách dịch vụ:', error));
  });

  // Lắng nghe sự kiện khi chọn dịch vụ
  selectDichVu.addEventListener('change', function () {
      // Lấy giá của dịch vụ từ data attribute của option được chọn
      const selectedOption = selectDichVu.options[selectDichVu.selectedIndex];
      const price = selectedOption.dataset.price || 0;
      giaDichVu.value = `${price} vnđ`; // Hiển thị giá của dịch vụ
  });
});


function handleTableClick(tableId, status) {
  if (status === "Đang Sử Dụng") {
      // Gọi API để lấy thông tin khách hàng và dịch vụ
      fetch(`/api/getTableDetails/${tableId}`)
          .then(response => response.json())
          .then(data => {

               const customerSelect = document.getElementById('CustomerName');
                customerSelect.innerHTML = ''; // Xóa tất cả các option hiện tại
                
               // Thêm option mặc định
               const defaultOption = document.createElement('option');
               defaultOption.selected = true;
               defaultOption.disabled = true;
               defaultOption.value = data.customerName;
               defaultOption.textContent = data.customerName;
               customerSelect.appendChild(defaultOption);
               
              // Cập nhật thông tin lên các input tương ứng
              document.getElementById('TableName').value = data.tableName;
              document.getElementById('inputStartTime').value = data.startTime;
              document.getElementById('tableUsageId').value = data.tableUsageId;
              document.getElementById('tableId').value = data.tableId;
              document.getElementById('SaveActions').innerText = 'Tính Tiền';
              document.getElementById('SaveActions').setAttribute('onclick','payment()');
              populateInvoiceTable(data.services);

              // Thêm sự kiện onclick vào nút addservice
              const addServiceButton = document.getElementById('addServiceButton');
              addServiceButton.setAttribute('onclick', 'addService()');

              // Hiển thị modal khi điều kiện thỏa mãn
              const modal = new bootstrap.Modal(document.getElementById('ThemDichVuModal'));
              modal.show();

          })
          .catch(error => console.error('Error:', error));
  } else if( status === "Đang Trống") {
      // Đặt các input về giá trị mặc định
      getCustomer();
      document.getElementById('tableId').value=tableId;
      document.getElementById('inputStartTime').value = '';
      document.getElementById('SaveActions').setAttribute('onclick','calculateAndSave()');
      populateInvoiceTable([]);

      // Thêm sự kiện onclick vào nút addservice
      const addServiceButton = document.getElementById('addServiceButton');
      addServiceButton.setAttribute('onclick', 'addService2()');

       // Hiển thị modal khi điều kiện thỏa mãn
       const modal = new bootstrap.Modal(document.getElementById('ThemDichVuModal'));
       modal.show();
  }
  else{
    alert('Bàn đang hỏng không thể sử dụng');
    
  }
}

//Render danh sách sử dụng dịch vụ lên table
function populateInvoiceTable(services) {
  const tbody = document.querySelector('#invoiceTable tbody');
  tbody.innerHTML = ''; // Xóa các hàng cũ

  services.forEach((service, index) => {
      const row = `
          <tr>
              <td class="text-center">${index + 1}</td>
              <td class="text-center">${service.serviceType}</td>
              <td class="text-center">${service.serviceName}</td>
              <td class="text-center">${service.unitPrice} vnđ</td>
              <td class="text-center">${service.quantity}</td>
              <td class="text-center">${service.totalPrice} vnđ</td>
          </tr>
      `;
      tbody.insertAdjacentHTML('beforeend', row);
  });
}

async function addService() {
  const serviceId = document.getElementById('selectDichVu').value;
  const tableUsageId = document.getElementById('tableUsageId').value;
  const quantity = document.getElementById('soLuong').value;
  const tableId = document.getElementById('tableId').value;

  try {
      const response = await fetch('/api/add-service', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ serviceId, tableUsageId, quantity }),
      });

      const result = await response.json();
      if (response.ok) {
          alert(result.message);
          handleTableClick(tableId,"Đang Sử Dụng")
      } else {
          alert(result.message);
      }
  } catch (error) {
      console.error('Error:', error);
      alert('Đã có lỗi xảy ra! Vui lòng thử lại.');
  }
}

const closeModal = () => {
  const modal = bootstrap.Modal.getInstance(document.getElementById('ThemDichVuModal'));
  if (modal) {
      modal.hide();
      closeBackdrop(); // Xóa lớp nền mờ nếu còn
  }
};

const closeBackdrop = () => {
  const backdrops = document.getElementsByClassName('modal-backdrop');
  while (backdrops.length > 0) {
      backdrops[0].parentNode.removeChild(backdrops[0]);
  }
};

async function getCustomer(){

  fetch(`/api/customer`)
  .then(response => response.json())
  .then(customers => {
    const customerSelect = document.getElementById('CustomerName');
    customerSelect.innerHTML = ''; // Xóa các option hiện tại

    // Thêm option mặc định
    const defaultOption = document.createElement('option');
    defaultOption.selected = true;
    defaultOption.disabled = true;
    defaultOption.value=null;
    defaultOption.textContent = "Chọn khách hàng...";
    customerSelect.appendChild(defaultOption);

    // Thêm các option từ danh sách khách hàng
    customers.forEach(customer => {
      const option = document.createElement('option');
      option.value = customer._id;
      option.textContent = customer.name; 
      customerSelect.appendChild(option);
    });
  })
  .catch(error => console.error('Error fetching customers:', error));

}

function addService2() {
  const selectLoaiDichVu = document.getElementById('selectLoaiDichVu');
  const selectDichVu = document.getElementById('selectDichVu');
  const giaDichVu = document.getElementById('giaDichVu').value.replace(/[^0-9]/g, ''); // Chỉ lấy số từ giá
  const soLuong = parseInt(document.getElementById('soLuong').value, 10);
  
  // Kiểm tra nếu người dùng không nhập số lượng hoặc số lượng <= 0 thì không thêm
  if (isNaN(soLuong) || soLuong <= 0) {
    alert('Vui lòng nhập số lượng hợp lệ');
    return;
  }

  // Lấy thông tin tên loại dịch vụ và tên dịch vụ
  const loaiDichVuText = selectLoaiDichVu.options[selectLoaiDichVu.selectedIndex].text;
  const dichVuText = selectDichVu.options[selectDichVu.selectedIndex].text;
  const donGia = parseFloat(giaDichVu); // Giá cần parse sang float nếu có ký tự 'vnđ'

  // Tính thành tiền
  const thanhTien = donGia * soLuong;

  // Lấy bảng invoiceTable
  const invoiceTable = document.getElementById('invoiceTable').getElementsByTagName('tbody')[0];
  let rowExists = false;

  // Duyệt qua các hàng trong bảng để kiểm tra xem dịch vụ có tồn tại hay không
  for (let i = 0; i < invoiceTable.rows.length; i++) {
    const row = invoiceTable.rows[i];
    const rowDichVuText = row.cells[2].innerText; // Tên dịch vụ trong hàng hiện tại

    if (rowDichVuText === dichVuText) {
      // Nếu dịch vụ đã tồn tại, cập nhật số lượng và thành tiền
      const currentQuantity = parseInt(row.cells[4].innerText, 10);
      const newQuantity = currentQuantity + soLuong;
      const newThanhTien = newQuantity * donGia;

      // Cập nhật lại số lượng và thành tiền
      row.cells[4].innerText = newQuantity;
      row.cells[5].innerText = newThanhTien.toLocaleString() + " vnđ";
      rowExists = true;
      break;
    }
  }

  // Nếu dịch vụ chưa tồn tại, thêm một hàng mới vào bảng
  if (!rowExists) {
    const newRow = invoiceTable.insertRow();
    const rowCount = invoiceTable.rows.length;

    newRow.innerHTML = `
      <td class="text-center">${rowCount}</td>
      <td class="text-center">${loaiDichVuText}</td>
      <td class="text-center">${dichVuText}</td>
      <td class="text-center">${donGia.toLocaleString()} vnđ</td>
      <td class="text-center">${soLuong}</td>
      <td class="text-center">${thanhTien.toLocaleString()} vnđ</td>
      <td class="d-none"><input type="hidden" name="serviceId" value="${selectDichVu.value}"></td>
    `;
  }

  // Cập nhật lại các giá trị đầu vào cho dịch vụ mới
  document.getElementById('soLuong').value = '';
  document.getElementById('giaDichVu').value = ' vnđ';
  selectDichVu.selectedIndex = 0;
}

function calculateAndSave(){

  const tableId = document.getElementById('tableId').value;
  const customerId = document.getElementById('CustomerName').value;
  const start_time = document.getElementById('inputStartTime').value;

  const tableBody = document.getElementById('invoiceTable').querySelector('tbody');
  const servicesData = [];

  // Duyệt qua tất cả các dòng trong bảng
  tableBody.querySelectorAll('tr').forEach(row => {
      const serviceId = row.querySelector('input[name="serviceId"]').value;
      const quantity = row.cells[4].textContent;
      const totalPrice = row.cells[5].textContent;

      servicesData.push({
          serviceId: serviceId,
          quantity: parseInt(quantity),
          totalPrice: parseFloat(totalPrice)
      });
  });


  if( customerId === "null" || customerId ===''){
    alert('Vui lòng chọn khách hàng');
    return
  }
  else if(start_time===''){
    alert('Vui lòng chọn thời gian bắt đầu')
    return
  }

  const data ={
    tableId,
    customerId,
    start_time,
    servicesData
  }

  // Gửi yêu cầu POST lên server
  fetch('/api/calculateandsave', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(response => {
      if (response.ok) {
          alert('Dữ liệu đã được lưu thành công!');
          closeModal();
          location.reload();
      } else {
          console.error('Có lỗi xảy ra khi lưu dữ liệu!');
      }
  });

}


//Call api tính tiền
function payment(){
  const tableUsageId = document.getElementById('tableUsageId').value;
  const tableId = document.getElementById('tableId').value;

  const data ={tableUsageId,tableId}

  console.log(data)
  fetch('/api/payment', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
    }).then(response => {
      if (response.ok) {
          return response.json(); // Lấy dữ liệu phản hồi
      } else {
          console.error('Có lỗi xảy ra khi lưu dữ liệu!');
          throw new Error('Failed to save data'); // Ném lỗi để xử lý
      }
  }).then(data => {
      // Giả sử server trả về một object có id của hóa đơn
      const invoiceId = data.invoice._id; // Thay đổi 'id' thành tên thuộc tính phù hợp với phản hồi của bạn
  
      // Lưu invoiceId vào cookies với tên 'invoicesId'
     setCookie('invoicetotal',invoiceId,1)
      window.location.href = "/web/invoice";
  }).catch(error => {
      console.error('Có lỗi xảy ra:', error);
  });

}


function setCookie(cname, cvalue, exhours) {
  const d = new Date();
  d.setTime(d.getTime() + (exhours * 60 * 60 * 1000)); // Thời gian tính theo giờ
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
// Gọi hàm loadStudentList khi trang được tải
document.addEventListener('DOMContentLoaded', getTableList);

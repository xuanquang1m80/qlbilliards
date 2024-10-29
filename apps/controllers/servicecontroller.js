const ServiceType = require('../models/service-type');
const Service = require('../models/service');
const ServiceUsage = require('../models/service-usage');
const CustomerModel =  require('../models/customer');


const listtype = async (req,res)=>{

    ServiceType.find({})
    .then(data=>{
        res.json(data)
    })
    .catch(err=>{
        res.status(500).json('Lấy dữ liệu thất bại!!!')
    })

}


const getServicesByTypeId = async (req, res) => {
    try {
      // Lấy typeId từ request params (hoặc request body/query tùy vào cách bạn triển khai)
      const { typeId } = req.params; // hoặc req.query, req.body
  
      // Tìm các dịch vụ dựa trên typeId
      const services = await Service.find({ typeId }).exec();
  
      // Trả về danh sách dịch vụ
      res.status(200).json({
        services,
        total: services.length
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi khi lấy danh sách dịch vụ' });
    }
  };


const addServiceUsage = async(req,res)=>{
  try {
    const { serviceId, tableUsageId, quantity } = req.body;

    // Lấy giá dịch vụ
    const price = await getServicePrice(serviceId); // Hàm này cần được định nghĩa

    // Tìm kiếm dịch vụ đã tồn tại cho tableUsageId
    let serviceUsage = await ServiceUsage.findOne({ serviceId, table_usageId: tableUsageId });

    if (serviceUsage) {
      // Nếu dịch vụ đã tồn tại, cập nhật số lượng và tổng tiền
      serviceUsage.quantity = Number(serviceUsage.quantity) + Number(quantity);
      serviceUsage.totalprice = serviceUsage.quantity * price; // Cập nhật tổng tiền dựa trên số lượng mới
      serviceUsage.create_at = new Date().toISOString(); // Cập nhật thời gian tạo
      await serviceUsage.save();
    } else {
      // Nếu dịch vụ không tồn tại, thêm mới
      const totalPrice = price * quantity;
      serviceUsage = new ServiceUsage({
        serviceId,
        table_usageId: tableUsageId,
        quantity,
        totalprice: totalPrice,
        create_at: new Date().toISOString(),
      });
      await serviceUsage.save();
    }

    res.status(201).json({ message: 'Dịch vụ đã được thêm hoặc cập nhật thành công!', serviceUsage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Đã có lỗi xảy ra!' });
  }
}


async function getServicePrice(serviceId) {
  // Giả sử bạn có mô hình Service để truy vấn
  const service = await Service.findById(serviceId);
  return service ? service.price : 0; // Trả về giá dịch vụ
}


const getCustomer = async (req,res)=>{
 
  CustomerModel.find({})
  .then(data=>{
      res.json(data)
  })
  .catch(err=>{
      res.status(500).json('Lấy dữ liệu thất bại!!!')
  })

}


module.exports = {
    listtype,
    getServicesByTypeId,
    addServiceUsage,
    getCustomer
}
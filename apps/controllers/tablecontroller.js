const { name } = require('ejs');
const moment = require('moment');
const TableModel = require('../models/billiards-table');
const StatusModel = require('../models/status');
const TypeTable = require('../models/table-type');
const CustomerModel = require('../models/customer');
const ServiceUsage = require('../models/service-usage');
const TableUsage = require('../models/table-usage');
const Service = require('../models/service');
const ServiceType = require('../models/service-type');
const Invoice = require('../models/invoices');
const mongoose = require('mongoose');
const { get } = require('../routes/web');

const listtable = async (req,res) =>{


    try {
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 5;
        let skip = (page - 1) * limit;
    
        // Lấy danh sách các bàn với phân trang và `populate` để lấy tên trạng thái
        const tables = await TableModel.find({})
          .skip(skip)
          .limit(limit)
          .populate('statusId', 'name') // Thay thế `statusId` bằng tên trường bạn muốn lấy
          .exec();
    
        // Đếm tổng số lượng document
        const total = await TableModel.countDocuments({});
    
        // Định dạng dữ liệu trả về
        const result = tables.map(table => ({
          id: table._id,
          name: table.name,
          status: table.statusId ? table.statusId.name : 'Unknown' // Đảm bảo không bị lỗi nếu `statusId` là null
        }));
    
        res.json({
          tables: result,
          total: total,
          page: page,
          totalPages: Math.ceil(total / limit)
        });
    
      } catch (err) {
        console.error(err);
        res.status(500).json('Lỗi khi lấy danh sách');
      }

    
}

const listtype = async (req,res)=>{

    TypeTable.find({})
    .then(data=>{
        res.json(data)
    })
    .catch(err=>{
        res.status(500).json('Lấy dữ liệu loại bàn thất bại!!!')
    })

}

const addtable = async (req,res)=>{
    const { name, typeId } = req.body;

  if (!name || !typeId) {
    return res.status(400).json({ message: 'Tên và loại bàn là bắt buộc.' });
  }

  try {
    // Tạo mới bàn với dữ liệu từ yêu cầu
    const newTable = new TableModel({
      name: name,
      typeId: typeId,
      is_active: true, // Mặc định là bàn đang hoạt động (có thể thay đổi theo yêu cầu)
      statusId: '671a87694034b56b5be02e23'
    });

    // Lưu vào cơ sở dữ liệu
    await newTable.save();
    res.status(201).json({ message: 'Thêm bàn thành công!', table: newTable });
  } catch (err) {
    console.error('Lỗi khi thêm bàn:', err);
    res.status(500).json({ message: 'Lỗi khi thêm bàn.' });
  }
}


//Get Thông tin bàn đang sử dụng 
const getTableUsage = async(req,res)=>{

  try {
    const tableId = req.params.id;

    // Truy vấn để lấy dữ liệu từ bảng `table-usage`
    const tableUsage = await TableUsage.findOne({ tableId: tableId, complete: false }).populate('customerId').populate('tableId');
    
    if (!tableUsage) {
      return res.status(404).json({ message: 'No usage record found for this table.' });
    }

    // Lấy thông tin chi tiết từ bảng `customer` dựa trên `customerId`
    const customer = tableUsage.customerId;
    
    console.log(customer)
    const table = tableUsage.tableId;

     // Truy vấn để lấy các dịch vụ liên quan từ bảng `service-usage` dựa trên `tableUsage._id`
     const serviceUsages = await ServiceUsage.find({ table_usageId: tableUsage._id })
     .populate({
       path: 'serviceId',
       populate: {
         path: 'typeId',
         model: 'service-type'
       }
     });

   // Chuẩn bị dữ liệu dịch vụ cho phản hồi
   const services = serviceUsages.map(serviceUsage => {
     const service = serviceUsage.serviceId;
     const serviceType = service?.typeId?.name || 'N/A'; // Lấy tên loại dịch vụ

     return {
       serviceType: serviceType,
       serviceName: service?.name || 'N/A',
       unitPrice: service?.price ? parseFloat(service.price.toString()) : 0,
       quantity: serviceUsage.quantity,
       totalPrice: parseFloat(serviceUsage.totalprice.toString())
     };
   });

    // Chuẩn bị dữ liệu trả về
    const data = {
      tableId: tableId,
      tableUsageId: tableUsage.id,
      tableName: table.name,
      customerName: customer.name,
      startTime: tableUsage.start_time,
      services: services
    };

    return res.json(data);
  } catch (err) {
    console.error('Error fetching table details:', err);
    res.status(500).json({ message: 'Internal server error' });
  }

}


const calculateAndSave = async(req,res)=>{

  try {
    const { tableId, customerId, start_time, servicesData } = req.body;


    
    // Tạo mới bản ghi trong bảng TableUsage
    const newTableUsage = new TableUsage({
        tableId: tableId,
        customerId: customerId,
        start_time: start_time,
        end_time:'',
        total_duration:'',
        reservationId:'',
        complete: false,
    });
    const savedTableUsage = await newTableUsage.save();

    // Lấy ra tableUsageId vừa tạo
  const tableUsageId = savedTableUsage._id;


    //Tạo các bản ghi trong bảng ServiceUsage dựa trên servicesData
    const serviceUsages = servicesData.map(service => (
      {
        table_usageId: tableUsageId,
        serviceId: service.serviceId,
        quantity: service.quantity,
        totalprice: mongoose.Types.Decimal128.fromString(service.totalPrice.toFixed(2))*1000,
        create_at: new Date().toISOString()
     }));

    // Lưu tất cả các serviceUsages vào bảng ServiceUsage
    await ServiceUsage.insertMany(serviceUsages);

    await setStatusTable(tableId, 'Đang Sử Dụng')

    res.status(200).json({ message: 'Dữ liệu đã được lưu thành công!' });
  } catch (error) {
      console.error('Có lỗi xảy ra:', error);
      res.status(500).json({ error: 'Có lỗi xảy ra khi lưu dữ liệu!' });
  }



}

const setStatusTable = async(tableId, statusname)=>{
  try {
    // Tìm trạng thái dựa trên tên trạng thái
    const status = await StatusModel.findOne({ name: statusname });

    if (!status) {
      throw new Error(`Không tìm thấy trạng thái`);
    }

    // Cập nhật trạng thái của bàn
    await TableModel.findByIdAndUpdate(tableId, {
      statusId: status._id
    });

    console.log(`Cập nhật trạng thái của bàn thành công!`);
  } catch (error) {
    console.error(`Lỗi khi cập nhật trạng thái của bàn: ${error.message}`);
  }
}


const calculateDuration = (start_time) => {
 
  const now = new Date();
  // Tạo đối tượng thời gian từ chuỗi giờ bắt đầu
  const [hours, minutes] = start_time.split(':').map(Number);
  const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

  // Nếu thời gian bắt đầu lớn hơn thời gian hiện tại, trả về 0
  if (startTime > now) {
    startTime.setDate(startTime.getDate() - 1);
  }
  
    // Tính toán độ dài thời gian sử dụng
    const durationInMs = now - startTime; // Độ dài thời gian tính bằng mili giây
    const durationInMinutes = Math.floor(durationInMs / (1000 * 60)); // Chuyển đổi thành phút

    // Chuyển đổi thành giờ và làm tròn
    const durationInHours = Math.round(durationInMinutes / 60 * 10) / 10; // Làm tròn đến một chữ số thập phân


  return durationInHours; // Trả về tổng thời gian sử dụng tính bằng phút
};

const calculateTableCost = (durationHours, table) => {
  const tablePricePerHour = parseFloat(table.typeId.price.toString());
  return durationHours * tablePricePerHour;
};

const calculateTotalServiceCost = async (tableUsageId) => {
  const serviceUsages = await ServiceUsage.find({ table_usageId: tableUsageId });
  return serviceUsages.reduce((acc, service) => acc + parseFloat(service.totalprice), 0);
};

//Xử lý tính tiền
const payment= async (req,res)=>{
  try {

  const {tableUsageId,tableId}= req.body;

   // Lấy thông tin sử dụng bàn
   const tableUsage = await TableUsage.findById(tableUsageId);
   if (!tableUsage) return res.status(404).json({ message: 'Không tìm thấy thông tin sử dụng bàn' });

   // Tính thời gian sử dụng và chi phí bàn
   const durationHours = calculateDuration(tableUsage.start_time);


   //console.log(tableUsage.start_time,durationHours)

    // Lấy thông tin bàn và loại bàn
    const table = await TableModel.findById(tableId).populate('typeId');
    if (!table || !table.typeId) return res.status(404).json({ message: 'Không tìm thấy thông tin loại bàn' });
    // Tính chi phí bàn
    const tableCost = calculateTableCost(durationHours, table);

    // // Tính tổng tiền dịch vụ
    const totalServiceCost = await calculateTotalServiceCost(tableUsageId);

    // // Tính tổng tiền
    const totalAmount = tableCost + totalServiceCost;


    //  // Tạo tài liệu hóa đơn mới
      const newInvoice = new Invoice({
            table_usageId: tableUsageId,
            customerId: tableUsage.customerId,
            payment_method: '', // Mặc định hoặc theo yêu cầu
            total_amount: totalAmount.toString(),
            status: 'Chờ thanh toán',
            update_at: moment().toISOString()
        });

    //     // Lưu hóa đơn
        await newInvoice.save();

        // Cập nhật thời gian kết thúc và tổng thời gian sử dụng cho table usage
        tableUsage.end_time = moment().toISOString();
        tableUsage.total_duration = durationHours.toFixed(2);
        tableUsage.tableprice = tableCost;
        tableUsage.complete = true;
        await tableUsage.save();

        setStatusTable(tableId,'Đang Trống');

     res.status(200).json({ message: 'Tạo hóa đơn thành công', invoice: newInvoice });
   
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi tính toán và tạo hóa đơn', error });
  }


}


const getInfoInvoice = async(req,res)=>{

  try {
    const invoiceId = req.cookies.invoicetotal;

    // Truy vấn và populate các thông tin cần thiết
    const invoice = await Invoice.findById(invoiceId)
        .populate({
            path: 'table_usageId',
            populate: {
                path: 'tableId',
                populate: {
                    path: 'typeId' // Populate để lấy thông tin loại bàn và giá loại bàn
                }
            }
        })
        .populate('customerId'); // Populate thông tin khách hàng

    // Nếu không tìm thấy hóa đơn
    if (!invoice) {
        return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    }

    // Lấy danh sách dịch vụ đã sử dụng
    const serviceUsages = await ServiceUsage.find({ table_usageId: invoice.table_usageId })
        .populate('serviceId');

    // Tạo response với các thông tin cần thiết
    const responseData = {
        invoiceId: invoice._id,
        customerName: invoice.customerId.name,
        tableName: invoice.table_usageId.tableId.name,
        tableType: invoice.table_usageId.tableId.typeId.name,
        tablePrice: invoice.table_usageId.tableId.typeId.price.toString(), // Convert Decimal128 to string
        startTime: invoice.table_usageId.start_time,
        endTime: invoice.table_usageId.end_time,
        totalDuration: invoice.table_usageId.total_duration,
        tableCost: invoice.table_usageId.tableprice,
        services: serviceUsages.map(service => ({
            serviceName: service.serviceId.name,
            quantity: service.quantity,
            unitPrice: service.serviceId.price.toString(), // Convert Decimal128 to string
            totalPrice: service.totalprice.toString() // Convert Decimal128 to string
        })),
        totalAmount: invoice.total_amount
    };

    // Trả về dữ liệu JSON
    res.json(responseData);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi khi lấy dữ liệu hóa đơn' });
  }


}


//Get table for manager 
const getTableList = async(req,res)=>{

  try {

    let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 5;
        let skip = (page - 1) * limit;

    // Truy vấn tất cả các bàn và populate thông tin loại bàn và trạng thái
    const tables = await TableModel.find()
          .skip(skip)
          .limit(limit)
      .populate('typeId', 'name price') // Chỉ lấy tên và giá của loại bàn
      .populate('statusId', 'name') // Chỉ lấy tên của trạng thái
      .exec();

    const total = await TableModel.countDocuments({});
    // Trả về kết quả dưới dạng JSON
    res.status(200).json({
      tables,
      total: total,
        page: page,
        totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Có lỗi xảy ra khi lấy danh sách bàn!' });
  }

}


const getDetailTable = async(req,res)=>{
  try {
    const tableId = req.params.id;
    
    // Lấy thông tin bàn, loại bàn và trạng thái
    const table = await TableModel.findById(tableId).populate('typeId statusId').lean();
    const allTypes = await TypeTable.find().lean();
    const allStatuses = await StatusModel.find().lean();

    if (!table) return res.status(404).json({ message: 'Không tìm thấy bàn' });

    res.json({
        tableId: table._id,
        name: table.name,
        typeId: table.typeId?._id,
        statusId: table.statusId?._id,
        allTypes,
        allStatuses
    });
  } catch (error) {
      console.error('Lỗi khi lấy chi tiết bàn:', error);
      res.status(500).json({ message: 'Lỗi server' });
  }
}

const updatedTable= async (req, res)=>{
    const tableId = req.params.id;
    const { name, typeId, statusId } = req.body;

    TableModel.findByIdAndUpdate(tableId, { name, typeId, statusId }, { new: true })
        .then(updatedTable => {
            res.status(200).json(updatedTable);
        })
        .catch(error => {
            console.error('Lỗi cập nhật bàn:', error);
            res.status(500).json({ error: 'Cập nhật không thành công' });
        });
}

const overview= async( req, res)=>{
  try {
    // Đếm tổng số bàn
    const totalTables = await TableModel.countDocuments();

    // Đếm số bàn đang sử dụng (is_active = true hoặc dựa vào bản ghi chưa hoàn thành trong table-usage)
    const tablesInUse = await TableUsage.countDocuments({ complete: false });

    // Đếm tổng số khách hàng
    const totalCustomers = await CustomerModel.countDocuments();

    res.status(200).json({
        totalTables,
        tablesInUse,
        totalCustomers
    });
  } catch (error) {
      console.error('Lỗi khi lấy số liệu tổng quan:', error);
      res.status(500).json({ error: 'Lỗi server' });
  }
}

const calculateMonthlyRevenue = async (req,res) => {
  try {
    const monthlyRevenue = await Invoice.aggregate([
      {
        $match: { status: 'Đã Thanh Toán' }  // Lọc các hóa đơn đã hoàn thành
      },
      {
        $group: {
          _id: { month: { $month: { $toDate: "$update_at" } } },  // Nhóm theo tháng
          total: { $sum: { $toDouble: "$total_amount" } }
        }
      },
      {
        $sort: { "_id.month": 1 }
      }
    ]);


    res.status(200).json(monthlyRevenue)


  } catch (error) {
    
    console.error("Lỗi lấy doanh thu theo tháng: ", error);
    res.status(500).send('Lỗi khi lấy dữ liệu doanh thu');
  }
};

const getInvoicesForToday = async (req, res) => {
  try {
    
    const invoices = await Invoice.find({
      status: "Đã Thanh Toán" 
    }).populate('customerId');

  
    res.json(invoices);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching invoices');
  }
};


const updateInvoice = async(req,res)=>{
  try {
    // Lấy ID từ cookie
    const invoiceId = req.cookies.invoicetotal; // giả sử bạn lưu ID hóa đơn trong cookie

  
    // Lấy payment_method từ body của request
    const payment_method  = req.body.status;
    // Kiểm tra xem ID và payment_method có hợp lệ không
    if (!invoiceId || !payment_method) {
        return res.status(400).json({ message: "ID hóa đơn hoặc phương thức thanh toán không hợp lệ." });
    }

    // Cập nhật invoice
    const updatedInvoice = await Invoice.findByIdAndUpdate(
        invoiceId,
        { 
            payment_method: payment_method, 
            status: "Đã Thanh Toán" 
        },
        { new: true } // Để trả về tài liệu đã cập nhật
    );

    // Kiểm tra xem hóa đơn có được cập nhật không
    if (!updatedInvoice) {
        return res.status(404).json({ message: "Hóa đơn không tìm thấy." });
    }

    // Trả về hóa đơn đã được cập nhật
    res.json(updatedInvoice);
    } catch (error) {
        console.error("Error updating invoice:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi trong quá trình cập nhật." });
    }
}

module.exports = {
  listtable,
   listtype,
   addtable,
   getTableUsage,
   calculateAndSave,
   payment,
   getInfoInvoice,
   getTableList,
   getDetailTable,
   updatedTable,
   overview,
   calculateMonthlyRevenue,
   getInvoicesForToday,
   updateInvoice
}
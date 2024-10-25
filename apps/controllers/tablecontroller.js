const { name } = require('ejs');
const TableModel = require('../models/billiards-table');
const StatusModel = require('../models/status');
const TypeTable = require('../models/table-type')

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




module.exports = {listtable, listtype,addtable}
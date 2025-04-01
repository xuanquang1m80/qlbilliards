const TableModel = require('../models/billiards-table');
const StatusModel = require('../models/status');
const CustomerModel = require('../models/customer');
const ReservationsModel = require('../models/reservations');
const mongoose = require('mongoose');
const { get } = require('../routes/web');
const { ObjectId } = require('mongoose').Types;
const TableUsageModel = require('../models/table-usage');


const tableandcustomer= async (req,res)=>{

    try{

    const tables= await TableModel.find();
    const customers = await CustomerModel.find();
    
    res.json({
        customers: customers.map(customer => ({
            _id: customer._id,
            name: customer.name
        })),
        tables: tables.map(table => ({
            _id: table._id,
            name: table.name
        }))
    });

    }catch(error){
        console.log(error)
        res.status(500).json('Lấy dữ liệu thất bại!!!')
    }


}


const addbooking = async (req,res)=>{

    try {
        const user = req.user;
        console.log(user)


        const { customerId, start_time, tableId} = req.body;

        // Xác định trạng thái của đặt bàn
        const status = tableId ? "Đã Xếp Bàn" : "Chưa Xếp Bàn";

        // Tạo đối tượng đặt bàn mới
        const newReservation = new ReservationsModel({
            customerId: new mongoose.Types.ObjectId(customerId),
            tableId: tableId ? new mongoose.Types.ObjectId(tableId) : undefined,
            start_time,
            status,
            reservation_date: new Date() // Lấy ngày hiện tại
        });

        // Lưu đặt bàn vào cơ sở dữ liệu
        await newReservation.save();

        // Trả về phản hồi thành công
        res.status(201).json({
            message: 'Đặt bàn thành công',
            reservation: newReservation
        });
    } catch (error) {
        console.error('Lỗi khi đặt bàn:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi đặt bàn.' });
    }


}

const listbooking = async (req,res)=>{

    try {
        // Lấy danh sách đặt bàn từ database và populate thông tin khách hàng
        const bookings = await ReservationsModel.find()
          .populate('customerId', 'name phone')
          .populate('tableId', 'name')
          .exec();
    
        // Trả về danh sách đặt bàn
        res.json({ bookings });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách đặt bàn.' });
      }

}

const detailbooking = async(req,res)=>{
    try {
        const booking = await ReservationsModel.findById(req.params.id)
          .populate('customerId', 'name phone')
          .populate('tableId', 'name')
          .exec();
        
        const availableTables = await TableModel.find().select('_id name');;

        if (!booking) {
          return res.status(404).json({ message: 'Không tìm thấy thông tin đặt bàn.' });
        }
    
        res.json({ 
            booking,availableTables });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy chi tiết đặt bàn.' });
      }
}

const deletebooking = async (req,res)=>{
    try {
        // Tìm và xóa đặt bàn bằng ID
        const deletedBooking = await ReservationsModel.findByIdAndDelete(req.params.id);
        
        // Kiểm tra nếu không tìm thấy đặt bàn để xóa
        if (!deletedBooking) {
            return res.status(404).json({ message: 'Không tìm thấy đặt bàn để xóa.' });
        }

        // Trả về phản hồi thành công
        res.json({ message: 'Đặt bàn đã được xóa thành công.' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ message: 'Lỗi khi xóa đặt bàn.' });
    }
}

const canclebooking = async (req,res)=>{
    try {
        const statusUpdate = { status: 'Đã Hủy' }; 

        // Tìm và cập nhật đặt bàn bằng ID
        const booking = await ReservationsModel.findByIdAndUpdate(req.params.id, statusUpdate, { new: true });

        if (!booking) {
            return res.status(404).json({ message: 'Không tìm thấy đặt bàn.' });
        }

        // Trả về phản hồi thành công
        res.json({ message: 'Đặt bàn đã được hủy thành công.' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ message: 'Lỗi khi hủy đặt bàn.' });
    }
}

const receibooking = async(req,res)=>{
    const { bookingId, tableId, start_time } = req.body;

       
    try {
      // Tìm kiếm bàn theo tableId
      const table = await TableModel.findById(tableId);
  
      if (!table) {
        return res.status(404).json({ message: 'Bàn không tồn tại.' });
      }
  
      if (!table.statusId.equals(new ObjectId('671a87694034b56b5be02e23'))) {
        return res.status(400).json({ message: 'Bàn đã được sử dụng hoặc không sẵn có.' });
      }
  

       // Cập nhật trạng thái đặt bàn thành "Đã Nhận Bàn"
    const booking = await ReservationsModel.findByIdAndUpdate(
        bookingId,
        { status: 'Đã Xác Nhận'},
        { new: true }
      );
     
     // Cập nhật trạng thái bàn thành 'Đang Sử Dụng'
      table.statusId = '671a877b4034b56b5be02e24';
      await table.save();
  
       // Chuyển đổi bookingId và tableId thành ObjectId
       const reservationId = new ObjectId(bookingId);
       const tableObjectId = new ObjectId(tableId);


      // Thêm dữ liệu vào bảng tableUsage
      const newUsage = new TableUsageModel({
        tableId: tableObjectId,
        reservationId: reservationId,
        customerId: booking.customerId,
        start_time,
        complete: false
      });
      await newUsage.save();


      // Trả về thông báo thành công
      res.status(200).json({ message: 'Đã nhận bàn thành công.' });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi khi nhận bàn.' });
    }
}

module.exports = {
    tableandcustomer,
    addbooking,
    listbooking,
    detailbooking,
    deletebooking,
    canclebooking,
    receibooking
}
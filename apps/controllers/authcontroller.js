
const AccountModel = require('../models/accounts')
var bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken');

const login = async (req,res)=>{

  try {
    const { username, password } = req.body;

    // Bước 1: Tìm người dùng dựa trên tên đăng nhập
     const user = await AccountModel.findOne({ username: username });
    if (!user) {
      return res.status(400).json({ message: "Người dùng không tồn tại" });
    }

    // Bước 2: So sánh mật khẩu bản rõ với mật khẩu đã băm
     const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không chính xác" });
    }

      // Tạo JWT
      const token = jwt.sign(
        {
          sub: user._id,       // ID người dùng
          role: user.role,     // Vai trò
          iat: Math.floor(Date.now() / 1000),  // Thời gian phát hành
          exp: Math.floor(Date.now() / 1000) + (60 * 60)  // Thời gian hết hạn (1 giờ)
        },
        process.env.JWT_SECRET // Khóa bí mật để mã hóa token
      );

    // Bước 3: Nếu đúng, tạo JWT hoặc session
      res.status(200).json({
        message: "Đăng nhập thành công",
        token: `Bearer ${token}`
      });

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Lỗi server", error });
  }


}

const authtoken = (req,res)=>{

  const strtoken = req.headers['authorization'];

  const token = strtoken.split(" ")[1];
  
  console.log(token)
  if (!token) {
      return res.status(401).json({ message: 'Bạn chưa đăng nhập !!!' });
  }

  // Xác thực token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
          return res.status(403).json({ message: 'Thời gian đã hết. Vui lòng đăng nhập lại!!!' });
      }

      // Nếu token hợp lệ, trả về thành công
      res.status(200).json({ message: 'Token hợp lệ', user });
  });
}


module.exports = {login,authtoken};

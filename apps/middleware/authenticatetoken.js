
const jwt = require('jsonwebtoken');

const checkcookies = (req,res,next)=>{

    const strtoken = req.cookies.token;
  
  
    if (!strtoken) {
       // return res.status(401).json({ message: 'Bạn chưa đăng nhập !!!' });
       return res.redirect('/web/login');
    }

    const token = strtoken.split(" ")[1];
    // Xác thực token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
           // return res.status(403).json({ message: 'Thời gian đã hết. Vui lòng đăng nhập lại!!!' });
            return res.redirect('/web/login');
        }
  
        // Nếu token hợp lệ, trả về thành công
        req.user = user;
        next()
    });
}

module.exports = {checkcookies}
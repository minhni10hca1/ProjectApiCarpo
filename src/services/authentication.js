import HTTPStatus from 'http-status';
const getRole = require('../handlers/helpers').getRole;
import User from '../modules/users/user.model';
import successCode from '../utils/successCode';
// Role authorization check
exports.roleAuthorization = function (requiredRole) {
  return function (req, res, next) {
    try {
      let _id = req.user._id || ''; //ko cần dùng authkey nữa
      User.findById(_id, (err, foundUser) => {
        if (err) {
          return res.status(HTTPStatus.NOT_FOUND).json({
            success: successCode.success0,
            data: 'Người dùng không tồn tại.',
            status: HTTPStatus.NOT_FOUND,
          });
        }
        // tìm thấy người dùng ktra role
        if (getRole(foundUser.role) >= getRole(requiredRole)) {
          return next(); //làm tiếp 1 tác vụ nào đó khi đk này ok
        }
        return res.status(HTTPStatus.FORBIDDEN).json({
          success: successCode.success0,
          data: 'Bạn không có quyền truy cập.',
          status: HTTPStatus.FORBIDDEN,
        });
      });
    } catch (error) {
      return res.status(HTTPStatus.BAD_REQUEST).json({
        success: successCode.success0,
        data: 'Request không hợp lệ.',
        status: HTTPStatus.BAD_REQUEST,
      });
    }
  };
};

import HTTPStatus from 'http-status';

import User from './user.model';
import { hashSync, compareSync } from 'bcrypt-nodejs';
import jwt from 'jsonwebtoken';
import successCode from '../../utils/successCode';
import settings from '../../config/settings';
import passport from 'passport';
var moment = require('moment');
const logger4 = require('../../utils/loggerdb'); //luu log db
import formatDateTime from '../../utils/formatDateTime';
import constants from '../../config/constants';
//HandlingError
var getErrorMessage = function (err) {
  var message = '';
  for (var errName in err.errors) {
    if (err.errors[errName].message) {
      message = err.erroes[errName].message;
    }
  };
}

export async function signUp(req, res) {
  try {
    var objUser = {};
    Object.keys(req.body).forEach(key => {
      objUser[key] = req.body[key];
      if (key == 'birthday') {
        var birthday = moment(req.body[key], ["DD/MM/YYYY", "YYYY-MM-DD"]);
        objUser[key] = moment(birthday).format('YYYY-MM-DD');
      }
    });
    const user = await User.create(objUser);
    return res.status(HTTPStatus.CREATED).json(user.toAuthJSON());
  } catch (e) {
    return res.status(HTTPStatus.BAD_REQUEST).json(e);
  }
}

export function login(req, res, next) {
  res.status(HTTPStatus.OK).json(req.user.toAuthJSON());
  return next();
}


export function register(req, res) {
  var objUser = {};
  Object.keys(req.body).forEach(key => {
    objUser[key] = req.body[key];
    if (key == 'birthday') {
      var birthday = moment(req.body[key], ["DD/MM/YYYY", "YYYY-MM-DD"]);
      objUser[key] = moment(birthday).format('YYYY-MM-DD');
    }
  });
  var newUser = new User(objUser);
  newUser.hash_password = hashSync(objUser.password);
  newUser.status = (settings.confirmRegister == 1) ? 'INACTIVE' : 'ACTIVE';
  // Nếu yêu cầu kích hoạt tài khoản qua email thì trạng thái tài khoản là INACTIVE
  newUser.save(function (err, user) {
    if (err) {
      return res.status(HTTPStatus.BAD_REQUEST).send({
        success: successCode.success0,
        message: err,
        status: HTTPStatus.BAD_REQUEST
      });
    } else {
      // console.log('tao moi');
      user.hash_password = undefined;
      return res.json(user);
    }
  });
};

//login có mã hóa password
export async function signIn(req, res) {
  try {
    let appData = {};
    User.findOne({
      username: req.body.username
    }, function (err, user) {
      if (err) throw err;
      if (!user) {
        return res.status(HTTPStatus.OK).json({
          success: successCode.success0,
          message: 'Tên đăng nhập không tồn tại.',
          status: HTTPStatus.OK
        });
      } else if (user) {
        if (!user.comparePassword(req.body.password)) {
          return res.status(HTTPStatus.OK).json({
            success: successCode.success0,
            message: 'Sai mật khẩu.',
            status: HTTPStatus.OK
          });
        } else {
          if (user.isInActivated(user.status)) {
            return res.status(HTTPStatus.OK).json({
              success: successCode.success0,
              message: 'Tài khoản chưa được kích hoạt.',
              status: HTTPStatus.OK
            });
          }

          if (user.isSuspended(user.status)) {
            return res.status(HTTPStatus.OK).json({
              success: successCode.success0,
              message: 'Tài khoản đang bị khóa.',
              status: HTTPStatus.OK
            });
          }
          var clientAgent = {
            agent: req.header('user-agent'), // User Agent we get from headers
            host: req.header('host'), //  Likewise for referrer
            ip: req.header('x-forwarded-for') || req.connection.remoteAddress, // Get IP - allow for proxy
            created_Date: formatDateTime.localTime,
            action: 'Login',
            descriptions: 'Logged in.'
          };
          logger4.user.info({ client: clientAgent, uid: user._id, name: user.username });
          return res.json({
            success: successCode.success1,
            data: user.toAuthJSON(),
            status: HTTPStatus.OK
          });
        }
      }
    });
  } catch (error) {
    appData['success'] = successCode.success0;
    appData['data'] = 'Có lỗi trong khi nhận dữ liệu ' + error;
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
};

//login ko mã hóa password
export async function signInNotBcrypt(req, res) {
  let appData = {};
  try {
    let userLogin = await User.find({ username: req.body.username, password: req.body.password }).limit(1);
    if (!userLogin || userLogin.length == 0) {
      return res.status(HTTPStatus.OK).json({
        success: successCode.success0,
        message: 'Tên đăng nhập hoặc mật khẩu không chính xác.',
        status: HTTPStatus.OK
      });
    } else {
      if (userLogin.status == 'INACTIVE') {
        return res.status(HTTPStatus.OK).json({
          success: successCode.success0,
          message: 'Tài khoản chưa được kích hoạt.',
          status: HTTPStatus.OK
        });
      }

      if (userLogin.status == 'SUSPENDED') {
        return res.status(HTTPStatus.OK).json({
          success: successCode.success0,
          message: 'Tài khoản đang bị khóa.',
          status: HTTPStatus.OK
        });
      }
      var clientAgent = {
        agent: req.header('user-agent'), // User Agent we get from headers
        host: req.header('host'), //  Likewise for referrer
        ip: req.header('x-forwarded-for') || req.connection.remoteAddress, // Get IP - allow for proxy
        created_Date: formatDateTime.localTime,
        action: 'Login',
        descriptions: 'Logged in.'
      };

      var expiresIn = userLogin.token_expiresIn || 3600;
      var element = {};
      userLogin.forEach(function (us) {
        element._id = us._id;
        element.username = us.username;
        element.access_token = `JWT ${createTokenNotBcrypt(us._id, (3600 * expiresIn))}`;
        element.email = us.email;
        element.fullname = us.fullname;
        element.phone = us.phone;
        element.birthday = us.birthday;
        element.photo = us.photo;
        element.sex = us.sex;
        element.face_id = us.face_id;
        element.google_id = us.google_id;
        element.role = us.role;
        element.permissions = [];
        element.expires_in = settings.tokenExpired * us.token_expiresIn;
        element.token_expiresIn = us.token_expiresIn;
        element.status = us.status;
        element.role_code = us.role_code;
        element.customer_id = us.customer_id;
      });
      logger4.user.info({ client: clientAgent, uid: element._id, name: element.username });
      return res.json({
        success: successCode.success1,
        data: element,
        status: HTTPStatus.OK
      });
    }

  } catch (error) {
    appData['success'] = successCode.success0;
    appData['data'] = 'Có lỗi trong khi nhận dữ liệu ' + error;
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
};

export function createTokenNotBcrypt(id, expiry) {
  return jwt.sign(
    {
      _id: id
    },
    constants.JWT_SECRET,
    {
      expiresIn: expiry
    }
  );
};

export async function loginRequired(req, res, next) {
  if (req.user) {
    next();
  } else {
    return res.status(HTTPStatus.UNAUTHORIZED).json({ message: 'Unauthorized user!' });
  }
};

/**begin tìm tất cả */
export async function findAll(req, res) {
  let appData = {};
  try {
    let user = await User.find({}).sort({ createdAt: -1 });
    if (!user) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu';
      appData['status'] = HTTPStatus.NOT_FOUND;
      return res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      appData['success'] = successCode.success1;
      appData['data'] = user;
      appData['status'] = HTTPStatus.OK;
      return res.status(HTTPStatus.OK).json(appData);
    }
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = 'Có lỗi trong khi nhận dữ liệu ' + err;
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
};
/**end tìm tất cả */

/**begin tìm tất cả paging */
export async function findAllPaging(req, res) {
  const pageSize = parseInt(req.query.pageSize, 0) || 10; //neu ko send param thi la 10
  var page = parseInt(req.query.page, 0) || 1;
  var filter = null;
  filter = req.query.filter;
  let appData = {};
  try {
    var filterRoleCode = req.query.role_code;
    var filterStatus = req.query.status;
    var criteria = {};
    if (filter != undefined && filter != null && filter.trim() != '') {
      criteria.username = { '$regex': filter.trim(), '$options': 'i' };
    }
    if (filterRoleCode != undefined && filterRoleCode != null && filterRoleCode.trim() != '') {
      criteria.role_code = filterRoleCode.trim();
    }
    if (filterStatus != undefined && filterStatus != null && filterStatus.trim() != '') {
      criteria.status = filterStatus.trim();
    }
    await User.find(criteria).skip((page - 1) * pageSize).limit(pageSize).sort({ createdAt: -1 })
      .exec(function (err, users) {
        User.count(criteria).exec(function (err, count) {
          if (err) return next(err);
          appData['success'] = successCode.success1;
          appData['data'] = users;
          appData['PageIndex'] = parseInt(page);
          appData['PageSize'] = pageSize;
          appData['TotalRows'] = count;
          appData['status'] = HTTPStatus.OK;
          return res.status(HTTPStatus.OK).json(appData);
        })
      });
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = 'Có lỗi trong khi nhận dữ liệu ' + err;
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
};
/**end tìm tất cả */

/** Tìm theo id*/
exports.findOne = async (req, res) => {
  let appData = {};
  let id = req.params.id;

  try {
    let user = await User.findById(id);
    if (!user) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu';
      appData['status'] = HTTPStatus.NOT_FOUND;
      return res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      appData['success'] = successCode.success1;
      appData['data'] = user;
      appData['status'] = HTTPStatus.OK;
      return res.status(HTTPStatus.OK).json(appData);
    }
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = 'Có lỗi trong khi nhận dữ liệu ' + err;
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
};
/** End Tìm theo id*/

/** Cập nhật theo id */
export async function update(req, res) {
  let appData = {};
  let _id = req.params.id;

  try {
    // var param_bodys = {
    //   email: req.body.email,
    //   fullname: req.body.fullname,
    //   phone: req.body.phone,
    //   birthday: moment(req.body.birthday, ["DD/MM/YYYY", "YYYY-MM-DD"]),
    //   photo: req.body.photo,
    //   sex: req.body.sex,
    //   face_id: req.body.face_id,
    //   google_id: req.body.google_id
    // }
    var objUser = {};
    Object.keys(req.body).forEach(key => {
      objUser[key] = req.body[key];
      if (key == 'birthday') {
        var birthday = moment(req.body[key], ["DD/MM/YYYY", "YYYY-MM-DD"]);
        objUser[key] = moment(birthday).format('YYYY-MM-DD');
      }
    });
    let user = await User.findOneAndUpdate({ _id }, objUser);
    if (!user) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu!!!';
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      appData['success'] = successCode.success1;
      appData['data'] = 'Cập nhật thành công';
      appData['status'] = HTTPStatus.OK;
      res.status(HTTPStatus.OK).json(appData);
    }
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = 'Có lỗi xảy ra trong khi cập nhật ' + err;
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
};

/** xóa theo id */
exports.delete = async (req, res) => {
  let appData = {};
  let _id = req.params.id;

  try {
    let user = await User.findOneAndRemove({ _id });
    if (!user) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu ' + _id;
      appData['status'] = HTTPStatus.NOT_FOUND;
      return res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      appData['success'] = successCode.success1;
      appData['data'] = 'Xóa dữ liệu thành công';
      appData['status'] = HTTPStatus.OK;
      return res.status(HTTPStatus.OK).json(appData);
    }
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = 'Có lỗi xảy ra khi xóa dữ liệu ' + err;
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
};



/** thay đổi mật khẩu theo user id */
exports.changePassword = async (req, res, next) => {
  let appData = {};
  try {
    let _id = req.params.id;
    let usr = await User.findById({ _id });
    if (!usr) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu ';
      appData['status'] = HTTPStatus.NOT_FOUND;
      return res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      var oldpassword = req.body.oldpassword;
      var newpassword = req.body.newpassword;
      if (oldpassword && newpassword) {
        if (usr.comparePassword(req.body.oldpassword)) {
          usr.password = req.body.newpassword;
          usr.save(function (err, user) {
            if (err) {
              appData['success'] = successCode.success0;
              appData['data'] = 'Có lỗi xảy ra khi thay đổi mật khẩu ' + err;
              appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
              return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
            }
            appData['success'] = successCode.success1;
            appData['data'] = 'Đổi mật khẩu thành công ';
            appData['status'] = HTTPStatus.OK;
            return res.status(HTTPStatus.OK).json(appData);
          });
        } else {
          appData['success'] = successCode.success0;
          appData['data'] = 'Mật khẩu cũ không đúng ';
          appData['status'] = HTTPStatus.OK;
          return res.status(HTTPStatus.OK).json(appData);
        }
      } else {
        appData['success'] = successCode.success0;
        appData['data'] = 'Mật khẩu cũ không đúng ';
        appData['status'] = HTTPStatus.OK;
        return res.status(HTTPStatus.OK).json(appData);
      }
    }
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = 'Có lỗi xảy ra khi đổi mật khẩu ' + err;
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
};

/**begin get combobox role client */
export async function getComboClient(req, res) {
  let appData = {};
  try {
    let user = await User.find({
      "role": {
        "$in": ["Client"]
      }
    }, {
        "_id": 1,
        "fullname": 1
      }).sort({ fullname: -1 });
    if (!user) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu';
      appData['status'] = HTTPStatus.NOT_FOUND;
      return res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      return res.status(HTTPStatus.OK).json(user);
    }
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = 'Có lỗi trong khi nhận dữ liệu ' + err;
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
};
/**end get combobox role client */


/**begin get combobox role client và driver */
export async function getComboClientbyRoleCode(req, res) {
  let appData = {};
  try {
    let user = await User.find({
      "role": {
        "$in": ["Client"]
      }
      , "role_code": req.query.role_code ? req.query.role_code : "2"
    }, {
        "_id": 1,
        "fullname": 1
      }).sort({ fullname: -1 });
    if (!user) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu';
      appData['status'] = HTTPStatus.NOT_FOUND;
      return res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      return res.status(HTTPStatus.OK).json(user);
    }
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = 'Có lỗi trong khi nhận dữ liệu ' + err;
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
};
/**end get combobox role client và driver */

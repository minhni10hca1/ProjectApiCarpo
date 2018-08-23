import HTTPStatus from 'http-status';

import Role from './role.model';
import successCode from '../../utils/successCode';

const logger = require('../../utils/logger');
const logger4 = require('../../utils/loggerdb');

/*begin tạo mới*/
exports.create = async (req, res) => {
  logger.info('Gọi api findAll Role');
  let appData = {};
  let role = new Role(req.body);
  try {
    let data = await role.save();
    logger.info('Role tạo mới thành công!!!')
    appData['success'] = successCode.success1;
    appData['data'] = 'Tạo mới thành công';
    appData['status'] = HTTPStatus.CREATED;
    res.status(HTTPStatus.CREATED).json(appData);
  } catch (err) {
    logger.info('Có lỗi xảy ra trong quá trình tạo mới role ' + err);
    appData['success'] = successCode.success0;
    appData['data'] = 'Có lỗi xảy ra trong quá trình tạo mới dữ liệu ' + err;
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
};
/** end tạo mới */

/**begin tìm tất cả */
export async function findAll(req, res) {
  // logger4.role.info("Testing role");
  // logger4.info({ id: 1, name: 'wayne' });
  // logger4.debug('Got cheese.');
  // logger4.info('Cheese is Gouda.');
  // logger4.warn('Cheese is quite smelly.');
  // logger4.error('Cheese is too ripe!');
  let appData = {};
  try {
    let role = await Role.find();
    if (!role) {
      loggerdb.info('Không tìm thấy role!!!');
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu';
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      loggerdb.info('Tìm thấy tất cả dữ liệu role');
      appData['success'] = successCode.success1;
      appData['data'] = role;
      appData['status'] = HTTPStatus.OK;
      res.status(HTTPStatus.OK).json(appData);
    }
  } catch (err) {
    loggerdb.info('Có lỗi trong khi nhận dữ liệu role ' + err);
    appData['success'] = successCode.success0;
    appData['data'] = 'Có lỗi trong khi nhận dữ liệu ' + err;
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
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
    if (filter != undefined && filter != null) {
      await Role.find({ 'Name': { '$regex': filter.trim(), '$options': 'i' } }).skip((page - 1) * pageSize).limit(pageSize).sort({ createdAt: -1 })
        .exec(function (err, roles) {
          Role.count().exec(function (err, count) {
            if (err) return next(err);
            appData['success'] = successCode.success1;
            appData['data'] = roles;
            appData['PageIndex'] = parseInt(page);
            appData['PageSize'] = pageSize;
            appData['TotalRows'] = count;
            appData['status'] = HTTPStatus.OK;
            return res.status(HTTPStatus.OK).json(appData);
          })
        });
    } else {
      //truong hop khong truyen filter
      await Role.find({}).skip((page - 1) * pageSize).limit(pageSize).sort({ createdAt: -1 })
        .exec(function (err, roles) {
          Role.count().exec(function (err, count) {
            if (err) return next(err);
            appData['success'] = successCode.success1;
            appData['data'] = roles;
            appData['PageIndex'] = parseInt(page);
            appData['PageSize'] = pageSize;
            appData['TotalRows'] = count;
            appData['status'] = HTTPStatus.OK;
            return res.status(HTTPStatus.OK).json(appData);
          })
        });
    }
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = 'Có lỗi trong khi nhận dữ liệu ' + err;
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
};
/**end tìm tất cả paging*/

/** Tìm theo id*/
exports.findOne = async (req, res) => {
  logger.info('Gọi api findOne Role');
  let appData = {};
  let id = req.params.id;

  try {
    let role = await Role.findById(id);
    if (!role) {
      logger.info('Không tìm thấy role!!!');
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu';
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      logger.info('Tìm thấy 1 role');
      appData['success'] = successCode.success1;
      appData['data'] = role;
      appData['status'] = HTTPStatus.OK;
      res.status(HTTPStatus.OK).json(appData);
    }
  } catch (err) {
    logger.info('Có lỗi trong khi nhận dữ liệu role ' + err);
    appData['success'] = successCode.success0;
    appData['data'] = 'Có lỗi trong khi nhận dữ liệu ' + err;
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
};
/** End Tìm theo id*/

/** Cập nhật theo id */
exports.update = async (req, res) => {
  logger.info('Gọi api update role');
  let appData = {};
  let _id = req.params.id;

  try {
    var param_bodys = {
      Description: req.body.Description
    }
    let role = await Role.findByIdAndUpdate({ _id }, param_bodys);
    if (!role) {
      logger.info('Không tìm thấy role để cập nhật!!!');
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu!!!';
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      logger.info('Cập nhật role thành công!!!');
      appData['success'] = successCode.success1;
      appData['data'] = 'Cập nhật thành công';
      appData['status'] = HTTPStatus.OK;
      res.status(HTTPStatus.OK).json(appData);
    }
  } catch (err) {
    logger.info('Có lỗi xảy ra trong khi cập nhật role ' + err);
    appData['success'] = successCode.success0;
    appData['data'] = 'Có lỗi xảy ra trong khi cập nhật ' + err;
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
};

/** xóa theo id */
exports.delete = async (req, res) => {
  logger.info('Gọi api xóa role');
  let appData = {};
  let _id = req.params.id;

  try {
    let role = await Role.findByIdAndRemove({ _id });
    if (!role) {
      logger.info('Không tìm thấy dữ liệu để xóa role ' + _id);
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu ' + _id;
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      logger.info('Xóa dữ liệu thành công');
      appData['success'] = successCode.success1;
      appData['data'] = 'Xóa dữ liệu thành công';
      appData['status'] = HTTPStatus.OK;
      res.status(HTTPStatus.OK).json(appData);
    }
  } catch (err) {
    logger.info('Có lỗi xảy ra khi xóa dữ liệu role ' + err);
    appData['success'] = successCode.success0;
    appData['data'] = 'Có lỗi xảy ra khi xóa dữ liệu ' + err;
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
};


/*begin tạo mới quyền cho nhóm*/
// exports.createPermission = async (req, res, next) => {
//   let appData = {};
//   let _id = req.params.id;
//   var chucnang = new Function();
//   try {
//     let role = await Role.findById({ _id });
//     if (!role) {
//       logger.info('Không tìm thấy dữ liệu role ' + _id);
//       appData['success'] = successCode.success0;
//       appData['data'] = 'Không tìm thấy dữ liệu ' + _id;
//       appData['status'] = HTTPStatus.NOT_FOUND;
//       res.status(HTTPStatus.NOT_FOUND).json(appData);
//     } else {
//       chucnang.Function = 1;
//       chucnang.CanRead = 1;
//       chucnang.CanCreate = 1;
//       chucnang.CanUpdate = 1;
//       chucnang.CanDelete = 0;
//       role.Permissions.push(chucnang);
//       // req.Discussion.save(function (err, Discussion) {
//       //   if (err) { return next(err); };
//       //   res.json(Discussion);
//       // });
//       let data = await role.save();
//       appData['success'] = successCode.success1;
//       appData['data'] = data;
//       appData['status'] = HTTPStatus.CREATED;
//       res.status(HTTPStatus.CREATED).json(appData);
//     }
//   } catch (err) {
//     logger.info('Có lỗi xảy ra khi xóa dữ liệu role ' + err);
//     appData['success'] = successCode.success0;
//     appData['data'] = 'Có lỗi xảy ra khi xóa dữ liệu ' + err;
//     appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
//     res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
//   }
// };
/** end tạo mới */

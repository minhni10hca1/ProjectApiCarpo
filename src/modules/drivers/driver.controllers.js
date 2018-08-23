import HTTPStatus from 'http-status';

import Driver from './driver.model';
import successCode from '../../utils/successCode';

const logger = require('../../utils/logger');

var moment = require('moment-timezone');
/*begin tạo mới*/
exports.create = async (req, res) => {
  let appData = {};
  var objDriver = {};
  Object.keys(req.body).forEach(key => {
    objDriver[key] = req.body[key];
    if (key == 'birth_day') {
      var birth_day = moment(req.body[key], ["DD/MM/YYYY", "YYYY-MM-DD"]);
      objDriver[key] = moment(birth_day).format('YYYY-MM-DD');
    }
  });

  let driver = new Driver(objDriver);
  try {
    let data = await driver.save();
    appData['success'] = successCode.success1;
    appData['data'] = 'Tạo mới thành công';
    appData['status'] = HTTPStatus.CREATED;
    res.status(HTTPStatus.CREATED).json(appData);
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    if (err.name === 'MongoError' && err.code === 11000) {
      appData['data'] = err.message;
    } else {
      appData['data'] = 'Có lỗi xảy ra trong khi tạo mới ' + err;
    }
    res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
};
/** end tạo mới */

/**begin tìm tất cả */
export async function findAll(req, res) {
  let appData = {};
  try {
    let driver = await Driver.find();
    if (!driver) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu';
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      appData['success'] = successCode.success1;
      appData['data'] = driver;
      appData['status'] = HTTPStatus.OK;
      res.status(HTTPStatus.OK).json(appData);
    }
  } catch (err) {
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
  var filterDriverName = req.query.fullname;
  var filterDriverPhone = req.query.phone;
  let appData = {};
  var criteria = {};
  if (filterDriverName != undefined && filterDriverName != null && filterDriverName.trim() != '') {
    criteria.$text = { "$search": filterDriverName.trim() }
  }
  if (filterDriverPhone != undefined && filterDriverPhone != null && filterDriverPhone.trim() != '') {
    criteria.phone = { '$regex': filterDriverPhone.trim(), '$options': 'i' }
  }
  try {
    //fulltext search
    await Driver.find(criteria)
      .skip((page - 1) * pageSize).limit(pageSize).sort({ full_name: 1 })
      .exec(function (err, drivers) {
        Driver.count(criteria).exec(function (err, count) {
          if (err) return next(err);
          appData['success'] = successCode.success1;
          appData['data'] = drivers;
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
/**end tìm tất cả paging*/

/** Tìm theo id*/
exports.findOne = async (req, res) => {
  let appData = {};
  let id = req.params.id;

  try {
    let driver = await Driver.findById(id);
    if (!driver) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu';
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      appData['success'] = successCode.success1;
      appData['data'] = driver;
      appData['status'] = HTTPStatus.OK;
      res.status(HTTPStatus.OK).json(appData);
    }
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = 'Có lỗi trong khi nhận dữ liệu ' + err;
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
};
/** End Tìm theo id*/

/** Cập nhật theo id */
exports.update = async (req, res) => {
  let appData = {};
  let _id = req.params.id;

  try {
    var objDriver = {};
    Object.keys(req.body).forEach(key => {
      objDriver[key] = req.body[key];
      if (key == 'birth_day') {
        var birth_day = moment(req.body[key], ["DD/MM/YYYY", "YYYY-MM-DD"]);
        objDriver[key] = moment(birth_day).format('YYYY-MM-DD');
      }
    });
    let driver = await Driver.findByIdAndUpdate({ _id: _id }, objDriver);
    if (!driver) {
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
    if (err.name === 'MongoError' && err.code === 11000) {
      appData['status'] = 11000;
      appData['data'] = err.message;
    } else {
      appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
      appData['data'] = 'Có lỗi xảy ra trong khi cập nhật ' + err;
    }
    res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
};

/** xóa theo id */
exports.delete = async (req, res) => {
  let appData = {};
  let _id = req.params.id;

  try {
    let driver = await Driver.findByIdAndRemove({ _id });
    if (!driver) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu ' + _id;
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      appData['success'] = successCode.success1;
      appData['data'] = 'Xóa dữ liệu thành công';
      appData['status'] = HTTPStatus.OK;
      res.status(HTTPStatus.OK).json(appData);
    }
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = 'Có lỗi xảy ra khi xóa dữ liệu ' + err;
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
};

/**begin get combobox */
export async function getCombo(req, res) {
  let appData = {};
  try {
    let driver = await Driver.find({}, {
      "_id": 1,
      "full_name": 1
    }).sort({ full_name: 1 });
    if (!driver) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu';
      appData['status'] = HTTPStatus.NOT_FOUND;
      return res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      return res.status(HTTPStatus.OK).json(driver);
    }
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = 'Có lỗi trong khi nhận dữ liệu ' + err;
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
};
/**end get combobox */

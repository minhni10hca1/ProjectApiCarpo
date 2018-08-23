import HTTPStatus from 'http-status';

import CarGroup from './cargroup.model';
import successCode from '../../utils/successCode';

const logger = require('../../utils/logger');

var moment = require('moment');
/*begin tạo mới*/
exports.create = async (req, res) => {
  let appData = {};
  var objCarGroup = {};
  Object.keys(req.body).forEach(key => {
    objCarGroup[key] = req.body[key];
  });

  let cargroup = new CarGroup(objCarGroup);
  try {
    let data = await cargroup.save();
    appData['success'] = successCode.success1;
    appData['data'] = 'Tạo mới thành công';
    appData['status'] = HTTPStatus.CREATED;
    res.status(HTTPStatus.CREATED).json(appData);
  } catch (err) {
    appData['success'] = successCode.success0;
    if (err.name === 'MongoError' && err.code === 11000) {
      appData['data'] = err.message;
      appData['status'] = 11000;
    } else {
      appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
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
    let cargroup = await CarGroup.find();
    if (!cargroup) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu';
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      appData['success'] = successCode.success1;
      appData['data'] = cargroup;
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
  var filterFullName = req.query.fullname;
  let appData = {};
  var criteria = {};

  try {
    //fulltext search
    if (filterFullName != undefined && filterFullName != null && filterFullName.trim() != '') {
      criteria.$text = { "$search": filterFullName.trim() }
    }
    await CarGroup.find(criteria)
      .skip((page - 1) * pageSize).limit(pageSize).sort({ full_name: 1 })
      .exec(function (err, cargroups) {
        CarGroup.count(criteria).exec(function (err, count) {
          if (err) return next(err);
          appData['success'] = successCode.success1;
          appData['data'] = cargroups;
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
    let cargroup = await CarGroup.findById(id);
    if (!cargroup) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu';
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      appData['success'] = successCode.success1;
      appData['data'] = cargroup;
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
    var objCarGroup = {};
    Object.keys(req.body).forEach(key => {
      objCarGroup[key] = req.body[key];
    });
    let cargroup = await CarGroup.findByIdAndUpdate({ _id: _id }, objCarGroup);
    if (!cargroup) {
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
    let cargroup = await CarGroup.findByIdAndRemove({ _id });
    if (!cargroup) {
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
    let cargroup = await CarGroup.find({}, {
      _id: 1,
      full_name: 1,
      phone: 1
    }).limit(10000).sort({ full_name: 1 });
    if (!cargroup) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu';
      appData['status'] = HTTPStatus.NOT_FOUND;
      return res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      return res.status(HTTPStatus.OK).json(cargroup);
    }
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = 'Có lỗi trong khi nhận dữ liệu ' + err;
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
};
/**end get combobox */


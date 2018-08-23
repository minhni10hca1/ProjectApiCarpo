import HTTPStatus from 'http-status';

import Area from './area.model';
import successCode from '../../utils/successCode';

/*begin tạo mới*/
exports.create = async (req, res) => {
  let appData = {};
  var objArea = {};
  Object.keys(req.body).forEach(key => {
    objArea[key] = req.body[key];
  });

  let area = new Area(objArea);
  try {
    let data = await area.save();
    appData['success'] = successCode.success1;
    appData['data'] = 'Tạo mới thành công';
    appData['status'] = HTTPStatus.CREATED;
    res.status(HTTPStatus.CREATED).json(appData);
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
/** end tạo mới */

/**begin tìm tất cả */
export async function findAll(req, res) {
  let appData = {};
  try {
    let area = await Area.find();
    if (!area) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu';
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      appData['success'] = successCode.success1;
      appData['data'] = area;
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

export async function findAllPaging(req, res) {
  let appData = {};
  try {
    const pageSize = parseInt(req.query.pageSize, 0) || 10; //neu ko send param thi la 10
    var page = parseInt(req.query.page <= 0 ? 1 : req.query.page, 0) || 1;
    var filter = null;
    filter = req.query.filter;
    var query = {};
    if (filter != undefined && filter != null && filter.trim() != '') {
      query.code = { '$regex': filter.trim(), '$options': 'i' };
    }
    var options = {
      select: 'code name',
      sort: { name: -1 },
      lean: true,
      page: page,
      limit: pageSize
    };
    await Area.paginate(query, options).then(function (result) {
      appData['success'] = successCode.success1;
      appData['data'] = result.docs;
      appData['PageIndex'] = parseInt(result.page);
      appData['PageSize'] = pageSize;
      appData['TotalRows'] = parseInt(result.pages);
      appData['status'] = HTTPStatus.OK;
      return res.status(HTTPStatus.OK).json(appData);
    });
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = 'Có lỗi trong khi nhận dữ liệu ' + err;
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
};


/** Tìm theo id*/
exports.findOne = async (req, res) => {
  let appData = {};
  let id = req.params.id;

  try {
    let area = await Area.findById(id);
    if (!area) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu';
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      appData['success'] = successCode.success1;
      appData['data'] = area;
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
    var objArea = {};
    Object.keys(req.body).forEach(key => {      
      objArea[key] = req.body[key];
    });
    let area = await Area.findByIdAndUpdate({ _id }, objArea);
    if (!area) {
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
    let area = await Area.findByIdAndRemove({ _id });
    if (!area) {
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
    let area = await Area.find({}, {
      "code": 1,
      "name": 1
    }).sort({ code: 1 });
    if (!area) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu';
      appData['status'] = HTTPStatus.NOT_FOUND;
      return res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      return res.status(HTTPStatus.OK).json(area);
    }
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = 'Có lỗi trong khi nhận dữ liệu ' + err;
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
};
/**end get combobox */

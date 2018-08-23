import HTTPStatus from 'http-status';

import Customer from './customer.model';
import successCode from '../../utils/successCode';

const logger = require('../../utils/logger');


/*begin tạo mới*/
exports.create = async (req, res) => {
  let appData = {};
  var objCustomer = {};
  Object.keys(req.body).forEach(key => {
    objCustomer[key] = req.body[key];
  });

  let customer = new Customer(objCustomer);
  try {
    let data = await customer.save();
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
    let customer = await Customer.find();
    if (!customer) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu';
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      appData['success'] = successCode.success1;
      appData['data'] = customer;
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
  var filter = null;
  filter = req.query.filter;
  let appData = {};
  try {
    var criteria = {};
    if (filter != undefined && filter != null && filter.trim() != '') {
      criteria.$text = { "$search": filter.trim() }
    }
    // await Customer.find({ 'company_name': { '$regex': filter.trim(), '$options': 'i' } }) //search like
    //fulltext search
    await Customer.find(criteria)
      .skip((page - 1) * pageSize).limit(pageSize).sort({ company_name: 1 })
      .exec(function (err, customers) {
        Customer.count(criteria).exec(function (err, count) {
          if (err) return next(err);
          appData['success'] = successCode.success1;
          appData['data'] = customers;
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

/**begin tìm tất cả paging theo user id (client cũng get dc nên ko cần phân quyền) */
export async function findAllbyUserIdPaging(req, res) {
  const pageSize = parseInt(req.query.pageSize, 0) || 10; //neu ko send param thi la 10
  var page = parseInt(req.query.page, 0) || 1;
  var filter = null;
  filter = req.query.filter;
  let appData = {};
  try {
    if (filter != undefined && filter != null) {
      var query = {
        "customer_id": req.user._id,
        'company_name': { '$regex': filter.trim(), '$options': 'i' }
      };
      await Customer.find(query).skip((page - 1) * pageSize).limit(pageSize).sort({ createdAt: -1 })
        .exec(function (err, customers) {
          Customer.count({ "customer_id": req.user._id }).exec(function (err, count) {
            if (err) return next(err);
            appData['success'] = successCode.success1;
            appData['data'] = customers;
            appData['PageIndex'] = parseInt(page);
            appData['PageSize'] = pageSize;
            appData['TotalRows'] = count;
            appData['status'] = HTTPStatus.OK;
            return res.status(HTTPStatus.OK).json(appData);
          })
        });
    } else {
      //truong hop khong truyen filter
      await Customer.find({}).skip((page - 1) * pageSize).limit(pageSize).sort({ createdAt: -1 })
        .exec(function (err, customers) {
          Customer.count({ "customer_id": req.user._id }).exec(function (err, count) {
            if (err) return next(err);
            appData['success'] = successCode.success1;
            appData['data'] = customers;
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
  let appData = {};
  let id = req.params.id;

  try {
    let customer = await Customer.findById(id);
    if (!customer) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu';
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      appData['success'] = successCode.success1;
      appData['data'] = customer;
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
    var objCustomer = {};
    Object.keys(req.body).forEach(key => {
      objCustomer[key] = req.body[key];
    });
    let customer = await Customer.findByIdAndUpdate({ _id: _id }, objCustomer);
    if (!customer) {
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
    let customer = await Customer.findByIdAndRemove({ _id });
    if (!customer) {
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


//thống kê sl kh theo user
exports.totalcustomer = async (req, res) => {
  let appData = {};
  try {
    let customer = await Customer.aggregate({
      $group:
        { _id: '$customer_id', total_customers: { $sum: 1 } }
    });
    if (!customer) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu ' + _id;
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      appData['success'] = successCode.success1;
      appData['data'] = customer;
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
    let customer = await Customer.find({}, {
      "_id": 1,
      "company_name": 1,
      "customer_id": 1 //user_id
    }).sort({ company_name: 1 });
    if (!customer) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu';
      appData['status'] = HTTPStatus.NOT_FOUND;
      return res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      return res.status(HTTPStatus.OK).json(customer);
    }
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = 'Có lỗi trong khi nhận dữ liệu ' + err;
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
};
/**end get combobox */


/**begin paging cách 2*/
export async function getPaging2(req, res) {
  let appData = {};
  try {
    const pageSize = parseInt(req.query.pageSize, 0) || 10; //neu ko send param thi la 10
    var page = parseInt(req.query.page <= 0 ? 1 : req.query.page, 0) || 1;
    var filter = null;
    filter = req.query.filter;
    var query = {};
    if (filter != undefined && filter != null && filter.trim() != '') {
      query.$text = { "$search": filter.trim() };
    }
    var options = {
      select: 'company_name address createdAt',
      sort: { company_name: -1 },
      populate: [{ path: 'customer_id', select: "fullname phone" }],
      lean: true,
      page: page,
      limit: pageSize
    };
    Customer.paginate(query, options).then(function (result) {
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

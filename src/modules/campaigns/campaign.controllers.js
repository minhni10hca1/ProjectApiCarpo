import HTTPStatus from 'http-status';
import mongoose, { Schema } from 'mongoose';
import Campaign from './campaign.model';
import Customer from '../customers/customer.model';
import Car from '../cars/car.model';
import successCode from '../../utils/successCode';
import { log } from 'util';

const logger = require('../../utils/logger');
// var moment = require('moment');
var moment = require('moment-timezone');

/*begin tạo mới*/
exports.create = async (req, res) => {
  let appData = {};
  var objCampaign = {};
  Object.keys(req.body).forEach(key => {
    objCampaign[key] = req.body[key];
    if (key == 'start_time') {
      var start_time = moment(req.body[key], ["DD/MM/YYYY", "YYYY-MM-DD"]);
      objCampaign[key] = moment(start_time).format('YYYY-MM-DD');
    }
    if (key == 'end_time') {
      var end_time = moment(req.body[key], ["DD/MM/YYYY", "YYYY-MM-DD"]);
      objCampaign[key] = moment(end_time).format('YYYY-MM-DD');
    }
  });

  let campaign = new Campaign(objCampaign);
  try {
    let data = await campaign.save();
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
    let campaign = await Campaign.find();
    if (!campaign) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu';
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      appData['success'] = successCode.success1;
      appData['data'] = campaign;
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
      criteria.name = { '$regex': filter.trim(), '$options': 'i' };
    }

    await Campaign.find(criteria).skip((page - 1) * pageSize).limit(pageSize).sort({ name: 1 })
      .exec(function (err, campaigns) {
        Campaign.count(criteria).exec(function (err, count) {
          if (err) return next(err);
          appData['success'] = successCode.success1;
          appData['data'] = campaigns;
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

/**begin tìm tất cả hợp đồng theo khách hàng và user client */
export async function findAllPagingByCustomer(req, res, next) {
  const pageSize = parseInt(req.query.pageSize, 0) || 10; //neu ko send param thi la 10
  var page = parseInt(req.query.page, 0) || 1;
  var filter = null;
  filter = req.query.filter;
  var customer_id = req.user.customer_id;
  let appData = {};
  try {
    var criteria = {};
    if (filter != undefined && filter != null && filter.trim() != '') {
      criteria.$text = { "$search": filter.trim() };
    }
    if (customer_id != undefined && customer_id != null && customer_id != '') {
      criteria.customer_id = mongoose.Types.ObjectId(customer_id);
    }
    await Campaign.aggregate(
      [
        {
          "$match": criteria
        },
        { "$skip": (page - 1) * pageSize },
        { "$sort": { "name": -1 } },
        { "$limit": pageSize },
        {
          "$lookup": {
            "localField": "customer_id",
            "from": "customer",
            "foreignField": "_id",
            "as": "customerinfo"
          }
        },
        { "$unwind": "$customerinfo" },
        {
          "$project": {
            "name": 1,
            "descriptions": 1,
            "customer_id": 1,
            "createdAt": 1,
            "total_distance": 1,
            "total_car": 1,
            "total_car_advertising": 1,
            "car_wage": 1,
            "start_time": 1,
            "end_time": 1,
            // "start_time": { $dateToString: { format: "%Y-%m-%d", date: "$start_time" } },
            // "end_time": { $dateToString: { format: "%Y-%m-%d", date: "$end_time" } },
            "customerinfo.company_name": 1,
            "customerinfo.address": 1
          }
        }
      ],
      function (err, campaigns) {
        // Result is an array of documents
        if (err) return next(err);
        Campaign.count(criteria).exec(function (err, count) {
          if (err) return next(err);
          appData['success'] = successCode.success1;
          appData['data'] = campaigns;
          appData['PageIndex'] = parseInt(page);
          appData['PageSize'] = pageSize;
          appData['TotalRows'] = count;
          appData['status'] = HTTPStatus.OK;
          return res.status(HTTPStatus.OK).json(appData);
        })
      }
    );
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = 'Có lỗi trong khi nhận dữ liệu ' + err;
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
};
/**end tìm tất cả paging*/

/**begin tìm tất cả hợp đồng khách hàng admin */
export async function findAllPagingByCustomerAdmin(req, res, next) {
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
    await Campaign.aggregate(
      [
        {
          "$match": criteria
        },
        { "$skip": (page - 1) * pageSize },
        { "$sort": { "name": -1 } },
        { "$limit": pageSize },
        {
          "$lookup": {
            "localField": "customer_id",
            "from": "customer",
            "foreignField": "_id",
            "as": "customerinfo"
          }
        },
        { "$unwind": "$customerinfo" },
        {
          "$project": {
            "name": 1,
            "descriptions": 1,
            "customer_id": 1,
            "createdAt": 1,
            "total_distance": 1,
            "total_car": 1,
            "total_car_advertising": 1,
            "car_wage": 1,
            "start_time": 1,
            "end_time": 1,
            // "start_time": { $dateToString: { format: "%Y-%m-%d", date: "$start_time" } },
            // "end_time": { $dateToString: { format: "%Y-%m-%d", date: "$end_time" } },
            "customerinfo.company_name": 1,
            "customerinfo.address": 1
          }
        }
      ],
      function (err, campaigns) {
        // Result is an array of documents
        if (err) return next(err);
        Campaign.count(criteria).exec(function (err, count) {
          if (err) return next(err);
          appData['success'] = successCode.success1;
          appData['data'] = campaigns;
          appData['PageIndex'] = parseInt(page);
          appData['PageSize'] = pageSize;
          appData['TotalRows'] = count;
          appData['status'] = HTTPStatus.OK;
          return res.status(HTTPStatus.OK).json(appData);
        })
      }
    );
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
    let campaign = await Campaign.findById(id);
    if (!campaign) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu';
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      appData['success'] = successCode.success1;
      appData['data'] = campaign;
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
    var objCampaign = {};
    Object.keys(req.body).forEach(key => {
      objCampaign[key] = req.body[key];
      if (key == 'start_time') {
        var start_time = moment(req.body[key], ["DD/MM/YYYY", "YYYY-MM-DD"]);
        objCampaign[key] = moment(start_time).format('YYYY-MM-DD');
      }
      if (key == 'end_time') {
        var end_time = moment(req.body[key], ["DD/MM/YYYY", "YYYY-MM-DD"]);
        objCampaign[key] = moment(end_time).format('YYYY-MM-DD');
      }
    });
    // console.log('objCampaign', objCampaign);
    let campaign = await Campaign.findByIdAndUpdate({ _id: _id }, objCampaign);
    if (!campaign) {
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
    let campaign = await Campaign.findByIdAndRemove({ _id });
    if (!campaign) {
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
    // update combobox lay nhung HD chua het hang
    var strNowDate = moment(new Date()).format('YYYY-MM-DD');
    //console.log('strNowDate', strNowDate);
    let campaign = await Campaign.find({ $and: [ { start_time: { $lte: strNowDate } }, { end_time: { $gte: strNowDate } } ] }, {
      _id: 1,
      name: 1
    }).limit(10000).sort({ name: 1 });
    if (!campaign) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu';
      appData['status'] = HTTPStatus.NOT_FOUND;
      return res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      return res.status(HTTPStatus.OK).json(campaign);
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
export async function findAllPagingByCustomer2(req, res) {
  let appData = {};
  try {
    const pageSize = parseInt(req.query.pageSize, 0) || 10; //neu ko send param thi la 10
    var page = parseInt(req.query.page <= 0 ? 1 : req.query.page, 0) || 1;
    var filter = null;
    filter = req.query.filter;
    var customer_id = req.user.customer_id;
    var query = {};
    if (filter != undefined && filter != null && filter.trim() != '') {
      query.$text = { "$search": filter.trim() };
    }
    if (customer_id != undefined && customer_id != null && customer_id != '') {
      query.customer_id = mongoose.Types.ObjectId(customer_id);
    }
    var options = {
      select: 'name descriptions createdAt total_distance total_car total_car_advertising car_wage start_time end_time',
      sort: { name: -1 },
      populate: [{ path: 'customer_id', select: "_id company_name address" }],
      lean: true,
      page: page,
      limit: pageSize
    };
    await Campaign.paginate(query, options).then(function (result) {
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
export async function findAllPagingByCustomerAdmin2(req, res) {
  let appData = {};
  try {
    const pageSize = parseInt(req.query.pageSize, 0) || 10; //neu ko send param thi la 10
    var page = parseInt(req.query.page <= 0 ? 1 : req.query.page, 0) || 1;
    var filter = null;
    filter = req.query.filter;
    var filterDeviceId = null;
    filterDeviceId = req.query.filterDeviceId;
    var customer_id = req.user.customer_id;
    var query = {};
    var criteria = {};
    if (filter != undefined && filter != null && filter.trim() != '') {
      query.$text = { "$search": filter.trim() };
    }
    if (customer_id != undefined && customer_id != null && customer_id != '') {
      query.customer_id = mongoose.Types.ObjectId(customer_id);
    }
    var options = {
      select: 'name descriptions createdAt total_distance total_car total_car_advertising car_wage start_time end_time',
      sort: { name: -1 },
      populate: [{ path: 'customer_id', select: "_id company_name address" }],
      lean: true,
      page: page,
      limit: pageSize
    };
    await Campaign.paginate(query, options).then(function (result) {
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

/** Tìm theo id lấy ds xe của hợp đồng*/
exports.findOneByID = async (req, res) => {
  let appData = {};
  let id = req.params.id;
  var filter = null;
  filter = req.query.filter;
  try {
    var criteria = {};
    if (filter != undefined && filter != null && filter.trim() != '') {
      criteria.device_id = { '$regex': filter.trim(), '$options': 'i' };
    }
    const pageSize = parseInt(req.query.pageSize, 0) || 10; //neu ko send param thi la 10
    var page = parseInt(req.query.page <= 0 ? 1 : req.query.page, 0) || 1;
    await Campaign.findById(id)
      .lean()
      .populate([
        {
          path: 'cars',
          select: "_id device_id license_plate car_manufacturer car_color active",
          options: {
            sort: {},
            skip: (page - 1) * pageSize,
            limit: pageSize
          },
          match: criteria
        }
      ])
      .exec(function (err, campaign) {
        if (err) return next(err);
        if (campaign.cars.length > 0) {
          appData['success'] = successCode.success1;
          appData['data'] = campaign.cars;
          appData['PageIndex'] = parseInt(page);
          appData['PageSize'] = pageSize;
          appData['TotalRows'] = campaign.total_car_advertising || 1;
          appData['title'] = campaign.name;
          appData['status'] = HTTPStatus.OK;
          res.status(HTTPStatus.OK).json(appData);
        } else {
          appData['success'] = successCode.success0;
          appData['data'] = [];
          appData['title'] = campaign.name;
          appData['status'] = HTTPStatus.OK;
          res.status(HTTPStatus.OK).json(appData);
        }
      })
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = 'Có lỗi trong khi nhận dữ liệu ' + err;
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
};
/** End Tìm theo id*/
/** xóa 1 carid trong hợp đồng */
exports.updateDeleteCar = async (req, res) => {
  let appData = {};
  try {
    var campaign_id = req.params.campaignid,//assume get 54fcb3890cba9c4234f5c925
      car_id = req.params.carid;// assume get 54fcb3890cba9c4234f5c925
    let campaign = await Campaign.findByIdAndUpdate(campaign_id, {
      '$pull': {
        cars: car_id
      }
    });
    if (!campaign) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu!!!';
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      await Car.findByIdAndUpdate(car_id, {
        '$set': {
          active: false
        }
      });
      appData['success'] = successCode.success1;
      appData['data'] = 'Xóa thành công';
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
/** Cập nhật xe theo id */
exports.updateCars = async (req, res) => {
  let appData = {};
  let _id = req.params.id;

  try {
    var idsCarTrues = [];
    var idsCarFalses = [];
    req.body.carsTrue.forEach((item) => {
      idsCarTrues.push(item.value);
    })
    req.body.carsFalse.forEach((item) => {
      idsCarFalses.push(item.value);
    })
    let campaign = await Campaign.findByIdAndUpdate(
      { _id: _id },
      { $set: { cars: idsCarTrues } },
      { safe: true, upsert: true });
    if (!campaign) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu!!!';
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      await Car.update({ _id: { "$in": idsCarTrues } }, { active: true }, { multi: true }, function (err, docs) {
      });
      await Car.update({ _id: { "$in": idsCarFalses } }, { active: false }, { multi: true }, function (err, docs) {
      });
      appData['cartrue'] = 'Cập nhật ' + idsCarTrues.length;
      appData['carfalse'] = 'Cập nhật ' + idsCarFalses.length;
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


export async function findByDeviceId(req, res, next) {
  let appData = {};
  try {
    var filter = null;
    filter = req.query.filter;
    let appData = {};
    try {
      if (filter != undefined && filter != null && filter.trim() != '') {
        await Campaign.aggregate(
          [
            { "$limit": 10 },
            {
              "$unwind": "$cars"
            },
            {
              "$lookup":
                {
                  "from": "car",
                  "localField": "cars",
                  "foreignField": "_id",
                  "as": "carsData"
                }
            },
            {
              "$match": { 'carsData.device_id': { '$regex': filter.trim(), '$options': 'i' } }
            },
            {
              "$project": {
                "_id": 1,
                "name": 1,
                "descriptions": 1,
                "total_distance": 1,
                "total_car": 1,
                "total_car_advertising": 1,
                "car_wage": 1,
                "start_time": 1,
                "end_time": 1
              }
            }
          ],
          function (err, campaign) {
            // Result is an array of documents
            if (err) return next(err);
            appData['success'] = successCode.success1;
            appData['data'] = campaign;
            appData['status'] = HTTPStatus.OK;
            return res.status(HTTPStatus.OK).json(appData);
          }
        );
      } else {
        appData['success'] = successCode.success0;
        appData['data'] = [];
        appData['status'] = HTTPStatus.OK;
        return res.status(HTTPStatus.OK).json(appData);
      }
    } catch (err) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Có lỗi trong khi nhận dữ liệu ' + err;
      appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
      return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
    }
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = 'Có lỗi trong khi nhận dữ liệu ' + err;
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
};


/**lấy thông tin hợp đồng theo từng khách hàng*/
export async function findAllByCustomerID(req, res) {
  let appData = {};
  try {
    const pageSize = parseInt(req.query.pageSize, 0) || 10; //neu ko send param thi la 10
    var page = parseInt(req.query.page <= 0 ? 1 : req.query.page, 0) || 1;
    var customer_id = req.user.customer_id;
    var query = {};
    if (customer_id != undefined && customer_id != null && customer_id != '') {
      query.customer_id = mongoose.Types.ObjectId(customer_id);
      var options = {
        select: 'name descriptions createdAt total_distance total_car total_car_advertising car_wage start_time end_time',
        sort: { name: -1 },
        lean: true,
        page: page,
        limit: pageSize
      };
      await Campaign.paginate(query, options).then(function (result) {
        appData['success'] = successCode.success1;
        appData['data'] = result.docs;
        appData['PageIndex'] = parseInt(result.page);
        appData['PageSize'] = pageSize;
        appData['TotalRows'] = parseInt(result.pages);
        appData['status'] = HTTPStatus.OK;
        return res.status(HTTPStatus.OK).json(appData);
      });
    } else {
      appData['success'] = successCode.success0;
      appData['data'] = [];
      appData['PageIndex'] = 1;
      appData['PageSize'] = 1;
      appData['TotalRows'] = 1;
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


/** Lấy danh sách tất cả xe đang chạy cho 1 khách hàng combobox xe */
exports.getComboCarByCustomerID = async (req, res) => {
  let appData = {};
  try {
    var customer_id = req.user.customer_id;
    var criteria = {};
    criteria.customer_id = mongoose.Types.ObjectId(customer_id);
    let campaign = await Campaign.find(criteria).select({ 'cars': 1 })
      .populate({
        path: 'cars',
        select: { 'device_id': 1, 'license_plate': 1, '_id': 1, 'user_id': 1 },
        populate: {
          path: 'user_id',
          select: 'fullname phone',
        }
      });
    if (!campaign) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu';
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      var cars = [];
      campaign.forEach(function (camp) {
        camp.cars.forEach(function (r) {
          var element = {};
          element.value = r.device_id;
          element.label = r.user_id.fullname + ' - ' + r.license_plate;
          cars.push(element);
        });
      });
      res.status(HTTPStatus.OK).json(cars);
    }
  } catch (err) {
    res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json('Có lỗi trong khi nhận dữ liệu ' + err);
  }
};
/** End Tìm theo id*/

/** Lấy danh sách tất cả xe đang chạy cho 1 khách hàng combobox xe */
exports.getComboCarByCampaignID = async (req, res) => {
  let appData = {};
  try {
    var campaign_id = req.params.id;
    console.log("campaign_id"+ campaign_id);
    var criteria = {};
    criteria._id = mongoose.Types.ObjectId(campaign_id);
    let campaign = await Campaign.find(criteria).select({ 'cars': 1 })
      .populate({
        path: 'cars',
        select: { 'device_id': 1, 'license_plate': 1, '_id': 1, 'user_id': 1 },
        populate: {
          path: 'user_id',
          select: 'fullname phone',
        }
      });
    if (!campaign) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu';
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      var cars = [];
      campaign.forEach(function (camp) {
        camp.cars.forEach(function (r) {
          var element = {};
          element.value = r.device_id;
          element.label = r.user_id.fullname + ' - ' + r.license_plate;
          cars.push(element);
        });
      });
      res.status(HTTPStatus.OK).json(cars);
     // console.log("cars"+ cars);
    }
  } catch (err) {
    res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json('Có lỗi trong khi nhận dữ liệu ' + err);
  }
};
/** End Tìm theo id*/



/** Lấy danh sách tất cả xe đang chạy cho 1 khách hàng */
exports.getListCarByCustomerID = async (req, res) => {
  let appData = {};
  try {
    var customer_id = req.user.customer_id;
    var criteria = {};
    criteria.customer_id = mongoose.Types.ObjectId(customer_id);

    let campaign = await Campaign.find(criteria).select({ 'cars': 1,'start_time':1,'end_time':1 })
      .populate({
        path: 'cars',
        select: { 'device_id': 1, 'license_plate': 1, '_id': 1, 'user_id': 1 },
        populate: {
          path: 'user_id',
          select: 'fullname phone',
        }
      });
    if (!campaign) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu';
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      var cars = [];
      campaign.forEach(function (camp) {
        // console.log('campaign.start', camp.start_time);
        // console.log('campaign.end', camp.end_time);
        var startDate = new Date(camp.start_time);
        var endDate = new Date(camp.end_time);
        var nowDate = new Date(); 
        var strDate = nowDate.getFullYear()+'-'+(nowDate.getMonth()+1)+'-'+nowDate.getDate(); 
        var dateCurrent = new Date(strDate);
        if(startDate <= dateCurrent && dateCurrent <= endDate){
          camp.cars.forEach(function (r) {
            var element = {};
            element.Id = parseInt(r.device_id);
            element.name = r.user_id.fullname;
            element.license_plate = r.license_plate;
            element.phone = r.user_id.phone;
            element.user_id = r.user_id._id;
            cars.push(element);
          });
        }
      });
      res.status(HTTPStatus.OK).json(cars);
    }
  } catch (err) {
    res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json('Có lỗi trong khi nhận dữ liệu ' + err);
  }
};
/** End Tìm theo id*/

/** Danh sách xe có trong hợp đồng dualist*/
exports.findAllCarByCampaignID = async (req, res) => {
  let appData = {};
  let id = req.params.id;
  try {
    await Campaign.findById(id)
      .lean()
      .populate([
        {
          path: 'cars',
          select: "_id device_id license_plate car_manufacturer car_color active",
          populate: {
            path: 'user_id',
            select: 'fullname phone',
          }
        }
      ])
      .exec(function (err, campaign) {
        if (err) return next(err);
        if (campaign.cars.length > 0) {
          let listItemCar = [];
          campaign.cars.forEach(function (d) {
            var element = {};
            element._id = d._id;
            var strDevice_id = (d.user_id.fullname + ' | Device: ' + d.device_id + ' , ' + d.license_plate + ' , ' + d.car_manufacturer);
            element.device_id = strDevice_id;
            listItemCar.push(element);
          });
          appData['success'] = successCode.success1;
          appData['data'] = listItemCar;
          appData['title'] = campaign.name;
          appData['status'] = HTTPStatus.OK;
          res.status(HTTPStatus.OK).json(appData);
        } else {
          appData['success'] = successCode.success0;
          appData['data'] = [];
          appData['title'] = campaign.name;
          appData['status'] = HTTPStatus.OK;
          res.status(HTTPStatus.OK).json(appData);
        }
      })
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = [];
    appData['title'] = campaign.name;
    appData['status'] = HTTPStatus.OK;
    res.status(HTTPStatus.OK).json(appData);
  }
};
/** End Tìm theo id*/

/**begin get combobox hợp đồng by user_id */
export async function getComboByUserId(req, res) {
  let appData = {};
  try {
    var customer_id = req.user.customer_id;
    var query = {};
    if (customer_id != undefined && customer_id != null && customer_id != '') {
      query.customer_id = mongoose.Types.ObjectId(customer_id);
      let campaign = await Campaign.find(query, {
        _id: 1,
        name: 1
      }).sort({ name: 1 });
      if (!campaign) {
        appData['success'] = successCode.success0;
        appData['data'] = {};
        appData['status'] = HTTPStatus.OK;
        return res.status(HTTPStatus.OK).json(appData);
      } else {
        return res.status(HTTPStatus.OK).json(campaign);
      }
    } else {
      appData['success'] = successCode.success0;
      appData['data'] = {};
      appData['status'] = HTTPStatus.OK;
      return res.status(HTTPStatus.OK).json(appData);
    }
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = {};
    appData['status'] = HTTPStatus.OK;
    return res.status(HTTPStatus.OK).json(appData);
  }
};
/**end get combobox */

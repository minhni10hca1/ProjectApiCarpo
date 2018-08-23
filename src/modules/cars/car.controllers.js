import HTTPStatus from 'http-status';
import mongoose, { Schema } from 'mongoose';
import Car from './car.model';
import successCode from '../../utils/successCode';
import Campaign from '../campaigns/campaign.model';

const logger = require('../../utils/logger');

var moment = require('moment');
/*begin tạo mới*/
exports.create = async (req, res) => {
  let appData = {};
  var objCar = {};
  Object.keys(req.body).forEach(key => {
    objCar[key] = req.body[key];
  });

  let car = new Car(objCar);
  try {
    let data = await car.save();
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
    let car = await Car.find({});
    if (!car) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu';
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      appData['success'] = successCode.success1;
      appData['data'] = car;
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
  var filterDevice_id = req.query.device_id;
  var filterLicense_plate = req.query.license_plate;
  let appData = {};
  var criteria = {};
  if (filterDevice_id != undefined && filterDevice_id != null && filterDevice_id.trim() != '') {
    criteria.device_id = { '$regex': filterDevice_id.trim(), '$options': 'i' }
  }
  if (filterLicense_plate != undefined && filterLicense_plate != null && filterLicense_plate.trim() != '') {
    criteria.license_plate = { '$regex': filterLicense_plate.trim(), '$options': 'i' }
  }
  try {
    //fulltext search
    await Car.find(criteria)
      .skip((page - 1) * pageSize).limit(pageSize).sort({ device_id: 1 })
      .populate('user_id', 'fullname phone')
      .populate('group_id', 'full_name phone')
      .exec(function (err, cars) {
        Car.count(criteria).exec(function (err, count) {
          if (err) return next(err);
          appData['success'] = successCode.success1;
          appData['data'] = cars;
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
    let car = await Car.findById(id);
    if (!car) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu';
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      appData['success'] = successCode.success1;
      appData['data'] = car;
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
    var objCar = {};
    Object.keys(req.body).forEach(key => {
      objCar[key] = req.body[key];
      if (key == 'group_id') {
        if (req.body[key] == '') {
          objCar[key] = null;
        }
      }
    });
    let car = await Car.findByIdAndUpdate({ _id: _id }, objCar);
    if (!car) {
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
    let car = await Car.findByIdAndRemove({ _id });
    if (!car) {
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


/**begin tìm tất cả */
export async function findAll2(req, res, next) {
  let appData = {};
  try {
    await Car.find().populate('campaign_id')
      .populate('user_id')
      .populate('group_id').exec(function (err, cars) {
        if (err) { next(err); };
        res.json(cars);
      })
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = 'Có lỗi trong khi nhận dữ liệu ' + err;
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
};
/**end tìm tất cả */


/**begin tìm tất cả */
export async function findAllAvailable(req, res) {
  let appData = {};
  try {
    let cars = await Car.find({ active: false }).populate('user_id');
    if (!cars) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu';
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {

      let listItemCar = [];
      cars.forEach(function (d) {
        var element = {};
        element._id = d._id;
        var strDevice_id = (d.user_id.fullname + ' | Device: ' + d.device_id + ' , ' + d.license_plate + ' , ' + d.car_manufacturer);
        element.device_id = strDevice_id;
        listItemCar.push(element);
      });
      appData['success'] = successCode.success1;
      appData['data'] = listItemCar;
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

/** lấy danh sach xe theo khách hàng */
export async function getListCarByCustomerID_Evidence(req, res) {
  let appData = {};
  let arrCampaign = [];
  try {
    var customer_id = req.user.customer_id;
    var criteria = {};
    criteria.customer_id = mongoose.Types.ObjectId(customer_id);
    let campaign = await Campaign.find(criteria).select({ '_id': 1 });
    if (!campaign) {
      appData['success'] = successCode.success0;
      appData['data'] = [];
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      //loc ds campaignid de search trong bang car
      campaign.forEach(function (r) {
        arrCampaign.push(r._id);
      });
      // "license_plate": "51F-839.88",
      //       "car_color": "Trắng",
      //       "car_manufacturer": "Chevrolet Aveo",
      //       "device_id": "90719",
      let cars = await Car.find({ campaign_id: { $in: arrCampaign } }).select({ '_id': 1, 'license_plate': 1, 'car_color': 1, 'device_id': 1, 'car_manufacturer': 1 })
        .populate({
          path: 'user_id',
          select: 'fullname phone',
        });
      appData['success'] = successCode.success1;
      appData['data'] = cars;
      appData['status'] = HTTPStatus.OK;
      res.status(HTTPStatus.OK).json(appData);
    }
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = [];
    appData['status'] = HTTPStatus.OK;
    res.status(HTTPStatus.OK).json(appData);
  }
};
/** end lấy danh sách xe theo khách hàng */

/** lấy danh sach xe theo hợp đồng */
export async function getListCarByCampaignID_Evidence(req, res) {
  let appData = {};
  let arrCampaign = [];
  try {
    var campaign_id = req.params.id;
    if (!campaign_id) {
      appData['success'] = successCode.success0;
      appData['data'] = [];
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      let cars = await Car.find({ campaign_id: campaign_id}).select({ '_id': 1, 'license_plate': 1, 'car_color': 1, 'device_id': 1, 'car_manufacturer': 1 })
        .populate({
          path: 'user_id',
          select: 'fullname phone',
        });
      appData['success'] = successCode.success1;
      appData['data'] = cars;
      appData['status'] = HTTPStatus.OK;
      res.status(HTTPStatus.OK).json(appData);
    }
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = [];
    appData['status'] = HTTPStatus.OK;
    res.status(HTTPStatus.OK).json(appData);
  }
};
// HD

// lay danh sach xe có phân trang
exports.findAllCarByCustomerID = async (req, res) => {
  const pageSize = parseInt(req.query.pageSize, 0) || 10; //neu ko send param thi la 10
  var page = parseInt(req.query.page, 0) || 1;
  let appData = {};
  let arrCampaign = [];
  try {
    var customer_id = req.user.customer_id;
    var criteria = {};
    criteria.customer_id = mongoose.Types.ObjectId(customer_id);
    //console.log('customer_id:' + customer_id);
    let campaign = await Campaign.find(criteria).select({ '_id': 1 });
    if (!campaign) {
      appData['success'] = successCode.success0;
      appData['data'] = [];
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      //loc ds campaignid de search trong bang car
      campaign.forEach(function (r) {
        arrCampaign.push(r._id);
      });
      let cars = await Car.find({ campaign_id: { $in: arrCampaign } }).skip((page - 1) * pageSize).limit(pageSize).sort({ created_date: -1, created_time: -1 }).select({ '_id': 1, 'license_plate': 1, 'car_color': 1, 'device_id': 1, 'car_manufacturer': 1 })
        .populate({
          path: 'user_id',
          select: 'fullname phone',
        })
        .exec(function (err, datas) {
          Car.count({ campaign_id: { $in: arrCampaign } }).exec(function (err, count) {
            if (err) return next(err);
            appData['success'] = successCode.success1;
            appData['PageIndex'] = parseInt(page);
            appData['PageSize'] = pageSize;
            appData['TotalRows'] = count;
            appData['status'] = HTTPStatus.OK;
            appData['data'] = datas;
            return res.status(HTTPStatus.OK).json(appData);
          })
        });
    }
  } catch (err) {
    appData['success'] = successCode.success1;
    appData['data'] = [];
    appData['PageIndex'] = 1;
    appData['PageSize'] = 1;
    appData['TotalRows'] = 0;
    appData['status'] = HTTPStatus.OK;
    return res.status(HTTPStatus.OK).json(appData);
  }
};
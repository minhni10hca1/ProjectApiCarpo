import HTTPStatus from 'http-status';
import mongoose, { Schema } from 'mongoose';
import ConfirmCarStatus from './confirm_car_status.model';
import Campaign from '../campaigns/campaign.model';
import successCode from '../../utils/successCode';

var moment = require('moment-timezone');

/**begin tìm tất cả paging */
export async function findAllPaging(req, res) {
  const pageSize = parseInt(req.query.pageSize, 0) || 10; //neu ko send param thi la 10
  var page = parseInt(req.query.page, 0) || 1;
  let appData = {};
  try {
    var query = {};
    var fromDate = moment(req.query.startDate, ["DD/MM/YYYY", "YYYY-MM-DD"]);
    var endDate = moment(req.query.endDate, ["DD/MM/YYYY", "YYYY-MM-DD"]);
    var fromDate = moment(fromDate).format('YYYY-MM-DD');
    var toDate = moment(endDate).format('YYYY-MM-DD');
    query.created_date = { $gte: fromDate, $lte: toDate };
    // var criteria = {};
    // var phone = null;
    // phone = req.query.phone;
    // var fullname = null;
    // fullname = req.query.fullname;
    // if (phone != undefined && phone != null && phone.trim() != '') {
    //   criteria.phone = { '$regex': phone.trim(), '$options': 'i' };
    // }
    var options = {
      sort: { created_date: -1, created_time: -1 },
      populate: [{ path: 'user_id', select: "fullname phone" }],
      lean: true,
      page: page,
      limit: pageSize
    };
    await ConfirmCarStatus.paginate(query, options).then(function (result) {
      appData['success'] = successCode.success1;
      appData['data'] = result.docs;
      appData['PageIndex'] = parseInt(result.page);
      appData['PageSize'] = pageSize;
      appData['TotalRows'] = parseInt(result.total);
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
/**end tìm tất cả paging*/

/** Lấy danh sách tất cả user_id đang chạy cho 1 khách hàng và tìm hình của xe đó */
exports.findAllByCustomerID = async (req, res) => {
  const pageSize = parseInt(req.query.pageSize, 0) || 10; //neu ko send param thi la 10
  var page = parseInt(req.query.page, 0) || 1;
  let appData = {};
  try {
    var customer_id = req.user.customer_id;
    var criteria = {};
    criteria.customer_id = mongoose.Types.ObjectId(customer_id);
    console.log('criteria', criteria);
    if (req.user.role == 'Client' && customer_id == undefined) {
      //nếu là client mà ko có customer_id thì return null
      appData['success'] = successCode.success0;
      appData['data'] = [];
      appData['PageIndex'] = parseInt(page);
      appData['PageSize'] = pageSize;
      appData['TotalRows'] = 0;
      appData['status'] = HTTPStatus.OK;
      return res.status(HTTPStatus.OK).json(appData);
    }

    let campaign = await Campaign.find(criteria).select({ 'cars': 1 })
      .populate({
        path: 'cars',
        select: { 'user_id': 1 }
      });

    if (!campaign) {
      appData['success'] = successCode.success0;
      appData['data'] = [];
      appData['PageIndex'] = parseInt(page);
      appData['PageSize'] = pageSize;
      appData['TotalRows'] = 0;
      appData['status'] = HTTPStatus.OK;
      return res.status(HTTPStatus.OK).json(appData);
    } else {
      var userids = [];
      campaign.forEach(function (camp) {
        camp.cars.forEach(function (r) {
          userids.push(r.user_id);
        });
      });
      var criteria = {};
      var fromDate = moment(req.query.startDate, ["DD/MM/YYYY", "YYYY-MM-DD"]);
      var endDate = moment(req.query.endDate, ["DD/MM/YYYY", "YYYY-MM-DD"]);
      var fromDate = moment(fromDate).format('YYYY-MM-DD');
      var toDate = moment(endDate).format('YYYY-MM-DD');
      criteria.created_date = { $gte: fromDate, $lte: toDate };
      if (userids.length > 0) {
        criteria.user_id = { $in: userids }
      }
      await ConfirmCarStatus.find(criteria).skip((page - 1) * pageSize).limit(pageSize).sort({ created_date: -1, created_time: -1 })
        .populate({
          path: 'user_id', select: "fullname phone"
        })
        .exec(function (err, images) {
          ConfirmCarStatus.count(criteria).exec(function (err, count) {
            if (err) return next(err);
            appData['success'] = successCode.success1;
            appData['data'] = images;
            appData['PageIndex'] = parseInt(page);
            appData['PageSize'] = pageSize;
            appData['TotalRows'] = count;
            appData['status'] = HTTPStatus.OK;
            return res.status(HTTPStatus.OK).json(appData);
          })
        });
    }
  } catch (err) {
    res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json('Có lỗi trong khi nhận dữ liệu ' + err);
  }
};
/** End Tìm theo id*/

// lay danh sach hinh theo user_id
export async function findListImgUser(req, res) {
  let appData = {};
  try {
    // console.log('kkk',req);

    var query = {};
    query.user_id = mongoose.Types.ObjectId(req.params.id);
    console.log('query.user_id',query.user_id);
    var options = {
      sort: { created_date: -1, created_time: -1 },
      populate: [{ 
        path: 'user_id', 
        select: "fullname phone"
      }],
      lean: true,
      limit:50
    };  
    await ConfirmCarStatus.paginate(query, options).then(function (result) {
      appData['success'] = successCode.success1;
      appData['data'] = result.docs;
      appData['status'] = HTTPStatus.OK;
      return res.status(HTTPStatus.OK).json(appData);
    });
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = 'Có lỗi trong khi nhận dữ liệu ' + err;
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
};
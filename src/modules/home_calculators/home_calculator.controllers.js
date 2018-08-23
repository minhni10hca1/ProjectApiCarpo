import HTTPStatus from 'http-status';

import HomeCalculator from './home_calculator.model';
import successCode from '../../utils/successCode';

/*begin tạo mới*/
// exports.create = async (req, res) => {
//   let appData = {};
//   var objArea = {};
//   Object.keys(req.body).forEach(key => {
//     objArea[key] = req.body[key];
//   });

//   let homecalculator = new HomeCalculator(objArea);
//   try {
//     let data = await area.save();
//     appData['success'] = successCode.success1;
//     appData['data'] = 'Tạo mới thành công';
//     appData['status'] = HTTPStatus.CREATED;
//     res.status(HTTPStatus.CREATED).json(appData);
//   } catch (err) {
//     appData['success'] = successCode.success0;
//     if (err.name === 'MongoError' && err.code === 11000) {
//       appData['status'] = 11000;
//       appData['data'] = err.message;
//     } else {
//       appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
//       appData['data'] = 'Có lỗi xảy ra trong khi cập nhật ' + err;
//     }
//     res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
//   }
// };
/** end tạo mới */

/**begin tìm tất cả */
export async function findAll(req, res) {
  let appData = {};
  try {
    let homeCalculatorDB = await HomeCalculator.find({}, {
      campaign_id: 1,
      user_id: 1,
      device_id: 1,
      total_km_yesterday: 1,
      total_km_30_day_before: 1
    });
    if (!homeCalculatorDB) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu';
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      appData['success'] = successCode.success1;
      appData['data'] = homeCalculatorDB;
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

/**begin một record */
export async function findOne(req, res) {
  let appData = {};
  try {
    // console.log('kkk',req);
    let id = req.params.id || 0;
    let homeCalculatorDB = await HomeCalculator.findOne({ "device_id": id }, {
      campaign_id: 1,
      user_id: 1,
      device_id: 1,
      total_km_yesterday: 1,
      total_km_30_day_before: 1
    });
    if (!homeCalculatorDB) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu';
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      appData['success'] = successCode.success1;
      appData['data'] = homeCalculatorDB;
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


/** xóa theo id */
exports.delete = async (req, res) => {
  let appData = {};
  let device_id = req.params.device_id;

  try {
    let homecalculator = await HomeCalculator.findOneAndRemove({ "device_id": device_id });
    if (!homecalculator) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy device_id ' + device_id;
      appData['status'] = HTTPStatus.NOT_FOUND;
      return res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      appData['success'] = successCode.success1;
      appData['data'] = 'Xóa dữ liệu device_id:' + device_id + ' thành công';
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

/* update theo device_id */
/** Cập nhật theo id */
export async function update(req, res) {
  let appData = {};
  let device_id = req.body['device_id'];
  try {
    var objHomeCal = {};
    Object.keys(req.body).forEach(key => {
      objHomeCal[key] = req.body[key];
      
    });
    let varhomeCalculator = await HomeCalculator.findOneAndUpdate({"device_id":device_id}, objHomeCal);
    if (!varhomeCalculator) {
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
import HTTPStatus from 'http-status';

import Activity from './activity.model';
import successCode from '../../utils/successCode';
export async function findAllPaging(req, res) {
  let appData = {};
  try {
    const pageSize = parseInt(req.query.pageSize, 0) || 10; //neu ko send param thi la 10
    var page = parseInt(req.query.page <= 0 ? 1 : req.query.page, 0) || 1;
    var filter = null;
    filter = req.query.filter;
    var criteria = { "data.name": { '$regex': filter.trim(), '$options': 'i' } };
    await Activity
      .find(criteria)
      .skip((page - 1) * pageSize).limit(pageSize)
      .sort({ timestamp: -1 })
      .exec(function (err, results) {
        Activity.count(criteria).exec(function (err, count) {
          if (err) return next(err)
          appData['success'] = successCode.success1;
          appData['data'] = results;
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

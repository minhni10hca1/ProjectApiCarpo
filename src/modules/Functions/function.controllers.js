import HTTPStatus from 'http-status';
import FunctionModel from './function.model';
import successCode from '../../utils/successCode';

const logger = require('../../utils/logger');

/**begin tìm tất cả chức năng của admin*/
export async function findAll(req, res) {
  let appData = {};
  try {
    // console.log('req', req.user.role);
    FunctionModel.find({ Role: req.user.role }, function (err, chucnang) {
      if (err) {
        appData['success'] = successCode.success0;
        appData['data'] = 'Có lỗi trong khi nhận dữ liệu ' + err;
        appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
      }
      else {
        if (chucnang) {
          appData['success'] = successCode.success1;
          appData['data'] = chucnang;
          appData['status'] = HTTPStatus.OK;
          res.status(HTTPStatus.OK).json(appData);
        } else {
          appData['success'] = successCode.success0;
          appData['data'] = 'Không tìm thấy dữ liệu';
          appData['status'] = HTTPStatus.NOT_FOUND;
          res.status(HTTPStatus.NOT_FOUND).json(appData);
        }
      }
    }).limit(50).sort({DisplayOrder:'asc'});
  } catch (err) {
    logger.info('Có lỗi trong khi nhận dữ liệu ' + err);
    appData['success'] = successCode.success0;
    appData['data'] = 'Có lỗi trong khi nhận dữ liệu ' + err;
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
};
/**end tìm tất cả */


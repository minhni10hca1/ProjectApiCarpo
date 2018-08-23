import HTTPStatus from 'http-status';

import FeedBack from './feedback.model';
import successCode from '../../utils/successCode';

export async function findAllPaging(req, res) {
  let appData = {};
  try {
    //lấy những phản hồi chưa đọc
    var filter = req.query.filter || 1;
    console.log(filter);
    let feedbacks = await FeedBack.find({ status: filter }).select({ '_id': 1, 'message': 1, 'image': 1, 'created_date': 1, 'created_time': 1, 'status': 1 })
      .populate({
        path: 'user_id',
        select: { '_id': 0, 'fullname': 1, 'phone': 1 }
      });
    if (!feedbacks) {
      appData['success'] = successCode.success0;
      appData['data'] = [];
      appData['status'] = HTTPStatus.OK;
      return res.status(HTTPStatus.OK).json(appData);
    } else {
      appData['success'] = successCode.success1;
      appData['data'] = feedbacks;
      appData['status'] = HTTPStatus.OK;
      return res.status(HTTPStatus.OK).json(appData);
    }
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = [];
    appData['status'] = HTTPStatus.OK;
    res.status(HTTPStatus.OK).json(appData);
  }
};


/** Cập nhật theo id */
export async function update(req, res) {
  let appData = {};
  let _id = req.params.id;

  try {
    let feedback = await FeedBack.findByIdAndUpdate({ _id }, {status: true});
    if (!feedback) {
      appData['success'] = successCode.success0;
      appData['data'] = {};
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      appData['success'] = successCode.success1;
      appData['data'] = feedback ;
      appData['status'] = HTTPStatus.OK;
      res.status(HTTPStatus.OK).json(appData);
    }
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = {};
    appData['status'] = HTTPStatus.OK;
    res.status(HTTPStatus.OK).json(appData);
  }
};

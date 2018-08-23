import HTTPStatus from 'http-status';

import Test from './test.model';


export async function addNew(req, res) {
  try {
    const test = await Test.create(req.body);
    return res.status(HTTPStatus.CREATED).json(test);
  } catch (e) {
    return res.status(HTTPStatus.BAD_REQUEST).json(e);
  }
}

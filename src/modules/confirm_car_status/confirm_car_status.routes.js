import { Router } from 'express';

import { authLocal, authJwt } from '../../services/auth.services';
import * as confirm_car_statusController from './confirm_car_status.controllers';

import security from '../../config/security';

const routes = new Router();

//ROLE_MANAGER: từ manager trở lên có quyền tất cả
routes.get('/paging', authJwt, confirm_car_statusController.findAllPaging);
routes.get('/findAllByCustomerID', authJwt, confirm_car_statusController.findAllByCustomerID);
routes.get('/findListImgUser/:id', authJwt, confirm_car_statusController.findListImgUser);
export default routes;

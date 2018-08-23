import { Router } from 'express';
import validate from 'express-validation';

import { authLocal, authJwt, authRole } from '../../services/auth.services';
import * as carController from './car.controllers';
import carValidation from './car.validations';

import security from '../../config/security';
const AuthRole = require('../../services/authentication');

const routes = new Router();

//ROLE_MANAGER: từ manager trở lên có quyền tất cả
routes.post('/add', authJwt, validate(carValidation.createCar), AuthRole.roleAuthorization(security.ROLE_MANAGER), carController.create);
routes.put('/update/:id', authJwt, validate(carValidation.updateCar), AuthRole.roleAuthorization(security.ROLE_MANAGER), carController.update);
routes.get('/detail/:id', authJwt, AuthRole.roleAuthorization(security.ROLE_MANAGER), carController.findOne);
routes.get('/', authJwt, AuthRole.roleAuthorization(security.ROLE_MANAGER), carController.findAll);
routes.get('/paging', authJwt, AuthRole.roleAuthorization(security.ROLE_MANAGER), carController.findAllPaging);
routes.delete('/delete/:id', authJwt, AuthRole.roleAuthorization(security.ROLE_MANAGER), carController.delete);
routes.get('/available', authJwt, AuthRole.roleAuthorization(security.ROLE_CLIENT), carController.findAllAvailable); //ds xe chưa gán hợp đồng
routes.get('/getListCarByCustomerID_Evidence', authJwt, carController.getListCarByCustomerID_Evidence); // lấy ds xe theo khách hàng
routes.get('/findAllCarByCustomerID', authJwt, carController.findAllCarByCustomerID); // lấy ds xe theo khách hàng
// new
routes.get('/getListCarByCampaignID_Evidence/:id', authJwt, carController.getListCarByCampaignID_Evidence); // lấy ds xe theo khách hàng
export default routes;

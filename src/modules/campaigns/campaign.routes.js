import { Router } from 'express';
import validate from 'express-validation';

import { authLocal, authJwt, authRole } from '../../services/auth.services';
import * as campaignController from './campaign.controllers';
import campaignValidation from './campaign.validations';

import security from '../../config/security';
const AuthRole = require('../../services/authentication');

const routes = new Router();

routes.post('/add', authJwt, validate(campaignValidation.createCampaign), AuthRole.roleAuthorization(security.ROLE_MANAGER), campaignController.create);
routes.put('/update/:id', authJwt, validate(campaignValidation.updateCampaign), AuthRole.roleAuthorization(security.ROLE_MANAGER), campaignController.update);
routes.put('/updateCars/:id', authJwt, AuthRole.roleAuthorization(security.ROLE_MANAGER), campaignController.updateCars);
routes.get('/detail/:id', authJwt, AuthRole.roleAuthorization(security.ROLE_MANAGER), campaignController.findOne);
routes.get('/', authJwt, AuthRole.roleAuthorization(security.ROLE_MANAGER), campaignController.findAll);
routes.get('/paging', authJwt, AuthRole.roleAuthorization(security.ROLE_MANAGER), campaignController.findAllPaging);
routes.get('/pagingCustomer', authJwt, AuthRole.roleAuthorization(security.ROLE_CLIENT), campaignController.findAllPagingByCustomer);
routes.get('/pagingCustomerAdmin', authJwt, AuthRole.roleAuthorization(security.ROLE_MANAGER), campaignController.findAllPagingByCustomerAdmin);
routes.delete('/delete/:id', authJwt, AuthRole.roleAuthorization(security.ROLE_MANAGER), campaignController.delete);
routes.get('/getCombo', authJwt, campaignController.getCombo); //getcombo ko cần authen
routes.get('/pagingCustomer2', authJwt, AuthRole.roleAuthorization(security.ROLE_CLIENT), campaignController.findAllPagingByCustomer2);
routes.get('/pagingCustomerAdmin2', authJwt, AuthRole.roleAuthorization(security.ROLE_MANAGER), campaignController.findAllPagingByCustomerAdmin2);
routes.get('/detailcars/:id', authJwt, AuthRole.roleAuthorization(security.ROLE_MANAGER), campaignController.findOneByID); //ds xe theo hợp đồng
routes.delete('/updateDeleteCar/:campaignid/:carid', authJwt, AuthRole.roleAuthorization(security.ROLE_MANAGER), campaignController.updateDeleteCar);
routes.get('/findOneByDeviceId', authJwt, AuthRole.roleAuthorization(security.ROLE_MANAGER), campaignController.findByDeviceId); //tìm kiếm hợp đồng theo device_id xe
routes.get('/findCustomerID', authJwt, campaignController.findAllByCustomerID); //lấy hợp đồng theo user đăng nhập là kh
routes.get('/getComboCarByCustomerID', authJwt, campaignController.getComboCarByCustomerID); //lấy ds tài xế theo kh combobox
routes.get('/getListCarByCustomerID', authJwt, campaignController.getListCarByCustomerID); //lấy ds tài xế theo kh
routes.get('/selectedItems/:id', authJwt, AuthRole.roleAuthorization(security.ROLE_MANAGER), campaignController.findAllCarByCampaignID); //ds xe theo hợp đồng dualist
routes.get('/getComboByUserID', authJwt, campaignController.getComboByUserId); //getcombo hợp đồng theo user đăng nhập
export default routes;

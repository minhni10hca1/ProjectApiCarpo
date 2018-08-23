import { Router } from 'express';
import validate from 'express-validation';

import { authLocal, authJwt, authRole } from '../../services/auth.services';
import * as customerController from './customer.controllers';
import customerValidation from './customer.validations';

import security from '../../config/security';
const AuthRole = require('../../services/authentication');

const routes = new Router();

//ROLE_MANAGER: từ manager trở lên có quyền tất cả của khách hàng
routes.post('/add', authJwt, validate(customerValidation.createCustomer), AuthRole.roleAuthorization(security.ROLE_MANAGER), customerController.create);
routes.put('/update/:id', authJwt, validate(customerValidation.updateCustomer), AuthRole.roleAuthorization(security.ROLE_MANAGER), customerController.update);
routes.get('/detail/:id', authJwt, AuthRole.roleAuthorization(security.ROLE_MANAGER), customerController.findOne);
routes.get('/', authJwt, AuthRole.roleAuthorization(security.ROLE_MANAGER), customerController.findAll);
routes.get('/paging', authJwt, AuthRole.roleAuthorization(security.ROLE_MANAGER), customerController.findAllPaging);
routes.get('/getbyUserId', authJwt, customerController.findAllbyUserIdPaging); //ko cần phan quyền vì client cũng get dc kh của mình
routes.delete('/delete/:id', authJwt, AuthRole.roleAuthorization(security.ROLE_MANAGER), customerController.delete);
routes.get('/getTotalCustomer', authJwt, customerController.totalcustomer);
routes.get('/getCombo', authJwt, customerController.getCombo); //getcombo ko cần authen
routes.get('/paging2', authJwt, customerController.getPaging2); //get paging cách 2
export default routes;

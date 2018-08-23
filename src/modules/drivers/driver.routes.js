import { Router } from 'express';
import validate from 'express-validation';

import { authLocal, authJwt, authRole } from '../../services/auth.services';
import * as driverController from './driver.controllers';
import driverValidation from './driver.validations';

import security from '../../config/security';
const AuthRole = require('../../services/authentication');

const routes = new Router();

//ROLE_MANAGER: từ manager trở lên có quyền tất cả
routes.post('/add', authJwt, validate(driverValidation.createDriver), AuthRole.roleAuthorization(security.ROLE_MANAGER), driverController.create);
routes.put('/update/:id', authJwt, validate(driverValidation.updateDriver), AuthRole.roleAuthorization(security.ROLE_MANAGER), driverController.update);
routes.get('/detail/:id', authJwt, AuthRole.roleAuthorization(security.ROLE_MANAGER), driverController.findOne);
routes.get('/', authJwt, AuthRole.roleAuthorization(security.ROLE_MANAGER), driverController.findAll);
routes.get('/paging', authJwt, AuthRole.roleAuthorization(security.ROLE_MANAGER), driverController.findAllPaging);
routes.delete('/delete/:id', authJwt, AuthRole.roleAuthorization(security.ROLE_MANAGER), driverController.delete);
routes.get('/getCombo', authJwt, driverController.getCombo); //getcombo ko cần authen
export default routes;

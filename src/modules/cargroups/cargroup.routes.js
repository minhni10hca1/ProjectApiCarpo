import { Router } from 'express';
import validate from 'express-validation';

import { authLocal, authJwt, authRole } from '../../services/auth.services';
import * as cargroupController from './cargroup.controllers';
import cargroupValidation from './cargroup.validations';

import security from '../../config/security';
const AuthRole = require('../../services/authentication');

const routes = new Router();

//ROLE_MANAGER: từ manager trở lên có quyền tất cả
routes.post('/add', authJwt, validate(cargroupValidation.createCarGroup), AuthRole.roleAuthorization(security.ROLE_MANAGER), cargroupController.create);
routes.put('/update/:id', authJwt, validate(cargroupValidation.updateCarGroup), AuthRole.roleAuthorization(security.ROLE_MANAGER), cargroupController.update);
routes.get('/detail/:id', authJwt, AuthRole.roleAuthorization(security.ROLE_MANAGER), cargroupController.findOne);
routes.get('/', authJwt, AuthRole.roleAuthorization(security.ROLE_MANAGER), cargroupController.findAll);
routes.get('/paging', authJwt, AuthRole.roleAuthorization(security.ROLE_MANAGER), cargroupController.findAllPaging);
routes.delete('/delete/:id', authJwt, AuthRole.roleAuthorization(security.ROLE_MANAGER), cargroupController.delete);
routes.get('/getCombo', authJwt, cargroupController.getCombo); //getcombo ko cần authen
export default routes;

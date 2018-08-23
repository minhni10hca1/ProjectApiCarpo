import { Router } from 'express';
import validate from 'express-validation';

import { authLocal, authJwt, authRole } from '../../services/auth.services';
import * as userController from './user.controllers';
import userValidation from './user.validations';

import security from '../../config/security';
const AuthRole = require('../../services/authentication');

const routes = new Router();

routes.post('/signup', validate(userValidation.signup), userController.register);
routes.post('/login', validate(userValidation.signin), userController.signInNotBcrypt);

routes.get('/detail/:id', authJwt, userController.findOne);
routes.get('/', authJwt, AuthRole.roleAuthorization(security.ROLE_MANAGER), userController.findAll);
routes.get('/paging', authJwt, AuthRole.roleAuthorization(security.ROLE_MANAGER), userController.findAllPaging);
routes.delete('/delete/:id', authJwt, userController.delete);
routes.put('/changepassword/:id', authJwt, validate(userValidation.changepassword), userController.changePassword);
routes.put('/update/:id', authJwt, validate(userValidation.update), userController.update);
routes.get('/getComboClient', authJwt, userController.getComboClient);
routes.get('/getComboClientbyRoleCode', authJwt, userController.getComboClientbyRoleCode);
export default routes;

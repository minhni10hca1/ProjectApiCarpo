import { Router } from 'express';
import validate from 'express-validation';

import * as roleController from './role.controllers';
import { authJwt } from '../../services/auth.services';
import roleValidation from './role.validations';

import security from '../../config/security';
const AuthRole = require('../../services/authentication');

const routes = new Router();

routes.post('/add', authJwt, validate(roleValidation.createRole), AuthRole.roleAuthorization(security.ROLE_ADMIN), roleController.create);
routes.get('/detail/:id', authJwt, roleController.findOne);
routes.get('/', authJwt, roleController.findAll);
routes.get('/paging', authJwt, roleController.findAllPaging);
routes.put('/update/:id', authJwt, validate(roleValidation.updateRole), AuthRole.roleAuthorization(security.ROLE_ADMIN), roleController.update);
routes.delete('/delete/:id', authJwt, AuthRole.roleAuthorization(security.ROLE_ADMIN), roleController.delete);
// routes.patch('/:id',authJwt,roleController.createPermission);
export default routes;

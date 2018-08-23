import { Router } from 'express';
import validate from 'express-validation';

import * as functionController from './function.controllers';
import { authJwt } from '../../services/auth.services';

import security from '../../config/security';
const AuthRole = require('../../services/authentication');

const routes = new Router();

routes.get('/menu', authJwt, functionController.findAll); //lấy tất cả chức năng của admin, và client
export default routes;

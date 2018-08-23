import { Router } from 'express';
import validate from 'express-validation';

import { authLocal, authJwt } from '../../services/auth.services';
import * as activityController from './activity.controllers';
const AuthRole = require('../../services/authentication');
import security from '../../config/security';

const routes = new Router();

routes.get('/paging', authJwt, AuthRole.roleAuthorization(security.ROLE_MANAGER), activityController.findAllPaging);
export default routes;

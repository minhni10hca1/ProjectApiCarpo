import { Router } from 'express';

import { authLocal, authJwt } from '../../services/auth.services';
import * as feedbackController from './feedback.controllers';
const AuthRole = require('../../services/authentication');
import security from '../../config/security';

const routes = new Router();

routes.get('/paging', authJwt, AuthRole.roleAuthorization(security.ROLE_MANAGER), feedbackController.findAllPaging);
routes.put('/update/:id', authJwt, AuthRole.roleAuthorization(security.ROLE_MANAGER), feedbackController.update);
export default routes;

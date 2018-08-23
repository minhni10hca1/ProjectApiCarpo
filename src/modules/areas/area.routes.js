import { Router } from 'express';
import validate from 'express-validation';

import { authLocal, authJwt, authRole } from '../../services/auth.services';
import * as areaController from './area.controllers';
import areaValidation from './area.validations';

const routes = new Router();

//ROLE_MANAGER: từ manager trở lên có quyền tất cả
routes.post('/add', authJwt, validate(areaValidation.createArea), areaController.create);
routes.put('/update/:id', authJwt, validate(areaValidation.updateArea),areaController.update);
routes.get('/detail/:id', authJwt, areaController.findOne);
routes.get('/', authJwt,areaController.findAll);
routes.get('/paging', authJwt, areaController.findAllPaging);
routes.delete('/delete/:id', authJwt,areaController.delete);
routes.get('/getCombo', authJwt, areaController.getCombo);
export default routes;

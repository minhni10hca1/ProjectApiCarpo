import { Router } from 'express';
import validate from 'express-validation';

import { authLocal, authJwt, authRole } from '../../services/auth.services';
import * as homeController from './home_calculator.controllers';
//import areaValidation from './area.validations';

const routes = new Router();

//ROLE_MANAGER: từ manager trở lên có quyền tất cả
// routes.post('/add', authJwt, validate(areaValidation.createArea), areaController.create);
routes.put('/update', authJwt,homeController.update);
routes.get('/detail/:id', authJwt, homeController.findOne);
routes.get('/all', authJwt,homeController.findAll);
routes.delete('/delete/:device_id', authJwt, homeController.delete);
// routes.get('/paging', authJwt, areaController.findAllPaging);
// routes.delete('/delete/:id', authJwt,areaController.delete);
// routes.get('/getCombo', authJwt, areaController.getCombo);
export default routes;

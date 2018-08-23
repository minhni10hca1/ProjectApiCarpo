import { Router } from 'express';

import * as testController from './test.controllers';

const routes = new Router();

routes.post('/addNew', testController.addNew);
export default routes;

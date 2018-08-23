import { Router } from 'express';
import validate from 'express-validation';

import * as trackingController from './tracking.controllers';
import { authJwt } from '../../services/auth.services';
import trackingValidation from './tracking.validations';
const routes = new Router();

routes.post('/add', authJwt, validate(trackingValidation.createTracking), trackingController.create);
routes.get('/getAll', authJwt, trackingController.findAll);
routes.get('/getGeo', authJwt, trackingController.findGeo);
routes.get('/findAllRankDate', authJwt, trackingController.findAllRankDate); //get tracking tu ngày - den ngày
routes.get('/getvehiclestatuses', authJwt, trackingController.getvehiclestatuses); //getvehiclestatuses vietmap tọa độ cuối cùng tất cả xe
routes.get('/getvehiclestatuses_One', authJwt, trackingController.getvehiclestatuses_One); //getvehiclestatuses vietmap tọa độ cuối cùng của 1 xe
routes.get('/getListCarByCampaignID/:id', authJwt, trackingController.getListCarByCampaignID); //thống kê km tài xế theo hợp đồng từ ngày đến ngày
routes.get('/getListCarNotInTracking', authJwt, trackingController.getListCarNotInTracking); // lấy xe trong tracking
routes.get('/getListCarByCampaignIDMonth/:id', authJwt, trackingController.getListCarByCampaignIDMonth); //thống kê km tài xế theo hợp đồng theo tháng
routes.post('/getChartbyDeviceIds', authJwt, trackingController.getChartbyDeviceIds); //thống kê chart theo deviceids, impressionNo
routes.post('/getChartbyDeviceIds_Max20', authJwt, trackingController.getChartbyDeviceIds_Max20); //ds tài xế chạy nhiều nhất theo hợp đồng (top 20)
routes.post('/getPieChartbyDeviceIds_Max10', authJwt, trackingController.getPieChartbyDeviceIds_Max10); // lấy data pie chart theo quận
routes.get('/getCampaignByCustomerID', authJwt, trackingController.getCampaignByCustomerID); //lấy ds hợp đồng theo kh trang chủ
routes.post('/getPointsHeatMap', authJwt, trackingController.getPointsHeatMap); //lấy all points theo deviceids dùng cho heatmap trong 1 tuần
export default routes;

import userRoutes from './users/user.routes';
import roleRoutes from './roles/role.routes';
import functionRoutes from './Functions/function.routes';
import postRoutes from './posts/post.routes';
import trackingRoutes from './trackings/tracking.routes';
import customerRoutes from './customers/customer.routes';
import campaignRoutes from './campaigns/campaign.routes';
import driverRoutes from './drivers/driver.routes';
import cargroupRoutes from './cargroups/cargroup.routes';
import carRoutes from './cars/car.routes';
import areaRoutes from './areas/area.routes';
import activityRoutes from './activitys/activity.routes';
import confirm_car_statusRoutes from './confirm_car_status/confirm_car_status.routes';
import feedbackRoutes from './feedbacks/feedback.routes';
import homeCalculatorsRoutes from './home_calculators/home_calculator.routes';

import testRoutes from './test/test.routes';
export default app => {
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/roles', roleRoutes);
  app.use('/api/v1/functions', functionRoutes);
  app.use('/api/v1/posts', postRoutes);
  app.use('/api/v1/trackings', trackingRoutes);
  app.use('/api/v1/customers', customerRoutes);
  app.use('/api/v1/campaigns', campaignRoutes);
  app.use('/api/v1/drivers', driverRoutes);
  app.use('/api/v1/cargroups', cargroupRoutes);
  app.use('/api/v1/cars', carRoutes);
  app.use('/api/v1/areas', areaRoutes);
  app.use('/api/v1/activitys', activityRoutes);
  app.use('/api/v1/evidences', confirm_car_statusRoutes);
  app.use('/api/v1/feedbacks', feedbackRoutes);
  app.use('/api/v1/homeCalculators', homeCalculatorsRoutes);

  app.use('/api/v1/tests', testRoutes);
};

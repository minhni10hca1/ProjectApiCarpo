import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import DATABASE_COLLECTION from '../../config/datacollections';
import formatDateTime from '../../utils/formatDateTime';
var mongoosePaginate = require('mongoose-paginate');
var moment = require('moment-timezone');

const ConfirmCarStatusSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    image: {
      type: String,
      trim: true,
    },
    created_date: {
      type: String,
      trim: true,
    },
    created_time: {
      type: String,
      trim: true,
    },
  }
);
ConfirmCarStatusSchema.plugin(mongoosePaginate);

export default mongoose.model('Confirm_Car_Status', ConfirmCarStatusSchema,DATABASE_COLLECTION.CONFIRM_CAR_STATUS_COLLECTION);

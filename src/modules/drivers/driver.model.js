import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import DATABASE_COLLECTION from '../../config/datacollections';
import formatDateTime from '../../utils/formatDateTime';
var moment = require('moment-timezone');

const DriverSchema = new Schema(
  {
    full_name: {
      type: String,
      trim: true,
      required: [true, 'Tên tài xế bắt buộc!'],
    },
    phone: {
      type: String,
      trim: true,
    },
    birth_day: {
      type: String,
      default: formatDateTime.localDate ,
    },
  },
  { timestamps: true },
);

DriverSchema.pre('validate', function(req, res, next) {
  next();
});

export default mongoose.model('Driver', DriverSchema,DATABASE_COLLECTION.DRIVER_COLLECTION);

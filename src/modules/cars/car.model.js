import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import DATABASE_COLLECTION from '../../config/datacollections';

var moment = require('moment-timezone');
import formatDateTime from '../../utils/formatDateTime';
const CarSchema = new Schema(
  {
    type: {
      type: String,
      trim: true,
      default: 0
    },
    car_color: {
      type: String,
      trim: true,
    },
    license_plate: {
      type: String,
      trim: true,
      required: [true, 'Biển số xe bắt buộc!'],
    },
    car_manufacturer: {
      type: String,
      trim: true,
    },
    start_time: {
      type: String,
      trim: true,
      default: formatDateTime.localDate
    },
    end_time: {
      type: String,
      trim: true,
      default: formatDateTime.localDate
    },
    created_time: {
      type: String,
      trim: true,
    },
    device_id: {
      type: String,
      trim: true,
      required: [true, 'Tên thiết bị bắt buộc!'],
      unique: true
    },
    group_id: {
      type: Schema.Types.ObjectId,
      trim: true,
      ref: 'CarGroup',
    },
    user_id: {
      type: Schema.Types.ObjectId,
      trim: true,
      required: [true, 'Người dùng bắt buộc!'],
      ref: 'User',
      unique: true
    },
    campaign_id: {
      type: String,
      trim: true,
      default: ""
    },
    active: {
      type: Boolean, //0: chưa chạy, 1: đã chạy cho hợp đồng
      default: false
    },
    status: {
      type: String, //ACTIVE: Đang chạy, SUSPENDED: Đã nghỉ
      enum: ['ACTIVE', 'SUSPENDED'],
      default: "ACTIVE"
    },
  },
  { timestamps: true },
);

// var autoPopulateLead = function(next) {
//   this.populate('lead');
//   next();
// };

// bandSchema.
//   pre('findOne', autoPopulateLead).
//   pre('find', autoPopulateLead);

CarSchema.pre('validate', function(req, res, next) {
  next();
});

export default mongoose.model('Car', CarSchema,DATABASE_COLLECTION.CAR_COLLECTION);

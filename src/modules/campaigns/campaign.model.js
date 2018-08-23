import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import DATABASE_COLLECTION from '../../config/datacollections';
import formatDateTime from '../../utils/formatDateTime';
// var moment = require('moment');
var moment = require('moment-timezone');
var mongoosePaginate = require('mongoose-paginate');
// var utcTime  = moment.utc().format('YYYY-MM-DD HH:mm:ss');
// var localTime  = moment.utc(utcTime).toDate();
const CampaignSchema = new Schema(
  {
    customer_id: {
      type: Schema.Types.ObjectId,
      trim: true,
      required: [true, 'Khách hàng bắt buộc!'],
      ref: 'Customer',
    },
    name: {
      type: String,
      trim: true,
      required: [true, 'Tên hợp đồng bắt buộc!'],
      unique: true,
    },
    total_distance: {
      type: Number,
      trim: true,
    },
    total_car: {
      type: Number,
      trim: true,
    },
    total_car_advertising: {
      type: Number,
      trim: true,
    },
    distance_per_car: {
      type: String,
      trim: true,
    },
    area_code: {
      type: String,
      trim: true,
      default: '1' //hồ chí minh
    },
    start_time: {
      type: String,
      default: formatDateTime.localDate //phải luôn là string thì mới format GMT+7 được
    },
    end_time: {
      type: String,
      default: formatDateTime.localDate //phải luôn là string thì mới format GMT+7 được
    },
    car_wage: {
      type: Number,
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
    descriptions: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
    },
    updatedAt: {
      type: Date,
    },
    status: {
      type: Boolean,
      default: true
    },
    cars: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car'
      }
    ],
    impressionNo: {
      type: Number,
      trim: true,
      default: 1
    },
    location_lat: {
      type: Number,
      trim: true,
    },
    location_lng: {
      type: Number,
      trim: true,
    },
  },
  { timestamps: true },
);

CampaignSchema.index({name: 'text'});
CampaignSchema.plugin(mongoosePaginate);
CampaignSchema.plugin(uniqueValidator, {
  message: '{VALUE} đã tồn tại!',
});

CampaignSchema.pre('validate', function (req, res, next) {
  next();
});

// update timestamps on save
CampaignSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  if (this.isNew) this.createdAt = this.updatedAt;
  next();
});

export default mongoose.model('Campaign', CampaignSchema, DATABASE_COLLECTION.CAMPAIGN_COLLECTION);

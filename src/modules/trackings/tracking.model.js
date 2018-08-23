import mongoose, { Schema } from 'mongoose';
import DATABASE_COLLECTION from '../../config/datacollections';
import formatDateTime from '../../utils/formatDateTime';
// var moment = require('moment');
var moment = require('moment-timezone');
const tsFormatDate = () => (new Date()).toLocaleDateString();
const tsFormatTime = () => (new Date()).toLocaleTimeString();


const TrackingSchema = new Schema(
  {
    device_id: {
      type: String,
      required: [true, 'Car is required!'],
      trim: true,
    },
    location_lat: {
      type: String,
      required: [true, 'Latitude is required!'],
      trim: true,
    },
    location_long: {
      type: String,
      required: [true, 'Longtitude is required!'],
      trim: true,
    },
    type: {
      type: String,
      trim: true,
      default: "1"
    },
    district_code: {
      type: String,
      trim: true,
    },
    district_name: {
      type: String,
      trim: true,
    },
    created_date: {
      type: String,
      trim: true,
      default: formatDateTime.localDate
    },
    created_time: {
      type: String,
      trim: true,
      default: tsFormatTime
    },
    status: {
      type: Number,
      trim: true,
    },
    speed: {
      type: Number,
      trim: true,
    },
    heading: {
      type: Number,
      trim: true,
    },
    distance: {
      type: Number,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    sensors: {
      type: [],
      trim: true,
    },
  },
  { timestamps: true },
);

TrackingSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

export default mongoose.model('Tracking', TrackingSchema, DATABASE_COLLECTION.TRACKING_COLLECTION);

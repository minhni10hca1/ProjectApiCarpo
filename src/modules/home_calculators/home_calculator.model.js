import mongoose, { Schema } from 'mongoose';
import DATABASE_COLLECTION from '../../config/datacollections';
var mongoosePaginate = require('mongoose-paginate');

const HomeCalculatorSchema = new Schema(
  {
    device_id: {
      type: String,
      trim: true,
    },
    total_km_yesterday: {
      type: Number,
      trim: true,
    },
  },
  { timestamps: true },
);
HomeCalculatorSchema.plugin(mongoosePaginate);

export default mongoose.model('HomeCalculator', HomeCalculatorSchema, DATABASE_COLLECTION.HOME_CALCULATOR_COLLECTION);

import mongoose, { Schema } from 'mongoose';
import DATABASE_COLLECTION from '../../config/datacollections';
var mongoosePaginate = require('mongoose-paginate');

const FeedBackSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    message: {
      type: String,
      trim: true,
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
    status: {
      type: Boolean,
      trim: true,
      default: 0
    },
  },
  { timestamps: true },
);

FeedBackSchema.plugin(mongoosePaginate);

export default mongoose.model('FeedBack', FeedBackSchema, DATABASE_COLLECTION.FEEDBACK);

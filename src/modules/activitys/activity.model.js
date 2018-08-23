import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import DATABASE_COLLECTION from '../../config/datacollections';
var mongoosePaginate = require('mongoose-paginate');

const ActivitySchema = new Schema(
  {
    uid: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);

ActivitySchema.plugin(mongoosePaginate);

export default mongoose.model('Log', ActivitySchema, DATABASE_COLLECTION.LOG_COLLECTION);

import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import DATABASE_COLLECTION from '../../config/datacollections';
var mongoosePaginate = require('mongoose-paginate');

const AreaSchema = new Schema(
  {
    code: {
      type: String,
      trim: true,
      required: [true, 'Mã là bắt buộc!'],
      unique: true
    },
    name: {
      type: String,
      trim: true,
      required: [true, 'Tên là bắt buộc!'],
    },
  },
  { timestamps: true },
);
AreaSchema.plugin(mongoosePaginate);
AreaSchema.plugin(uniqueValidator, {
  message: '{VALUE} đã tồn tại!',
});
AreaSchema.pre('validate', function (req, res, next) {
  next();
});

export default mongoose.model('Area', AreaSchema, DATABASE_COLLECTION.AREA_COLLECTION);

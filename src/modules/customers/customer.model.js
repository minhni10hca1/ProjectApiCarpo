import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import DATABASE_COLLECTION from '../../config/datacollections';
var mongoosePaginate = require('mongoose-paginate');

const CustomerSchema = new Schema(
  {
    company_name: {
      type: String,
      trim: true,
      required: [true, 'Tên khách hàng bắt buộc!'],
      minlength: [3, 'Tên khách hàng ít nhất 3 ký tự!'],
      unique: true,
    },
    address: {
      type: String,
      trim: true,
      required: [true, 'Địa chỉ bắt buộc!'],
    },
    customer_id: {
      type: Schema.Types.ObjectId,
      trim: true,
      required: [true, 'Người dùng bắt buộc!'],
      ref: 'User',
      unique: true,
    },
  },
  { timestamps: true },
);

CustomerSchema.index({company_name: 'text', address: 'text'});
CustomerSchema.plugin(mongoosePaginate);
CustomerSchema.plugin(uniqueValidator, {
  message: '{VALUE} đã tồn tại!',
});

CustomerSchema.pre('validate', function(req, res, next) {
  next();
});

export default mongoose.model('Customer', CustomerSchema,DATABASE_COLLECTION.CUSTOMER_COLLECTION);

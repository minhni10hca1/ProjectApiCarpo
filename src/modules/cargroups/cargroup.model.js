import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import DATABASE_COLLECTION from '../../config/datacollections';

const CarGroupSchema = new Schema(
  {
    full_name: {
      type: String,
      trim: true,
      required: [true, 'Tên nhóm bắt buộc!'],
    },
    phone: {
      type: String,
      trim: true,
      required: [true, 'Số điện thoại bắt buộc!'],
    },
    leader_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Tên người dùng bắt buộc!'],
      unique: true
    },
  },
  { timestamps: true },
);

CarGroupSchema.index({full_name: 'text'});
CarGroupSchema.plugin(uniqueValidator, {
  message: '{VALUE} đã tồn tại!',
});
CarGroupSchema.pre('validate', function (req, res, next) {
  next();
});

export default mongoose.model('CarGroup', CarGroupSchema, DATABASE_COLLECTION.CAR_GROUP_COLLECTION);

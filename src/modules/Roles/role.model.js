import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import permissionInit from '../../config/permission.init';
import DATABASE_COLLECTION from '../../config/datacollections';
const RoleSchema = new Schema(
  {
    Name: {
      type: String,
      required: [true, 'Tên nhóm là bắt buộc!'],
      trim: true,
      unique: true,
    },
    Description: {
      type: String,
      trim: true,
    },
    Permissions: {
      type: Array,
      default: permissionInit.PERMISS_CLIENT
    }
  },
  { timestamps: true },
);

RoleSchema.plugin(uniqueValidator, {
  message: '{VALUE} đã tồn tại!',
});

RoleSchema.statics = {
  list({ skip = 0, limit = 5 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  },
}

export default mongoose.model('Role', RoleSchema,DATABASE_COLLECTION.ROLE_COLLECTION);

import mongoose, { Schema } from 'mongoose';
import DATABASE_COLLECTION from '../../config/datacollections';
const FunctionSchema = new Schema(
  {
    Code: {
      type: String,
      required: [true, 'Mã chức năng là bắt buộc!'],
      trim: true,
      unique: true,
    },
    Name: {
      type: String,
      trim: true,
    }
  },
  { timestamps: true },
);

FunctionSchema.statics = {
  list({ skip = 0, limit = 100 } = {}) {
    return this.findOne()
      .sort({ 'DisplayOrder': 1 });
  },
}
export default mongoose.model('Function', FunctionSchema, DATABASE_COLLECTION.FUNCTION_COLLECTION);

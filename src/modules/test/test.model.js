import mongoose, { Schema } from 'mongoose';
import DATABASE_COLLECTION from '../../config/datacollections';
const TestSchema = new Schema(
  {
    Name: {
      type: String,
      trim: true,
    }
  },
  { timestamps: true },
);

export default mongoose.model('Test', TestSchema, DATABASE_COLLECTION.TEST_COLLECTION);

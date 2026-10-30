import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRevenue extends Document {
  labels: string[];
  values: number[];
}

const revenueSchema = new Schema<IRevenue>({
  labels: [String],
  values: [Number],
});

export const Revenue: Model<IRevenue> =
  mongoose.models.Revenue || mongoose.model<IRevenue>('Revenue', revenueSchema);

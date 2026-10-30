import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubscriber extends Document {
  email: string;
  date: string;
}

const subscriberSchema = new Schema<ISubscriber>({
  email: { type: String, required: true },
  date: { type: String, required: true },
});

export const Subscriber: Model<ISubscriber> =
  mongoose.models.Subscriber || mongoose.model<ISubscriber>('Subscriber', subscriberSchema);

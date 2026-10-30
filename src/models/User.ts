import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  salt: string;
  phone: string;
  city: string;
  address: string;
  verified: boolean;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  salt: { type: String, required: true },
  phone: { type: String, default: '' },
  city: { type: String, default: '' },
  address: { type: String, default: '' },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema);

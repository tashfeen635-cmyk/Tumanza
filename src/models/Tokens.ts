import mongoose, { Schema, Model } from 'mongoose';

// Admin Token
const tokenSchema = new Schema({
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 },
});

// User Session Token
const userTokenSchema = new Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 },
});

// Password Reset OTP Token
const passwordResetTokenSchema = new Schema({
  code: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  attempts: { type: Number, default: 0 },
  grantToken: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now, expires: 600 },
});

// Email Verification Token
const emailVerificationTokenSchema = new Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 },
});

export const Token: Model<any> =
  mongoose.models.Token || mongoose.model('Token', tokenSchema);

export const UserToken: Model<any> =
  mongoose.models.UserToken || mongoose.model('UserToken', userTokenSchema);

export const PasswordResetToken: Model<any> =
  mongoose.models.PasswordResetToken || mongoose.model('PasswordResetToken', passwordResetTokenSchema);

export const EmailVerificationToken: Model<any> =
  mongoose.models.EmailVerificationToken || mongoose.model('EmailVerificationToken', emailVerificationTokenSchema);

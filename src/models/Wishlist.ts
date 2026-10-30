import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWishlist extends Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const wishlistSchema = new Schema<IWishlist>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  createdAt: { type: Date, default: Date.now },
});

wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const Wishlist: Model<IWishlist> =
  mongoose.models.Wishlist || mongoose.model<IWishlist>('Wishlist', wishlistSchema);

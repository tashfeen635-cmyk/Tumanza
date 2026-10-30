import mongoose, { Schema, Model } from 'mongoose';
import { Order } from './Order';

const counterSchema = new Schema({
  _id: { type: String },
  seq: { type: Number, default: 0 },
});

export const Counter: Model<any> =
  mongoose.models.Counter || mongoose.model('Counter', counterSchema);

export async function nextOrderNumber(): Promise<number> {
  let counter = await Counter.findById('orderSeq');
  if (!counter) {
    let max = 1010;
    const existing = await Order.find({}, 'orderId').lean();
    for (let i = 0; i < existing.length; i++) {
      const m = /(\d+)/.exec((existing[i] as any).orderId || '');
      if (m) {
        const n = parseInt(m[1], 10);
        if (n > max) max = n;
      }
    }
    try {
      counter = await Counter.create({ _id: 'orderSeq', seq: max });
    } catch {
      counter = await Counter.findById('orderSeq');
    }
  }
  const updated = await Counter.findByIdAndUpdate(
    'orderSeq',
    { $inc: { seq: 1 } },
    { new: true }
  );
  return updated.seq;
}

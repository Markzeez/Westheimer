import mongoose, { Schema, Document, models } from 'mongoose';
import { IPayment } from '@/types';

const paymentSchema = new Schema<IPayment & Document>({
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  method: {
    type: String,
    enum: ['stripe', 'paypal', 'cod', 'bank_transfer'],
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 }, { unique: true });
paymentSchema.index({ createdAt: -1 });

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(this.amount);
});

// Ensure virtual fields are serialized
paymentSchema.set('toJSON', { virtuals: true });
paymentSchema.set('toObject', { virtuals: true });

export const Payment = models.Payment || mongoose.model<IPayment & Document>('Payment', paymentSchema);
export default Payment;
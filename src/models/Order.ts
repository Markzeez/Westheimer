import mongoose, { Schema, Document, models } from 'mongoose';
import { IOrder, IOrderItem } from '@/types';

const orderItemSchema = new Schema<IOrderItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  image: {
    type: String,
    required: true
  }
}, { _id: false });

const shippingAddressSchema = new Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  zipCode: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true }
}, { _id: false });

const orderSchema = new Schema<IOrder & Document>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: function(items: IOrderItem[]) {
        return items.length > 0;
      },
      message: 'Order must have at least one item'
    }
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  shippingAddress: {
    type: shippingAddressSchema,
    required: true
  },
  paymentId: {
    type: Schema.Types.ObjectId,
    ref: 'Payment'
  },
  trackingNumber: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ paymentId: 1 });

// Virtual for formatted total
orderSchema.virtual('formattedTotal').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(this.total);
});

// Virtual for item count
orderSchema.virtual('itemCount').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Ensure virtual fields are serialized
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

export const Order = models.Order || mongoose.model<IOrder & Document>('Order', orderSchema);
export default Order;
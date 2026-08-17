import mongoose, { Schema, Document, models } from 'mongoose';
import { ICart, ICartItem } from '@/types';

const cartItemSchema = new Schema<ICartItem>({
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
    min: 1,
    default: 1
  },
  image: {
    type: String,
    required: true
  }
}, { _id: false });

const cartSchema = new Schema<ICart & Document>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: {
    type: [cartItemSchema],
    default: []
  }
}, {
  timestamps: { updatedAt: 'updatedAt', createdAt: false }
});

// Indexes
cartSchema.index({ userId: 1 }, { unique: true });
cartSchema.index({ updatedAt: -1 });

// Virtual for total items
cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Virtual for subtotal
cartSchema.virtual('subtotal').get(function() {
  return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

// Virtual for formatted subtotal
cartSchema.virtual('formattedSubtotal').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(this.subtotal);
});

// Ensure virtual fields are serialized
cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

export const Cart = models.Cart || mongoose.model<ICart & Document>('Cart', cartSchema);
export default Cart;
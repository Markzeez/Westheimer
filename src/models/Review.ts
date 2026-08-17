import mongoose, { Schema, Document, models } from 'mongoose';
import { IReview } from '@/types';

const reviewSchema = new Schema<IReview & Document>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: [2000, 'Comment cannot exceed 2000 characters']
  },
  images: [{
    type: String,
    trim: true
  }],
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ productId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Static method to calculate average rating for a product
reviewSchema.statics.calculateAverageRating = async function(productId: mongoose.Types.ObjectId) {
  const result = await this.aggregate([
    { $match: { productId } },
    { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  
  if (result.length > 0) {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      ratings: Math.round(result[0].avgRating * 10) / 10,
      reviewCount: result[0].count
    });
  }
  
  return result[0] || { avgRating: 0, count: 0 };
};

// Post-save middleware to update product ratings
reviewSchema.post('save', async function() {
  await this.constructor.calculateAverageRating(this.productId);
});

// Post-remove middleware to update product ratings
reviewSchema.post('deleteOne', { document: true, query: false }, async function() {
  await this.constructor.calculateAverageRating(this.productId);
});

export const Review = models.Review || mongoose.model<IReview & Document>('Review', reviewSchema);
export default Review;
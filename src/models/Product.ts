import mongoose, { Schema, Document, models } from 'mongoose';
import { IProduct, IProductImage } from '@/types';

const productImageSchema = new Schema<IProductImage>({
  url: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    required: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const productSchema = new Schema<IProduct & Document>({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: [
      'living-room',
      'bedroom',
      'dining-room',
      'office',
      'outdoor',
      'storage',
      'lighting',
      'decor'
    ]
  },
  subCategory: {
    type: String,
    trim: true
  },
  images: {
    type: [productImageSchema],
    required: [true, 'At least one image is required'],
    validate: {
      validator: function(images: IProductImage[]) {
        return images.length > 0 && images.length <= 5;
      },
      message: 'Product must have between 1 and 5 images'
    }
  },
  inventory: {
    type: Number,
    required: [true, 'Inventory is required'],
    min: [0, 'Inventory cannot be negative'],
    default: 0
  },
  ratings: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: [0, 'Review count cannot be negative']
  },
  features: [{
    type: String,
    trim: true
  }],
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
    unit: { type: String, enum: ['cm', 'inch'], default: 'cm' }
  },
  material: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
productSchema.index({ category: 1 });
productSchema.index({ subCategory: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ ratings: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ name: 'text', description: 'text' });

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images[0]?.url || '');
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.inventory === 0) return 'out-of-stock';
  if (this.inventory <= 10) return 'low-stock';
  return 'in-stock';
});

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(this.price);
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Pre-save middleware to ensure only one primary image
productSchema.pre('save', function(next) {
  const primaryImages = this.images.filter(img => img.isPrimary);
  if (primaryImages.length > 1) {
    // Keep only the first one as primary
    this.images.forEach((img, index) => {
      img.isPrimary = index === 0;
    });
  } else if (primaryImages.length === 0 && this.images.length > 0) {
    this.images[0].isPrimary = true;
  }
  next();
});

export const Product = models.Product || mongoose.model<IProduct & Document>('Product', productSchema);
export default Product;
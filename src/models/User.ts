import mongoose, { Schema, Document, models } from 'mongoose';
import { IUser } from '@/types';

const userSchema = new Schema<IUser & Document>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  address: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  orderHistory: [{
    type: Schema.Types.ObjectId,
    ref: 'Order'
  }]
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

export const User = models.User || mongoose.model<IUser & Document>('User', userSchema);
export default User;
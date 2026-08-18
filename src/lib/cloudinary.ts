import { v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import crypto from 'crypto';

// Cloudinary Configuration
export const cloudinaryConfig = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  apiKey: process.env.CLOUDINARY_API_KEY || '',
  apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || 'furnistore_products',
};

export const isCloudinaryConfigured = () => {
  return !!(
    cloudinaryConfig.cloudName &&
    cloudinaryConfig.apiKey &&
    cloudinaryConfig.apiSecret
  );
};

// Generate Cloudinary upload signature
export function generateSignature(params: Record<string, string>) {
  // import crypto from "crypto";
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  const stringToSign = `${sortedParams}${cloudinaryConfig.apiSecret}`;
  return crypto.createHash('sha1').update(stringToSign).digest('hex');
}

// Upload image to Cloudinary
type CloudinaryTransformation = Record<string, string | number | boolean>;
type CloudinaryUploadOptions = {
  folder: string;
  resource_type: 'image' | 'video' | 'raw' | 'auto';
  transformation: CloudinaryTransformation[];
  public_id?: string;
};
type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
};

export async function uploadToCloudinary(
  file: Buffer | string,
  options: {
    folder?: string;
    publicId?: string;
    transformation?: CloudinaryTransformation | CloudinaryTransformation[];
    resourceType?: 'image' | 'video' | 'raw' | 'auto';
  } = {}
) {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary not configured. Please add CLOUDINARY_* env variables.');
  }

  // const { v2: cloudinary } = require('cloudinary');
  
  cloudinary.config({
    cloud_name: cloudinaryConfig.cloudName,
    api_key: cloudinaryConfig.apiKey,
    api_secret: cloudinaryConfig.apiSecret,
  });

  const uploadOptions: CloudinaryUploadOptions = {
    folder: options.folder || 'furnistore/products',
    resource_type: options.resourceType || 'image',
    transformation: Array.isArray(options.transformation)
      ? options.transformation
      : options.transformation
        ? [options.transformation]
        : [
            { width: 1200, height: 900, crop: 'limit', quality: 'auto' },
            { fetch_format: 'auto' },
          ],
  };

  if (options.publicId) {
    uploadOptions.public_id = options.publicId;
  }

  try {
    let result: {
      secure_url: string;
      public_id: string;
      width: number;
      height: number;
      format: string;
      bytes: number;
    };
    if (Buffer.isBuffer(file)) {
      // Upload from buffer
      result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error: UploadApiErrorResponse | undefined, uploadResult?: UploadApiResponse) => {
          if (error) reject(error);
          else resolve(uploadResult as UploadApiResponse);
        });
        uploadStream.end(file);
      });
    } else {
      // Upload from file path or base64
      result = await cloudinary.uploader.upload(file, uploadOptions);
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload image: ${error}`);
  }
}

// Upload multiple images
export async function uploadMultipleToCloudinary(
  files: (Buffer | string)[],
  folder: string = 'furnistore/products'
) {
  const results = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const publicId = `${folder}/${Date.now()}-${i}`;
    const result = await uploadToCloudinary(file, { folder, publicId });
    results.push({
      ...result,
      isPrimary: i === 0,
      alt: `Product image ${i + 1}`,
    });
  }
  return results;
}

// Delete image from Cloudinary
export async function deleteFromCloudinary(publicId: string) {
  if (!isCloudinaryConfigured()) return false;

  // const { v2: cloudinary } = require('cloudinary');
  cloudinary.config({
    cloud_name: cloudinaryConfig.cloudName,
    api_key: cloudinaryConfig.apiKey,
    api_secret: cloudinaryConfig.apiSecret,
  });

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
}

// Generate optimized image URLs
export function getOptimizedUrl(publicId: string, options: {
  width?: number;
  height?: number;
  crop?: 'fill' | 'scale' | 'fit' | 'thumb' | 'limit';
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
} = {}) {
  if (!isCloudinaryConfigured()) return '';

  // const { v2: cloudinary } = require('cloudinary');
  
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      { width: options.width, height: options.height, crop: options.crop || 'fill' },
      { quality: options.quality || 'auto' },
      { fetch_format: options.format || 'auto' },
    ],
  });
}

// Generate thumbnail URLs for product gallery
export function getThumbnailUrls(publicId: string) {
  return {
    thumbnail: getOptimizedUrl(publicId, { width: 100, height: 100, crop: 'thumb' }),
    small: getOptimizedUrl(publicId, { width: 300, height: 225, crop: 'fill' }),
    medium: getOptimizedUrl(publicId, { width: 600, height: 450, crop: 'fill' }),
    large: getOptimizedUrl(publicId, { width: 1200, height: 900, crop: 'limit' }),
    original: getOptimizedUrl(publicId, {}),
  };
}
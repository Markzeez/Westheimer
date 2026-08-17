import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { uploadMultipleToCloudinary, deleteFromCloudinary, isCloudinaryConfigured } from '@/lib/cloudinary';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const product = await Product.findById(id).lean();

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;

    const formData = await request.formData();
    
    const updateData: any = {};
    
    const fields = ['name', 'description', 'price', 'category', 'subCategory', 'inventory', 'material', 'color'];
    fields.forEach(field => {
      const value = formData.get(field);
      if (value !== null) {
        if (field === 'price') updateData[field] = parseFloat(value as string);
        else if (field === 'inventory') updateData[field] = parseInt(value as string);
        else updateData[field] = value;
      }
    });

    const booleanFields = ['isActive', 'isFeatured'];
    booleanFields.forEach(field => {
      const value = formData.get(field);
      if (value !== null) {
        updateData[field] = value === 'true';
      }
    });

    const jsonFields = ['features', 'dimensions'];
    jsonFields.forEach(field => {
      const value = formData.get(field);
      if (value !== null) {
        updateData[field] = JSON.parse(value as string);
      }
    });

    // Handle new images - upload to Cloudinary if configured
    const imageFiles = formData.getAll('images') as File[];
    if (imageFiles.length > 0 && imageFiles[0].size > 0) {
      if (isCloudinaryConfigured()) {
        // Delete old images from Cloudinary
        const existingProduct = await Product.findById(id).lean();
        if (existingProduct?.images) {
          for (const img of existingProduct.images) {
            if (img.publicId) {
              await deleteFromCloudinary(img.publicId);
            }
          }
        }

        // Upload new images
        const buffers = await Promise.all(
          imageFiles.map(async (file) => {
            const arrayBuffer = await file.arrayBuffer();
            return Buffer.from(arrayBuffer);
          })
        );
        
        const cloudinaryResults = await uploadMultipleToCloudinary(buffers, 'furnistore/products');
        updateData.images = cloudinaryResults.map((result, i) => ({
          url: result.url,
          publicId: result.publicId,
          alt: `${updateData.name || 'Product'} - Image ${i + 1}`,
          isPrimary: i === 0,
        }));
      } else {
        // Fallback to base64
        const images: any[] = [];
        for (let i = 0; i < imageFiles.length && i < 5; i++) {
          const file = imageFiles[i];
          const buffer = await file.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          const mimeType = file.type;
          
          images.push({
            url: `data:${mimeType};base64,${base64}`,
            alt: `${updateData.name || 'Product'} - Image ${i + 1}`,
            isPrimary: i === 0
          });
        }
        updateData.images = images;
      }
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;

    // Delete images from Cloudinary before deleting product
    if (isCloudinaryConfigured()) {
      const product = await Product.findById(id).lean();
      if (product?.images) {
        for (const img of product.images) {
          if (img.publicId) {
            await deleteFromCloudinary(img.publicId);
          }
        }
      }
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
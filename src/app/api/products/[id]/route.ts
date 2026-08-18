import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase';
import { uploadMultipleToCloudinary, deleteFromCloudinary, isCloudinaryConfigured } from '@/lib/cloudinary';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createSupabaseServerClient();

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !product) {
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
    const session = await auth();
    
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const formData = await request.formData();
    
    const updateData: any = {};
    
    const fields = ['name', 'description', 'price', 'category', 'sub_category', 'inventory', 'material', 'color'];
    fields.forEach(field => {
      const value = formData.get(field);
      if (value !== null) {
        if (field === 'price') updateData[field] = parseFloat(value as string);
        else if (field === 'inventory') updateData[field] = parseInt(value as string);
        else updateData[field] = value;
      }
    });

    const booleanFields = ['is_active', 'is_featured'];
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
      const supabaseAdmin = createSupabaseAdminClient();
      
      // Delete old images from Cloudinary
      const { data: existingProduct } = await supabaseAdmin
        .from('products')
        .select('images')
        .eq('id', id)
        .single();
      
      if (existingProduct?.images && isCloudinaryConfigured()) {
        for (const img of existingProduct.images) {
          if (img.publicId) {
            await deleteFromCloudinary(img.publicId);
          }
        }
      }

      if (isCloudinaryConfigured()) {
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

    const supabaseAdmin = createSupabaseAdminClient();

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

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
    const session = await auth();
    
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const supabaseAdmin = createSupabaseAdminClient();

    // Delete images from Cloudinary before deleting product
    if (isCloudinaryConfigured()) {
      const { data: product } = await supabaseAdmin
        .from('products')
        .select('images')
        .eq('id', id)
        .single();
      
      if (product?.images) {
        for (const img of product.images) {
          if (img.publicId) {
            await deleteFromCloudinary(img.publicId);
          }
        }
      }
    }

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

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
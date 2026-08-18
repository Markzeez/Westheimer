import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, productIds, data } = body;

    if (!action || !productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createSupabaseAdminClient();

    let result;

    switch (action) {
      case 'activate':
        result = await supabaseAdmin
          .from('products')
          .update({ is_active: true })
          .in('id', productIds);
        break;
      case 'deactivate':
        result = await supabaseAdmin
          .from('products')
          .update({ is_active: false })
          .in('id', productIds);
        break;
      case 'feature':
        result = await supabaseAdmin
          .from('products')
          .update({ is_featured: true })
          .in('id', productIds);
        break;
      case 'unfeature':
        result = await supabaseAdmin
          .from('products')
          .update({ is_featured: false })
          .in('id', productIds);
        break;
      case 'delete':
        // Delete images from Cloudinary first
        const { data: products } = await supabaseAdmin
          .from('products')
          .select('images')
          .in('id', productIds);
        
        if (products) {
          const { isCloudinaryConfigured, deleteFromCloudinary } = await import('@/lib/cloudinary');
          if (isCloudinaryConfigured()) {
            for (const product of products) {
              if (product.images) {
                for (const img of product.images) {
                  if (img.publicId) {
                    await deleteFromCloudinary(img.publicId);
                  }
                }
              }
            }
          }
        }
        
        result = await supabaseAdmin
          .from('products')
          .delete()
          .in('id', productIds);
        break;
      case 'update-category':
        if (!data?.category) {
          return NextResponse.json(
            { success: false, error: 'Category is required' },
            { status: 400 }
          );
        }
        result = await supabaseAdmin
          .from('products')
          .update({ category: data.category })
          .in('id', productIds);
        break;
      case 'update-inventory':
        if (typeof data?.inventory !== 'number') {
          return NextResponse.json(
            { success: false, error: 'Inventory is required' },
            { status: 400 }
          );
        }
        result = await supabaseAdmin
          .from('products')
          .update({ inventory: data.inventory })
          .in('id', productIds);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    if (result.error) throw result.error;

    return NextResponse.json({
      success: true,
      data: {
        matchedCount: productIds.length,
        modifiedCount: result.count || 0,
        deletedCount: action === 'delete' ? productIds.length : 0,
      },
    });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform bulk action' },
      { status: 500 }
    );
  }
}
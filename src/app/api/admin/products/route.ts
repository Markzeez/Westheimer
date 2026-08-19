import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase';

interface AuthUser {
  role?: string;
  [key: string]: unknown;
}

interface BulkActionRequestBody {
  action: string;
  productIds: string[];
  data?: {
    category?: string;
    inventory?: number;
    [key: string]: unknown;
  };
}

interface CloudinaryImage {
  publicId?: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user as AuthUser | undefined;
    
    if (!session || user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: BulkActionRequestBody = await request.json();
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
          .update({ is_active: true }, { count: 'exact' })
          .in('id', productIds);
        break;
      case 'deactivate':
        result = await supabaseAdmin
          .from('products')
          .update({ is_active: false }, { count: 'exact' })
          .in('id', productIds);
        break;
      case 'feature':
        result = await supabaseAdmin
          .from('products')
          .update({ is_featured: true }, { count: 'exact' })
          .in('id', productIds);
        break;
      case 'unfeature':
        result = await supabaseAdmin
          .from('products')
          .update({ is_featured: false }, { count: 'exact' })
          .in('id', productIds);
        break;
      case 'delete': {
        // Wrapped in block scope to avoid lexical declaration overlap
        const { data: products } = await supabaseAdmin
          .from('products')
          .select('images')
          .in('id', productIds);
        
        if (products) {
          const { isCloudinaryConfigured, deleteFromCloudinary } = await import('@/lib/cloudinary');
          if (isCloudinaryConfigured()) {
            for (const product of products) {
              const images = product.images as CloudinaryImage[] | null;
              if (images) {
                for (const img of images) {
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
          .delete({ count: 'exact' })
          .in('id', productIds);
        break;
      }
      case 'update-category':
        if (!data?.category) {
          return NextResponse.json(
            { success: false, error: 'Category is required' },
            { status: 400 }
          );
        }
        result = await supabaseAdmin
          .from('products')
          .update({ category: data.category }, { count: 'exact' })
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
          .update({ inventory: data.inventory }, { count: 'exact' })
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
        modifiedCount: result.count ?? 0,
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
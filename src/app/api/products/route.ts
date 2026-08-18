import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase';
import { isCloudinaryConfigured, uploadMultipleToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const subCategory = searchParams.get('subCategory');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const search = searchParams.get('search');
    const isFeatured = searchParams.get('isFeatured');
    const isActive = searchParams.get('isActive') !== 'false';
    const inStock = searchParams.get('inStock');

    const supabase = createSupabaseServerClient();

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_active', isActive)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range((page - 1) * limit, page * limit - 1);

    if (category) query = query.eq('category', category);
    if (subCategory) query = query.eq('sub_category', subCategory);
    if (isFeatured === 'true') query = query.eq('is_featured', true);
    if (inStock === 'true') query = query.gt('inventory', 0);
    
    if (minPrice || maxPrice) {
      if (minPrice) query = query.gte('price', parseFloat(minPrice));
      if (maxPrice) query = query.lte('price', parseFloat(maxPrice));
    }

    if (search) {
      query = query.textSearch('name,description', search);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const category = formData.get('category') as string;
    const subCategory = formData.get('subCategory') as string;
    const inventory = parseInt(formData.get('inventory') as string);
    const features = JSON.parse(formData.get('features') as string || '[]');
    const dimensions = JSON.parse(formData.get('dimensions') as string || '{}');
    const material = formData.get('material') as string;
    const color = formData.get('color') as string;
    const isActive = formData.get('isActive') === 'true';
    const isFeatured = formData.get('isFeatured') === 'true';

    // Handle images - upload to Cloudinary if configured
    let images: any[] = [];
    const imageFiles = formData.getAll('images') as File[];
    
    if (imageFiles.length > 0 && imageFiles[0].size > 0) {
      if (isCloudinaryConfigured()) {
        const buffers = await Promise.all(
          imageFiles.map(async (file) => {
            const arrayBuffer = await file.arrayBuffer();
            return Buffer.from(arrayBuffer);
          })
        );
        
        const cloudinaryResults = await uploadMultipleToCloudinary(buffers, 'furnistore/products');
        images = cloudinaryResults.map((result, i) => ({
          url: result.url,
          publicId: result.publicId,
          alt: `${name} - Image ${i + 1}`,
          isPrimary: i === 0,
        }));
      } else {
        // Fallback to base64 (for development only)
        for (let i = 0; i < imageFiles.length && i < 5; i++) {
          const file = imageFiles[i];
          if (file.size > 0) {
            const buffer = await file.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            const mimeType = file.type;
            
            images.push({
              url: `data:${mimeType};base64,${base64}`,
              alt: `${name} - Image ${i + 1}`,
              isPrimary: i === 0
            });
          }
        }
      }
    }

    // If no images uploaded, add placeholder
    if (images.length === 0) {
      images.push({
        url: '/products/placeholder.jpg',
        alt: `${name} - Main Image`,
        isPrimary: true
      });
    }

    const supabaseAdmin = createSupabaseAdminClient();

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .insert({
        name,
        description,
        price,
        category,
        sub_category: subCategory,
        images,
        inventory,
        features,
        dimensions,
        material,
        color,
        is_active: isActive,
        is_featured: isFeatured,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: product
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
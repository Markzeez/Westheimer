import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase';
import { isCloudinaryConfigured, uploadMultipleToCloudinary } from '@/lib/cloudinary';

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
    const includeInactive = searchParams.get('includeInactive') === 'true';

    if (includeInactive && !(await getAuthenticatedAdmin())) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createSupabaseServerClient();

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range((page - 1) * limit, page * limit - 1);

    if (!includeInactive) query = query.eq('is_active', isActive);
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
      data: (data || []).map((product) => ({
        ...product,
        _id: product.id,
        subCategory: product.sub_category,
        reviewCount: product.review_count,
        isActive: product.is_active,
        isFeatured: product.is_featured,
        createdAt: product.created_at,
      })),
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

const productCreateSchema = z.object({
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(5000),
  price: z.number().finite().positive(),
  category: z.string().trim().min(1).max(80),
  subCategory: z.string().trim().max(80),
  inventory: z.number().int().nonnegative(),
  features: z.array(z.string().trim().min(1).max(200)).max(10),
  dimensions: z.object({
    length: z.number().nonnegative(),
    width: z.number().nonnegative(),
    height: z.number().nonnegative(),
    unit: z.enum(['cm', 'inch']),
  }),
  material: z.string().trim().max(120),
  color: z.string().trim().min(1).max(80),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedAdmin();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    
    let features: unknown;
    let dimensions: unknown;
    try {
      features = JSON.parse(String(formData.get('features') ?? '[]'));
      dimensions = JSON.parse(String(formData.get('dimensions') ?? '{}'));
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid product details' },
        { status: 400 }
      );
    }

    const parsedProduct = productCreateSchema.safeParse({
      name: formData.get('name'),
      description: formData.get('description'),
      price: Number(formData.get('price')),
      category: formData.get('category'),
      subCategory: formData.get('subCategory') ?? '',
      inventory: Number(formData.get('inventory')),
      features,
      dimensions,
      material: formData.get('material') ?? '',
      color: formData.get('color'),
      isActive: formData.get('isActive') === 'true',
      isFeatured: formData.get('isFeatured') === 'true',
    });
    if (!parsedProduct.success) {
      return NextResponse.json(
        { success: false, error: 'Provide a valid name, description, positive price, color, category, and stock quantity.' },
        { status: 400 }
      );
    }
    const {
      name, description, price, category, subCategory, inventory,
      features: validatedFeatures, dimensions: validatedDimensions,
      material, color, isActive, isFeatured,
    } = parsedProduct.data;

    // Handle images - upload to Cloudinary if configured
    let images: Array<{
      url: string;
      publicId?: string;
      alt: string;
      isPrimary: boolean;
    }> = [];
    const imageFiles = formData.getAll('images').filter(
      (entry): entry is File => entry instanceof File && entry.size > 0
    );
    if (imageFiles.length < 1 || imageFiles.length > 5) {
      return NextResponse.json(
        { success: false, error: 'Upload between 1 and 5 product images.' },
        { status: 400 }
      );
    }
    const validImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
    for (const file of imageFiles) {
      if (!validImageTypes.has(file.type)) {
        return NextResponse.json(
          { success: false, error: 'Images must be JPG, PNG, or WebP files.' },
          { status: 400 }
        );
      }
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: 'Each product image must be 10 MB or smaller.' },
          { status: 400 }
        );
      }
    }

    {
      if (isCloudinaryConfigured()) {
        const buffers = await Promise.all(
          imageFiles.map(async (file) => {
            const arrayBuffer = await file.arrayBuffer();
            return Buffer.from(arrayBuffer);
          })
        );
        
        const cloudinaryResults = await uploadMultipleToCloudinary(buffers, 'westheimer/products');
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
        features: validatedFeatures,
        dimensions: validatedDimensions,
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
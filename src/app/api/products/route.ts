import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { uploadMultipleToCloudinary, isCloudinaryConfigured } from '@/lib/cloudinary';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const subCategory = searchParams.get('subCategory');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const search = searchParams.get('search');
    const isFeatured = searchParams.get('isFeatured');
    const isActive = searchParams.get('isActive') !== 'false';
    const inStock = searchParams.get('inStock');

    const skip = (page - 1) * limit;

    // Build query
    const query: any = { isActive };

    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (isFeatured === 'true') query.isFeatured = true;
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (inStock === 'true') {
      query.inventory = { $gt: 0 };
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute queries
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
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
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

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
        // Convert files to buffers and upload to Cloudinary
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

    const product = await Product.create({
      name,
      description,
      price,
      category,
      subCategory,
      inventory,
      features,
      dimensions,
      material,
      color,
      isActive,
      isFeatured,
      images
    });

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
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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

    const body = await request.json();
    const { action, productIds, data } = body;

    if (!action || !productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'activate':
        result = await Product.updateMany(
          { _id: { $in: productIds } },
          { $set: { isActive: true } }
        );
        break;
      case 'deactivate':
        result = await Product.updateMany(
          { _id: { $in: productIds } },
          { $set: { isActive: false } }
        );
        break;
      case 'feature':
        result = await Product.updateMany(
          { _id: { $in: productIds } },
          { $set: { isFeatured: true } }
        );
        break;
      case 'unfeature':
        result = await Product.updateMany(
          { _id: { $in: productIds } },
          { $set: { isFeatured: false } }
        );
        break;
      case 'delete':
        result = await Product.deleteMany(
          { _id: { $in: productIds } }
        );
        break;
      case 'update-category':
        if (!data?.category) {
          return NextResponse.json(
            { success: false, error: 'Category is required' },
            { status: 400 }
          );
        }
        result = await Product.updateMany(
          { _id: { $in: productIds } },
          { $set: { category: data.category } }
        );
        break;
      case 'update-inventory':
        if (typeof data?.inventory !== 'number') {
          return NextResponse.json(
            { success: false, error: 'Inventory is required' },
            { status: 400 }
          );
        }
        result = await Product.updateMany(
          { _id: { $in: productIds } },
          { $set: { inventory: data.inventory } }
        );
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform bulk action' },
      { status: 500 }
    );
  }
}
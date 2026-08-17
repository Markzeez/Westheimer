import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
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

    const order = await Order.findById(id)
      .populate('userId', 'name email address')
      .populate('items.productId', 'name images inventory')
      .lean();

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
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

    const body = await request.json();
    const { status, trackingNumber, notes } = body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Handle inventory restoration for cancelled/refunded orders
    const oldStatus = order.status;
    if ((status === 'cancelled' || status === 'refunded') && 
        !['cancelled', 'refunded'].includes(oldStatus)) {
      // Restore inventory
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { inventory: item.quantity }
        });
      }
    }

    // If order was cancelled/refunded and now being reactivated, reduce inventory
    if (['cancelled', 'refunded'].includes(oldStatus) && 
        !['cancelled', 'refunded'].includes(status || oldStatus)) {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product && product.inventory < item.quantity) {
          return NextResponse.json(
            { success: false, error: `Insufficient inventory for ${item.name}` },
            { status: 400 }
          );
        }
      }
      // Reduce inventory
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { inventory: -item.quantity }
        });
      }
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (notes) updateData.notes = notes;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('userId', 'name email')
      .populate('items.productId', 'name images')
      .lean();

    return NextResponse.json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import Payment from '@/models/Payment';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'stats';

    if (type === 'stats') {
      // Get dashboard statistics
      const [
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        ordersByStatus,
        recentOrders,
        lowStockProducts,
        topProducts
      ] = await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Order.countDocuments(),
        Order.aggregate([
          { $match: { status: { $ne: 'cancelled' } } },
          { $group: { _id: null, total: { $sum: '$total' } } }
        ]),
        Order.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        Order.find()
          .sort({ createdAt: -1 })
          .limit(10)
          .populate('userId', 'name email')
          .lean(),
        Product.find({ inventory: { $lte: 10, $gt: 0 }, isActive: true })
          .sort({ inventory: 1 })
          .limit(10)
          .lean(),
        Order.aggregate([
          { $match: { status: { $ne: 'cancelled' } } },
          { $unwind: '$items' },
          { $group: { _id: '$items.productId', sales: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
          { $sort: { sales: -1 } },
          { $limit: 10 },
          { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
          { $unwind: '$product' },
          { $project: { _id: 1, name: '$product.name', sales: 1, revenue: 1 } }
        ])
      ]);

      // Revenue by month (last 12 months)
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const revenueByMonth = await Order.aggregate([
        { 
          $match: { 
            status: { $ne: 'cancelled' },
            createdAt: { $gte: twelveMonthsAgo }
          } 
        },
        {
          $group: {
            _id: { 
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: '$total' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      const formattedRevenueByMonth = revenueByMonth.map(item => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        revenue: item.revenue
      }));

      return NextResponse.json({
        success: true,
        data: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          ordersByStatus: ordersByStatus.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {} as Record<string, number>),
          recentOrders,
          lowStockProducts,
          topProducts,
          revenueByMonth: formattedRevenueByMonth
        }
      });
    }

    if (type === 'users') {
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const search = searchParams.get('search');
      const role = searchParams.get('role');

      const skip = (page - 1) * limit;
      const query: any = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      if (role) query.role = role;

      const [users, total] = await Promise.all([
        User.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select('-password')
          .lean(),
        User.countDocuments(query)
      ]);

      return NextResponse.json({
        success: true,
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    }

    if (type === 'orders') {
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const status = searchParams.get('status');

      const skip = (page - 1) * limit;
      const query: any = {};

      if (status) query.status = status;

      const [orders, total] = await Promise.all([
        Order.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('userId', 'name email')
          .lean(),
        Order.countDocuments(query)
      ]);

      return NextResponse.json({
        success: true,
        data: orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid type parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin data' },
      { status: 500 }
    );
  }
}
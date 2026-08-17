import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { auth } from "../../../../auth";

interface OrderItemInput {
  productId: string;
  quantity: number;
}

interface CreateOrderBody {
  items: OrderItemInput[];
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode?: string;
  };
  paymentMethod?: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);

    const page = Math.max(
      1,
      parseInt(searchParams.get("page") || "1", 10)
    );

    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "10", 10))
    );

    const status = searchParams.get("status");
    const userId = searchParams.get("userId");

    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    const user = session.user as {
      id?: string;
      role?: string;
    };

    // Normal users can only see their own orders
    if (user.role !== "admin") {
      if (!user.id) {
        return NextResponse.json(
          {
            success: false,
            error: "User ID not found",
          },
          { status: 401 }
        );
      }

      query.userId = user.id;
    } else if (userId) {
      // Admin can filter by a specific user
      query.userId = userId;
    }

    if (status) {
      query.status = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email")
        .populate("items.productId", "name images")
        .lean(),

      Order.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const user = session.user as {
      id?: string;
      role?: string;
    };

    if (!user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID not found",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const body: CreateOrderBody = await request.json();

    const { items, shippingAddress, paymentMethod } = body;

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Order must contain at least one item",
        },
        { status: 400 }
      );
    }

    // Validate shipping address
    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.state
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Complete shipping address is required",
        },
        { status: 400 }
      );
    }

    let total = 0;

    const orderItems = [];

    // First validate all products and inventory
    for (const item of items) {
      if (!item.productId || !Number.isInteger(item.quantity)) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid order item",
          },
          { status: 400 }
        );
      }

      if (item.quantity <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Quantity must be greater than zero",
          },
          { status: 400 }
        );
      }

      const product = await Product.findById(item.productId);

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            error: `Product ${item.productId} not found`,
          },
          { status: 400 }
        );
      }

      if (product.inventory < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient inventory for ${product.name}`,
          },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;

      total += itemTotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.primaryImage,
      });
    }

    // Create the order
    const order = await Order.create({
      userId: user.id,
      items: orderItems,
      total,
      shippingAddress,
      paymentMethod,
      status: "pending",
    });

    // Update inventory after order creation
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: {
          inventory: -item.quantity,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create order",
      },
      { status: 500 }
    );
  }
}
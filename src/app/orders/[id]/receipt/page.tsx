import { notFound } from 'next/navigation';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import getServerSession from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

interface OrderData {
  _id: string;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  items: Array<{
    _id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  trackingNumber?: string;
  paymentMethod: string;
  paymentId?: string;
}

export const metadata = {
  title: 'Order Receipt - FurniStore',
};

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    notFound();
  }

  await connectDB();
  const { id } = await params;

  const order = await Order.findById(id)
    .populate('userId', 'name email')
    .lean<OrderData>();

  if (!order) {
    notFound();
  }

  // Check if user owns this order or is admin
  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;
  const orderUserId = order.userId?._id?.toString() || order.userId?.toString();

  if (userRole !== 'admin' && orderUserId !== userId) {
    notFound();
  }

  const shipping = order.total >= 500 ? 0 : 15;
  const tax = order.total * 0.08;
  const grandTotal = order.total + shipping + tax;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Receipt - Order #{id.slice(-8).toUpperCase()}</title>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.onload = function() {
                window.print();
              }
            `,
          }}
        />
        <style jsx>{`
          @page {
            margin: 0;
            size: auto;
          }
          @media print {
            .no-print { display: none !important; }
            body { margin: 0; padding: 0; }
            .receipt-container { box-shadow: none; border: none; }
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            margin: 0;
            padding: 20px;
            color: #1a1a1a;
          }
          .receipt-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            padding: 32px;
            text-align: center;
          }
          .logo {
            width: 60px;
            height: 60px;
            background: white;
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
          }
          .logo svg { width: 32px; height: 32px; color: #4f46e5; }
          .company-name { font-size: 28px; font-weight: 700; margin: 0; }
          .tagline { font-size: 14px; opacity: 0.9; margin: 8px 0 0; }
          .receipt-title { 
            font-size: 18px; 
            font-weight: 600; 
            margin-top: 16px; 
            text-transform: uppercase; 
            letter-spacing: 2px;
            background: rgba(255,255,255,0.2);
            display: inline-block;
            padding: 8px 24px;
            border-radius: 20px;
          }
          .content { padding: 32px; }
          .section { margin-bottom: 32px; }
          .section-title {
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #6b7280;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
          }
          .info-block h4 {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #6b7280;
            margin: 0 0 8px;
          }
          .info-block p { margin: 4px 0; font-size: 14px; line-height: 1.6; }
          .info-block .label { color: #9ca3af; font-size: 12px; }
          .items-table { width: 100%; border-collapse: collapse; }
          .items-table th {
            text-align: left;
            padding: 12px 16px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #6b7280;
            background: #f9fafb;
            border-bottom: 2px solid #e5e7eb;
          }
          .items-table td { padding: 16px; border-bottom: 1px solid #f3f4f6; }
          .items-table tr:last-child td { border-bottom: none; }
          .item-name { font-weight: 500; font-size: 14px; }
          .item-qty { color: #6b7280; font-size: 13px; }
          .item-price { text-align: right; font-weight: 500; font-size: 14px; }
          .item-total { text-align: right; font-weight: 600; font-size: 14px; }
          .totals { width: 100%; max-width: 400px; margin-left: auto; }
          .totals tr td { padding: 8px 16px; font-size: 14px; }
          .totals .label { color: #6b7280; }
          .totals .value { text-align: right; font-weight: 500; }
          .totals .grand-total td {
            font-size: 18px;
            font-weight: 700;
            color: #1a1a1a;
            border-top: 2px solid #e5e7eb;
            padding-top: 16px;
          }
          .status-badge {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: capitalize;
          }
          .status-delivered { background: #d1fae5; color: #065f46; }
          .status-shipped { background: #e0e7ff; color: #3730a3; }
          .status-processing { background: #dbeafe; color: #1e40af; }
          .status-pending { background: #fef3c7; color: #92400e; }
          .status-cancelled { background: #fee2e2; color: #991b1b; }
          .status-refunded { background: #ffe4d6; color: #9a3412; }
          .footer {
            background: #f9fafb;
            padding: 24px 32px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .footer p { margin: 4px 0; font-size: 13px; color: #6b7280; }
          .footer .contact { margin-top: 16px; }
          .footer .contact a { color: #4f46e5; text-decoration: none; }
          .print-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: #4f46e5;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
            z-index: 1000;
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .print-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4); }
          .print-btn:active { transform: translateY(0); }
          .watermark {
            position: fixed;
            bottom: 50%;
            right: 10%;
            transform: rotate(-30deg);
            font-size: 120px;
            color: rgba(79, 70, 229, 0.03);
            font-weight: 700;
            pointer-events: none;
            user-select: none;
          }
        `}
        </style>
      </head>
      <body>
        <button className="no-print print-btn" onClick={() => window.print()}>
          Print / Save as PDF
        </button>
        <div className="watermark">FurniStore</div>
        
        <div className="receipt-container">
          <header className="header">
            <div className="logo">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h1 className="company-name">FurniStore</h1>
            <p className="tagline">Premium Furniture for Modern Living</p>
            <div className="receipt-title">Official Receipt</div>
          </header>

          <main className="content">
            {/* Order Info & Status */}
            <div className="section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 8px' }}>Order #{id.slice(-8).toUpperCase()}</h2>
                  <p style={{ margin: 0, color: '#6b7280' }}>Placed on {formatDate(order.createdAt)}</p>
                </div>
                <span className={`status-badge status-${order.status}`}>{order.status}</span>
              </div>
            </div>

            {/* Shipping & Billing Info */}
            <div className="section">
              <div className="section-title">Shipping & Contact Information</div>
              <div className="info-grid">
                <div className="info-block">
                  <h4>Ship To</h4>
                  <p><strong>{order.shippingAddress.name}</strong></p>
                  <p>{order.shippingAddress.address}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                  <p>{order.shippingAddress.country}</p>
                  <p><span className="label">Phone:</span> {order.shippingAddress.phone}</p>
                </div>
                <div className="info-block">
                  <h4>Billing Email</h4>
                  <p><strong>{(order.userId as any)?.email || session.user?.email}</strong></p>
                  <p><span className="label">Payment Method:</span> {order.paymentMethod}</p>
                  {order.paymentId && <p><span className="label">Transaction ID:</span> {order.paymentId}</p>}
                  {order.trackingNumber && <p><span className="label">Tracking:</span> {order.trackingNumber}</p>}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="section">
              <div className="section-title">Order Items</div>
              <table className="items-table">
                <thead>
                  <tr>
                    <th style={{ width: '50%' }}>Item</th>
                    <th style={{ width: '15%', textAlign: 'center' }}>Qty</th>
                    <th style={{ width: '17.5%', textAlign: 'right' }}>Price</th>
                    <th style={{ width: '17.5%', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="item-name">{item.name}</div>
                        <div className="item-qty">SKU: {item._id}</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                      <td className="item-price">{formatPrice(item.price)}</td>
                      <td className="item-total">{formatPrice(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Order Totals */}
            <div className="section">
              <table className="totals">
                <tbody>
                  <tr>
                    <td className="label">Subtotal ({order.items.reduce((sum, i) => sum + i.quantity, 0)} items)</td>
                    <td className="value">{formatPrice(order.total)}</td>
                  </tr>
                  <tr>
                    <td className="label">Shipping</td>
                    <td className="value">{shipping === 0 ? 'Free' : formatPrice(shipping)}</td>
                  </tr>
                  <tr>
                    <td className="label">Tax (8%)</td>
                    <td className="value">{formatPrice(tax)}</td>
                  </tr>
                  <tr className="grand-total">
                    <td className="label">Total</td>
                    <td className="value">{formatPrice(grandTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payment Confirmation */}
            <div className="section" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '600', color: '#166534' }}>Payment Confirmed</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#166534' }}>Your payment has been successfully processed. Thank you for your order!</p>
                </div>
              </div>
            </div>
          </main>

          <footer className="footer">
            <p style={{ fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Thank you for shopping with FurniStore!</p>
            <p>123 Furniture Ave, Design District, NY 10001</p>
            <p>support@furnistore.com | +1 (555) 123-4567</p>
            <div className="contact">
              <a href="/contact">Contact Us</a> • <a href="/returns">Returns & Exchanges</a> • <a href="/privacy">Privacy Policy</a>
            </div>
            <p style={{ marginTop: '16px', fontSize: '11px', color: '#9ca3af' }}>
              This receipt is for your records. Please keep it for warranty and return purposes.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
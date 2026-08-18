import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase admin credentials');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Helper functions for admin operations
export async function getUserByEmail(email: string) {
  const { data, error } = await supabaseAdmin.auth.admin.getUserByEmail(email);
  return { data, error };
}

export async function createUser(email: string, password: string, userData: any) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: userData,
  });
  return { data, error };
}

export async function updateUser(userId: string, updates: any) {
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, updates);
  return { data, error };
}

export async function deleteUser(userId: string) {
  const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  return { data, error };
}

export async function listUsers(page = 1, perPage = 50) {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    page,
    perPage,
  });
  return { data, error };
}

// Database admin operations
export const dbAdmin = {
  // Users table
  async getUsers(page = 1, limit = 20, search = '', role = '') {
    let query = supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (role) {
      query = query.eq('role', role);
    }

    return query;
  },

  async getUserById(id: string) {
    return supabaseAdmin.from('users').select('*').eq('id', id).single();
  },

  async updateUser(id: string, updates: any) {
    return supabaseAdmin.from('users').update(updates).eq('id', id).select().single();
  },

  async deleteUser(id: string) {
    return supabaseAdmin.from('users').delete().eq('id', id);
  },

  // Products table
  async getProducts(options: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    inStock?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      isActive = true,
      isFeatured,
      inStock,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = options;

    let query = supabaseAdmin
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_active', isActive)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range((page - 1) * limit, page * limit - 1);

    if (category) query = query.eq('category', category);
    if (isFeatured) query = query.eq('is_featured', true);
    if (inStock) query = query.gt('inventory', 0);
    if (search) query = query.textSearch('name,description', search);

    return query;
  },

  async getProductById(id: string) {
    return supabaseAdmin.from('products').select('*').eq('id', id).single();
  },

  async createProduct(product: any) {
    return supabaseAdmin.from('products').insert(product).select().single();
  },

  async updateProduct(id: string, updates: any) {
    return supabaseAdmin.from('products').update(updates).eq('id', id).select().single();
  },

  async deleteProduct(id: string) {
    return supabaseAdmin.from('products').delete().eq('id', id);
  },

  // Orders table
  async getOrders(options: {
    page?: number;
    limit?: number;
    userId?: string;
    status?: string;
  } = {}) {
    const { page = 1, limit = 20, userId, status } = options;

    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        user:users(name, email),
        items:order_items(*, product:products(name, images))
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (userId) query = query.eq('user_id', userId);
    if (status) query = query.eq('status', status);

    return query;
  },

  async getOrderById(id: string) {
    return supabaseAdmin
      .from('orders')
      .select(`
        *,
        user:users(name, email, address),
        items:order_items(*, product:products(name, images, inventory))
      `)
      .eq('id', id)
      .single();
  },

  async updateOrder(id: string, updates: any) {
    return supabaseAdmin.from('orders').update(updates).eq('id', id).select().single();
  },

  // Analytics
  async getDashboardStats() {
    const [
      { count: totalUsers },
      { count: totalProducts },
      { count: totalOrders },
      { data: revenueData },
      { data: ordersByStatus },
      { data: recentOrders },
      { data: lowStockProducts },
      { data: topProducts },
      { data: revenueByMonth },
    ] = await Promise.all([
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
      supabaseAdmin
        .from('orders')
        .select('total')
        .neq('status', 'cancelled'),
      supabaseAdmin
        .from('orders')
        .select('status')
        .then(({ data }) => {
          const counts: Record<string, number> = {};
          data?.forEach((o: any) => {
            counts[o.status] = (counts[o.status] || 0) + 1;
          });
          return { data: counts };
        }),
      supabaseAdmin
        .from('orders')
        .select(`
          *,
          user:users(name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(10),
      supabaseAdmin
        .from('products')
        .select('id, name, inventory')
        .lte('inventory', 10)
        .gt('inventory', 0)
        .eq('is_active', true)
        .order('inventory', { ascending: true })
        .limit(10),
      supabaseAdmin
        .from('order_items')
        .select(`
          quantity,
          price,
          product:products(id, name)
        `)
        .then(async ({ data }) => {
          const productMap = new Map();
          data?.forEach((item: any) => {
            const key = item.product.id;
            if (!productMap.has(key)) {
              productMap.set(key, { id: key, name: item.product.name, sales: 0, revenue: 0 });
            }
            const p = productMap.get(key);
            p.sales += item.quantity;
            p.revenue += item.quantity * item.price;
          });
          return Array.from(productMap.values())
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 10);
        }),
      supabaseAdmin
        .rpc('get_revenue_by_month')
        .then(({ data }) => data || []),
    ]);

    return {
      totalUsers: totalUsers || 0,
      totalProducts: totalProducts || 0,
      totalOrders: totalOrders || 0,
      totalRevenue: revenueData?.reduce((sum: number, o: any) => sum + (o.total || 0), 0) || 0,
      ordersByStatus: ordersByStatus || {},
      recentOrders: recentOrders || [],
      lowStockProducts: lowStockProducts || [],
      topProducts: topProducts || [],
      revenueByMonth: revenueByMonth || [],
    };
  },
};

export default supabaseAdmin;
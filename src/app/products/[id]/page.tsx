'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Star, Truck, Shield, RotateCcw, Heart, ShoppingBag, Minus, Plus, Share2, ChevronLeft, ChevronRight, MapPin, Clock, Box, Tag } from 'lucide-react';
import { ProductImageCarousel } from '@/components/ui/ProductImageCarousel';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/cartStore';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subCategory?: string;
  images: Array<{ url: string; alt: string; isPrimary?: boolean }>;
  inventory: number;
  ratings: number;
  reviewCount: number;
  features: string[];
  dimensions?: { length: number; width: number; height: number; unit: string };
  material?: string;
  color?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { addItem } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${productId}`);
      const json = await res.json();
      if (json.success) {
        setProduct(json.data);
      } else {
        router.push('/shop');
      }
    } catch {
      router.push('/shop');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images[0]?.url || '',
      inventory: product.inventory,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
            <div className="space-y-6">
              <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
              <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-12 bg-gray-200 rounded w-1/3 animate-pulse" />
              <div className="h-48 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Product not found</p>
          <Link href="/shop" className="mt-4 text-primary-600 hover:underline">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const getStockStatus = () => {
    if (product.inventory === 0) return { label: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-100' };
    if (product.inventory <= 10) return { label: `Only ${product.inventory} left in stock`, color: 'text-orange-600', bg: 'bg-orange-100' };
    return { label: 'In Stock', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <nav className="bg-gray-50 border-b border-gray-100" aria-label="Breadcrumb">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ol className="flex items-center gap-2 text-sm">
            <li><Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link></li>
            <li><ChevronRight className="w-4 h-4 text-gray-400" /></li>
            <li><Link href="/shop" className="text-gray-500 hover:text-gray-700">Shop</Link></li>
            <li><ChevronRight className="w-4 h-4 text-gray-400" /></li>
            <li><Link href={`/shop?category=${product.category}`} className="text-gray-500 hover:text-gray-700 capitalize">{product.category.replace('-', ' ')}</Link></li>
            <li><ChevronRight className="w-4 h-4 text-gray-400" /></li>
            <li className="text-gray-900 truncate max-w-[200px]">{product.name}</li>
          </ol>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Product Images */}
          <div className="space-y-4">
            <ProductImageCarousel
              images={product.images}
              showThumbnails={true}
              className="rounded-2xl overflow-hidden"
            />

            {/* Trust Badges */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: Truck, title: 'Free Shipping', desc: 'Over $500' },
                { icon: Shield, title: 'Secure Payment', desc: '100% Safe' },
                { icon: RotateCcw, title: 'Easy Returns', desc: '30 Days' },
                { icon: MapPin, title: 'Track Order', desc: 'Real-time' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <span className="text-sm font-medium text-primary-600 uppercase tracking-wide">
                {product.category.replace('-', ' ')}
                {product.subCategory && ` / ${product.subCategory}`}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-semibold text-gray-900">{product.ratings.toFixed(1)}</span>
                  <span className="text-gray-500">({product.reviewCount} reviews)</span>
                </div>
                <span className="w-1 h-6 bg-gray-200" />
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                  {stockStatus.label}
                </span>
              </div>

              <div className="text-3xl font-bold text-gray-900 mb-6">{formatPrice(product.price)}</div>

              <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

              {/* Features */}
              {product.features.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Key Features
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Dimensions */}
              {product.dimensions && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Box className="w-5 h-5" />
                    Dimensions
                  </h4>
                  <p className="text-gray-600">
                    {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} {product.dimensions.unit}
                    (L × W × H)
                  </p>
                </div>
              )}

              {/* Material & Color */}
              {(product.material || product.color) && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-medium text-gray-900 mb-3">Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {product.material && (
                      <div>
                        <p className="text-gray-500">Material</p>
                        <p className="font-medium text-gray-900">{product.material}</p>
                      </div>
                    )}
                    {product.color && (
                      <div>
                        <p className="text-gray-500">Color</p>
                        <p className="font-medium text-gray-900">{product.color}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-4 py-3 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(parseInt(e.target.value) || 1, product.inventory)))}
                    min={1}
                    max={product.inventory}
                    className="w-16 text-center border-x border-gray-300 focus:outline-none"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                    disabled={quantity >= product.inventory}
                    className="px-4 py-3 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.inventory === 0}
                    className="flex-1 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={product.inventory === 0}
                    className="px-6 py-4 bg-white text-gray-700 font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Tag className="w-5 h-5" />
                    Buy Now
                  </button>
                </div>
              </div>

              {/* Wishlist & Share */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => toggleItem({ productId: product._id, name: product.name, price: product.price, image: product.images[0]?.url || '' })}
                  className={`p-3 rounded-xl border transition-colors ${isInWishlist(product._id) ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                >
                  <Heart className={`w-5 h-5 ${isInWishlist(product._id) ? 'fill-current' : ''}`} />
                </button>
                <button className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-16">
          <div className="border-b border-gray-200 mb-8">
            <nav className="flex gap-8" aria-label="Product tabs">
              {[
                { id: 'description', label: 'Description', icon: Tag },
                { id: 'specs', label: 'Specifications', icon: Box },
                { id: 'reviews', label: `Reviews (${product.reviewCount})`, icon: Star },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'description' && (
              <motion.div key="description" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{product.description}</p>
                </div>
              </motion.div>
            )}
            {activeTab === 'specs' && (
              <motion.div key="specs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <dt className="text-gray-500 text-sm">Category</dt>
                    <dd className="font-medium text-gray-900 capitalize">{product.category.replace('-', ' ')}</dd>
                  </div>
                  {product.subCategory && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <dt className="text-gray-500 text-sm">Sub-Category</dt>
                      <dd className="font-medium text-gray-900">{product.subCategory}</dd>
                    </div>
                  )}
                  {product.material && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <dt className="text-gray-500 text-sm">Material</dt>
                      <dd className="font-medium text-gray-900">{product.material}</dd>
                    </div>
                  )}
                  {product.color && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <dt className="text-gray-500 text-sm">Color</dt>
                      <dd className="font-medium text-gray-900">{product.color}</dd>
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <dt className="text-gray-500 text-sm">Dimensions</dt>
                      <dd className="font-medium text-gray-900">
                        {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} {product.dimensions.unit}
                      </dd>
                    </div>
                  )}
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <dt className="text-gray-500 text-sm">Weight</dt>
                    <dd className="font-medium text-gray-900">~{Math.round((product.dimensions?.length || 100) * (product.dimensions?.width || 50) * (product.dimensions?.height || 40) * 0.0005)} kg</dd>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <dt className="text-gray-500 text-sm">Assembly Required</dt>
                    <dd className="font-medium text-gray-900">Yes (Tools included)</dd>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <dt className="text-gray-500 text-sm">Warranty</dt>
                    <dd className="font-medium text-gray-900">2 Years Manufacturer Warranty</dd>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <dt className="text-gray-500 text-sm">Origin</dt>
                    <dd className="font-medium text-gray-900">Designed in USA, Crafted Globally</dd>
                  </div>
                </dl>
              </motion.div>
            )}
            {activeTab === 'reviews' && (
              <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
                    <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">Write a Review</button>
                  </div>
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Star className="w-12 h-12 text-yellow-400 fill-current mx-auto mb-4" />
                    <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                    <button className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Write a Review</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Link key={i} href="/shop" className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <img src={`https://picsum.photos/seed/furniture${i}/400/400.jpg`} alt="Related product" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">Related Product {i}</h4>
                  <p className="text-lg font-bold text-primary-600 mt-1">${(Math.random() * 500 + 100).toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
import AddToCartButton from '@/components/cart/AddToCartButton';
import CartLayout from '@/components/cart/CartLayout';
import { prisma } from '@/lib/database';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Cart Demo - ONSI',
  description: 'Demo of the complete cart system'
};

export default async function CartDemoPage() {
  // Get some products for demo
  const products = await prisma.product.findMany({
    take: 6,
    orderBy: { createdAt: 'desc' }
  });

  // Demo user ID (in real app, get from auth)
  const demoUserId = 'demo-user-123';

  return (
    <CartLayout userId={demoUserId}>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Cart System Demo</h1>
          <Link 
            href="/cart"
            className="bg-purple text-white px-4 py-2 rounded hover:bg-purple/80"
          >
            View Cart
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const productData = product as any;
            const imageUrl = productData.image || 
              (product.images ? JSON.parse(product.images)[0] : null) ||
              '/images/placeholder.jpg';

            return (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={productData.name || product.title}
                  width={300}
                  height={300}
                  className="w-full h-48 object-cover"
                />
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">
                    {productData.name || product.title}
                  </h3>
                  
                  {product.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xl font-bold text-purple">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {productData.stock || 0}
                    </span>
                  </div>
                  
                  <AddToCartButton
                    productId={product.id}
                    disabled={!productData.stock || productData.stock === 0}
                    className="w-full bg-purple text-white py-2 px-4 rounded hover:bg-purple/80 disabled:bg-gray-300"
                  >
                    {productData.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </AddToCartButton>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Available API Endpoints:</h2>
          <ul className="space-y-2 text-sm">
            <li><code className="bg-gray-100 px-2 py-1 rounded">POST /api/cart</code> - Create cart</li>
            <li><code className="bg-gray-100 px-2 py-1 rounded">POST /api/cart/add</code> - Add item to cart</li>
            <li><code className="bg-gray-100 px-2 py-1 rounded">PUT /api/cart/update</code> - Update item quantity</li>
            <li><code className="bg-gray-100 px-2 py-1 rounded">DELETE /api/cart/remove/[itemId]</code> - Remove item</li>
            <li><code className="bg-gray-100 px-2 py-1 rounded">GET /api/cart/[userId]</code> - Get cart</li>
            <li><code className="bg-gray-100 px-2 py-1 rounded">POST /api/cart/checkout</code> - Checkout</li>
          </ul>
        </div>
      </div>
    </CartLayout>
  );
}

'use client';

import { useMediaQuery } from 'react-responsive';

// components
import ProductCard from '@/components/product/ProductCard';

// types
import { Product } from '@/lib/types';

const ProductList = ({ products }: { products: Product[] }) => {
  const isLg = useMediaQuery({ query: '(min-width: 1024px)' });
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
      {products.map((product, i) => (
        <ProductCard key={i} product={product} delay={(i % (isLg ? 4 : 2)) * 0.1} duration={0.6} />
      ))}
    </div>
  );
};

export default ProductList;

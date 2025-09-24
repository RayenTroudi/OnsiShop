// next
import type { Metadata } from 'next';
// import Link from 'next/link';
import { notFound } from 'next/navigation';

// react
import { Suspense } from 'react';

// shopify
import { HIDDEN_PRODUCT_TAG } from '@/lib/constants';
import { getProduct } from '@/lib/mock-shopify';

// components
// import { ProductDescription } from '@/components/product/product-description';
import ProductDescription from '@/components/product/ProductDescription';
import ProductRating from '@/components/product/ProductRating';
import ProductSlider from '@/components/product/ProductSlider';

// Dynamic imports to reduce bundle size
import dynamic from 'next/dynamic';

const ProductReviews = dynamic(() => import('@/components/product/ProductReviews'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>
});

const RecommendedItems = dynamic(() => import('@/components/product/RecommendedItems'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
});

const RelatedProducts = dynamic(() => import('@/components/product/RelatedProducts'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
});

// Remove edge runtime to use Node.js runtime instead
// export const runtime = 'edge';

export async function generateMetadata({
  params
}: {
  params: { handle: string };
}): Promise<Metadata> {
  const product = await getProduct(params.handle);

  if (!product) return notFound();

  const { url, width, height, altText: alt } = product.featuredImage || {};
  const indexable = !product.tags.includes(HIDDEN_PRODUCT_TAG);

  return {
    title: product.seo?.title || product.title,
    description: product.seo?.description || product.description,
    robots: {
      index: indexable,
      follow: indexable,
      googleBot: {
        index: indexable,
        follow: indexable
      }
    },
    openGraph: url
      ? {
          images: [
            {
              url,
              width,
              height,
              alt
            }
          ]
        }
      : null
  };
}

const ProductPage = async ({ params }: { params: { handle: string } }) => {
  const product = await getProduct(params.handle);

  if (!product) return notFound();

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.featuredImage?.url,
    offers: {
      '@type': 'AggregateOffer',
      availability: product.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      priceCurrency: product.priceRange?.minVariantPrice?.currencyCode || 'DT',
      highPrice: product.priceRange?.maxVariantPrice?.amount || '0',
      lowPrice: product.priceRange?.minVariantPrice?.amount || '0'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd)
        }}
      />
      <div className="min-h-screen bg-white">
        {/* Main Product Section */}
        <section className="flex w-full flex-col items-center justify-center py-[24px] md:py-[48px]">
          <h2 className="sr-only">Product Information</h2>
          <article className="flex w-full max-w-[95%] flex-col items-stretch justify-center gap-4 md:w-[1200px] md:flex-row">
            <div className="max-w-[450px] md:w-1/2">
              <ProductSlider product={product} />
            </div>
            <div className="md:w-1/2">
              <ProductDescription product={product} />
              {/* Product Rating Overview */}
              <Suspense fallback={<div className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>}>
                <ProductRating productId={product.id} />
              </Suspense>
            </div>
          </article>
        </section>

        {/* Product Reviews Section */}
        <section className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductReviews productId={product.id} />
          </div>
        </section>

        {/* Related Products Section */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <RelatedProducts 
              currentProductId={product.id} 
              productTags={product.tags} 
            />
          </div>
        </section>

        {/* Recommended Items */}
        <section className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <RecommendedItems productId={product.id} />
          </div>
        </section>
      </div>
    </>
  );
};

export default ProductPage;

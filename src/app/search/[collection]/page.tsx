import { DatabaseService } from '@/lib/database';
import { Metadata } from 'next';

import Grid from '@/components/grid';
import ProductGridItems from '@/components/layout/product-grid-items';
import { defaultSort, sorting } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params
}: {
  params: { collection: string };
}): Promise<Metadata> {
  try {
    const db = new DatabaseService();
    const category = await db.getCategoryByHandle(params.collection);

    if (!category) {
      // Return metadata for non-existent category instead of notFound
      return {
        title: `Category "${params.collection}" - Not Found`,
        description: `The category "${params.collection}" was not found.`
      };
    }

    return {
      title: (category as any).name || category.id,
      description: (category as any).description || `${(category as any).name || category.id} products`
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be loaded.'
    };
  }
}

export default async function CategoryPage({
  params,
  searchParams
}: {
  params: { collection: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const { sort } = searchParams as { [key: string]: string };
  const { sortKey, reverse } = sorting.find((item) => item.slug === sort) || defaultSort;
  
  try {
    const db = new DatabaseService();
    
    // Get category details
    const category = await db.getCategoryByHandle(params.collection);
    
    if (!category) {
      // Show a user-friendly message for non-existent categories
      return (
        <section className="py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Category Not Found</h1>
            <p className="text-gray-600 mb-6">
              The category "{params.collection}" does not exist or has been removed.
            </p>
            <a 
              href="/products" 
              className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Browse All Products
            </a>
          </div>
        </section>
      );
    }
    
    // Get products for this category
    const dbProducts = await db.getProductsByCategory(params.collection);
    
    // Transform to Shopify format for compatibility with existing components
    let products = dbProducts.map((product: any) => db.transformToShopifyProduct(product));
    
    // Apply sorting
    if (sortKey === 'PRICE') {
      products = products.sort((a: any, b: any) => {
        const priceA = parseFloat(a.priceRange?.minVariantPrice?.amount || '0');
        const priceB = parseFloat(b.priceRange?.minVariantPrice?.amount || '0');
        return reverse ? priceB - priceA : priceA - priceB;
      });
    } else if (sortKey === 'CREATED_AT') {
      products = products.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return reverse ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
      });
    } else if (sortKey === 'BEST_SELLING') {
      // For best selling, we could sort by some popularity metric
      // For now, just maintain current order or sort by title
      products = products.sort((a: any, b: any) => {
        return reverse ? b.title.localeCompare(a.title) : a.title.localeCompare(b.title);
      });
    }
    // For 'RELEVANCE' or default, maintain the order from database

    return (
      <section>
        {products.length === 0 ? (
          <div className="py-12 text-center">
            <h2 className="font-lora text-3xl font-bold capitalize text-darkPurple mb-4">
              {(category as any).name || category.id}
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              No products found in this category yet.
            </p>
            <a 
              href="/products" 
              className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Browse All Products
            </a>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-[48px]">
            <h2 className="font-lora text-3xl font-bold capitalize text-darkPurple">
              {(category as any).name || category.id}
            </h2>
            <Grid className="grid-cols-1 items-start justify-center sm:grid-cols-2 lg:grid-cols-3">
              <ProductGridItems products={products} />
            </Grid>
          </div>
        )}
      </section>
    );
  } catch (error) {
    console.error('Error in CategoryPage:', error);
    // Return a user-friendly error page instead of notFound()
    return (
      <section className="py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-6">
            We encountered an error while loading this category. Please try again later.
          </p>
          <a 
            href="/products" 
            className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Browse All Products
          </a>
        </div>
      </section>
    );
  }
}

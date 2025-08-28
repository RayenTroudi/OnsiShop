import { DatabaseService } from '@/lib/database';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

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

    if (!category) return notFound();

    return {
      title: category.name,
      description: category.description || `${category.name} products`
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return notFound();
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
      return notFound();
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
          <p className="py-3 text-lg">{`No products found in this collection`}</p>
        ) : (
          <div className="flex flex-col items-center justify-center gap-[48px]">
            <h2 className="font-lora text-3xl font-bold capitalize text-darkPurple">
              {category.name}
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
    return notFound();
  }
}

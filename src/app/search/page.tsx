'use client';

import Grid from '@/components/grid';
import ProductGridItems from '@/components/layout/product-grid-items';
import FilterList from '@/components/layout/search/filter';
import { useTranslation } from '@/contexts/TranslationContext';
import { defaultSort, sorting } from '@/lib/constants';
import { getProducts } from '@/lib/mock-shopify';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SearchPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const sort = searchParams.get('sort') || '';
  const searchValue = searchParams.get('q') || '';
  
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { sortKey, reverse } = sorting.find((item) => item.slug === sort) || defaultSort;
        const fetchedProducts = await getProducts({ sortKey, reverse, query: searchValue });
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [sort, searchValue]);

  if (loading) {
    return <div className="text-center py-8">{t('common_loading')}</div>;
  }

  const resultsText = products.length > 1 ? t('search_results') : t('search_result');

  return (
    <>
      {searchValue ? (
        <p>
          {products.length === 0
            ? `${t('search_no_products_match')} `
            : `${t('search_showing')} ${products.length} ${resultsText} ${t('search_for')} `}
          <span className="font-bold">&quot;{searchValue}&quot;</span>
        </p>
      ) : null}

      <div className="flex-none">
        <FilterList list={sorting} title={t('search_sort_by')} />
      </div>

      {products.length > 0 ? (
        <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <ProductGridItems products={products} />
        </Grid>
      ) : null}
    </>
  );
}

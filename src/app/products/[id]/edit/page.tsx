import ProductForm from '@/components/product/ProductForm';
import { prisma } from '@/lib/database';
import { notFound } from 'next/navigation';

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = params;

  // Fetch the product data
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });

  if (!product) {
    notFound();
  }

  // Transform the data for the form
  const initialData = {
    name: product.name,
    description: product.description || '',
    price: product.price,
    imageUrl: product.image || '',
    categoryId: product.categoryId || '',
    stockQuantity: product.stock,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <ProductForm 
        mode="edit" 
        productId={id}
        initialData={initialData}
      />
    </div>
  );
}

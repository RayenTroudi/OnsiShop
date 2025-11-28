import ProductForm from '@/components/product/ProductForm';
import { verifyAuth } from '@/lib/appwrite/auth';
import { dbService } from '@/lib/appwrite/database';
import { notFound, redirect } from 'next/navigation';

interface EditProductPageProps {
  params: {
    id: string;
  };
}

// Check if current user is admin
async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const user = await verifyAuth();
    return user?.role === 'admin';
  } catch (error) {
    return false;
  }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = params;
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    redirect('/products');
  }

  // Fetch the product data
  const product = await dbService.getProductById(params.id);

  if (!product) {
    notFound();
  }

  // Transform the data for the form
  const initialData = {
    name: (product as any).name,
    description: (product as any).description || '',
    price: (product as any).price,
    imageUrl: (product as any).image || '',
    categoryId: (product as any).categoryId || '',
    stockQuantity: (product as any).stock,
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

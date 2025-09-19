import ProductForm from '@/components/product/ProductForm';
import { dbService } from '@/lib/database';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

interface EditProductPageProps {
  params: {
    id: string;
  };
}

// Check if current user is admin
async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return false;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await dbService.getUserById(decoded.userId );

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

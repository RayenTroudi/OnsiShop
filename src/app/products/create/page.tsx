import ProductForm from '@/components/product/ProductForm';
import { verifyAuth } from '@/lib/appwrite/auth';
import { redirect } from 'next/navigation';

// Check if current user is admin
async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const user = await verifyAuth();
    return user?.role === 'admin';
  } catch (error) {
    return false;
  }
}

export default async function CreateProductPage() {
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    redirect('/products');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <ProductForm mode="create" />
    </div>
  );
}

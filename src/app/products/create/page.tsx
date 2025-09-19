import ProductForm from '@/components/product/ProductForm';
import { prisma } from '@/lib/database';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Check if current user is admin
async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return false;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

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

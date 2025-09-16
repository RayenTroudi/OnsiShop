import ProductForm from '@/components/product/ProductForm';
import { prisma } from '@/lib/database';
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
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

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

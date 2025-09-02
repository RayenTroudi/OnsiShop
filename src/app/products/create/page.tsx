import ProductForm from '@/components/product/ProductForm';

export default function CreateProductPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <ProductForm mode="create" />
    </div>
  );
}

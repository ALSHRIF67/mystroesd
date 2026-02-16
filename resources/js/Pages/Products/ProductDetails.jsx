import { Head, Link, usePage } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function ProductDetails() {
    const { product, auth } = usePage().props;

    if (!product) {
        return <GuestLayout><div className="p-6">Product not found.</div></GuestLayout>;
    }

    return (
        <GuestLayout>
            <Head title={product.title || product.name} />

            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <img src={product.image_url || product.image || '/images/placeholder.png'} alt={product.title || product.name} className="w-full h-64 object-cover rounded" />
                        </div>
                        <div className="md:col-span-2">
                            <h1 className="text-2xl font-bold">{product.title || product.name}</h1>
                            <p className="text-gray-500 mt-2">{product.category ? product.category.name : ''}</p>
                            <div className="mt-4 text-xl font-semibold text-indigo-600">{product.formatted_price || product.price}</div>

                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-gray-700">الوصف</h3>
                                <p className="mt-2 text-gray-600">{product.description || 'لا يوجد وصف.'}</p>
                            </div>

                            <div className="mt-6 flex items-center gap-3">
                                <Link href={auth.user ? route('products.edit', product.id) : route('login')} className="px-4 py-2 bg-indigo-600 text-white rounded">{auth.user ? 'تعديل' : 'تسجيل دخول'}</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}

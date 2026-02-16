import { Head, Link, usePage, router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Show({ product }) {
    const { auth } = usePage().props;
    const user = auth ? auth.user : null;
    const isOwner = user && user.id === product.user_id;
    const isSeller = user && user.role === 'seller';

    return (
        <GuestLayout>
            <Head title={product.title} />

            <div className="bg-white rounded shadow p-6 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Product Image */}
                    <div className="md:col-span-1">
                        {product.image_url ? (
                            <img
                                src={product.image_url}
                                alt={product.title}
                                className="w-full h-64 object-cover rounded"
                            />
                        ) : (
                            <div className="w-full h-64 bg-gray-200 rounded flex items-center justify-center">
                                <span className="text-gray-500">لا توجد صورة</span>
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="md:col-span-2">
                        <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
                        
                        <p className="text-xl text-red-600 mt-2">
                            {product.formatted_price}
                        </p>
                        
                        <p className="text-sm text-gray-600 mt-1">
                            بواسطة: {product.seller?.name || 'بائع مجهول'}
                        </p>
                        
                        <div className="mt-4 text-gray-800">
                            {product.description ? (
                                <p className="whitespace-pre-line">{product.description}</p>
                            ) : (
                                <p className="text-gray-500">لا يوجد وصف</p>
                            )}
                        </div>

                        {/* Edit/Delete for owner */}
                        {isOwner && isSeller && (
                            <div className="mt-4 flex gap-2">
                                <Link
                                    href={route('products.edit', product.id)}
                                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                                >
                                    تعديل
                                </Link>
                                <button
                                    onClick={() => {
                                        if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
                                            router.delete(route('products.destroy', product.id));
                                        }
                                    }}
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                >
                                    حذف
                                </button>
                            </div>
                        )}

                        {/* Back to home */}
                        <div className="mt-6">
                            <Link
                                href="/"
                                className="inline-block px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                            >
                                ← العودة للمنتجات
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
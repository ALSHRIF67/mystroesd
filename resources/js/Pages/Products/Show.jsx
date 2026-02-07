import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Show({ product }) {
    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">تفاصيل المنتج</h2>}
        >
            <Head title={product.title} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-2xl font-bold">{product.title}</h2>
                                <Link
                                    href={route('products.index')}
                                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                                >
                                    رجوع
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Product Image */}
                                <div>
                                    {product.image ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.title}
                                            className="w-full h-auto rounded-lg shadow-lg"
                                        />
                                    ) : (
                                        <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                            <span className="text-gray-500 dark:text-gray-400">لا توجد صورة</span>
                                        </div>
                                    )}
                                </div>

                                {/* Product Details */}
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">الوصف</h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {product.description || 'لا يوجد وصف'}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">السعر</h3>
                                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                {product.formatted_price} $
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">الفئة</h3>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {product.category?.name || 'غير مصنف'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex space-x-3">
                                            <Link
                                                href={route('products.edit', product.id)}
                                                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                            >
                                                تعديل المنتج
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
                                                        window.location.href = route('products.destroy', product.id);
                                                    }
                                                }}
                                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                            >
                                                حذف المنتج
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
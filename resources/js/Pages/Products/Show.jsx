import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Show({ product }) {
    // افتراض أن هناك صورة واحدة فقط، يمكنك تعديل العدد إذا كان لديك معرض صور
    const imageCount = product.images_count ?? 1;

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">تفاصيل المنتج</h2>}
        >
            <Head title={product.title} />

            <div className="py-8">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            {/* رأس الصفحة مع زر الرجوع */}
                            <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
                                <h2 className="text-2xl font-bold">{product.title}</h2>
                                <Link
                                    href={route('products.index')}
                                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    <i className="fas fa-arrow-right ml-2"></i>
                                    رجوع
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                {/* صورة المنتج - بنفس تصميم صفحة الفهرس */}
                                <div>
                                    <div className="relative overflow-hidden rounded-lg shadow-md">
                                        {product.image ? (
                                            <>
                                                <img
                                                    src={product.image_url}
                                                    alt={product.title}
                                                    className="h-80 w-full object-cover"
                                                />
                                                <span className="absolute left-3 top-3 rounded bg-gray-900/70 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm">
                                                    <i className="fas fa-camera ml-1"></i>
                                                    {imageCount}
                                                </span>
                                            </>
                                        ) : (
                                            <div className="flex h-80 w-full items-center justify-center bg-gray-200 dark:bg-gray-700">
                                                <i className="fas fa-image text-5xl text-gray-400"></i>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* تفاصيل المنتج */}
                                <div className="space-y-5">
                                    {/* الوصف */}
                                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                                        <h3 className="mb-2 flex items-center text-lg font-medium text-gray-700 dark:text-gray-300">
                                            <i className="fas fa-align-right ml-2 text-blue-600"></i>
                                            الوصف
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {product.description || 'لا يوجد وصف'}
                                        </p>
                                    </div>

                                    {/* السعر والفئة */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                                            <h3 className="mb-2 flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                                <i className="fas fa-tag ml-2 text-blue-600"></i>
                                                السعر
                                            </h3>
                                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                {product.formatted_price} ج.س
                                            </p>
                                        </div>

                                        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                                            <h3 className="mb-2 flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                                <i className="fas fa-folder ml-2 text-green-600"></i>
                                                الفئة
                                            </h3>
                                            <p className="text-lg font-medium text-gray-900 dark:text-white">
                                                {product.category?.name || 'غير مصنف'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* معلومات إضافية (اختياري) */}
                                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center">
                                            <i className="fas fa-calendar ml-2 w-5 text-gray-500"></i>
                                            <span>تاريخ الإضافة: {new Date(product.created_at).toLocaleDateString('ar-EG')}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <i className="fas fa-eye ml-2 w-5 text-gray-500"></i>
                                            <span>عدد المشاهدات: {product.views || 0}</span>
                                        </div>
                                    </div>

                                    {/* أزرار الإجراءات */}
                                    <div className="flex space-x-3 space-x-reverse pt-4">
                                        <Link
                                            href={route('products.edit', product.id)}
                                            className="inline-flex flex-1 items-center justify-center rounded-md bg-yellow-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                                        >
                                            <i className="fas fa-edit ml-2"></i>
                                            تعديل المنتج
                                        </Link>
                                        <button
                                            onClick={() => {
                                                if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
                                                    window.location.href = route('products.destroy', product.id);
                                                }
                                            }}
                                            className="inline-flex flex-1 items-center justify-center rounded-md bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                                        >
                                            <i className="fas fa-trash-alt ml-2"></i>
                                            حذف المنتج
                                        </button>
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
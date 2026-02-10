import { Head, Link } from '@inertiajs/react';

export default function Show({ seller = {}, products = [] }) {
    return (
        <>
            <Head title={seller.name ? `${seller.name} — متجر البائع` : 'Seller'} />

            <div className="py-12">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h1 className="text-2xl font-bold">{seller.name || `${seller.first_name || ''} ${seller.last_name || ''}`}</h1>
                                    {seller.email && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{seller.email}</p>
                                    )}
                                </div>
                                <Link
                                    href={route('products.index')}
                                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
                                >
                                    عرض جميع المنتجات
                                </Link>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold mb-4">المنتجات المنشورة ({products.length})</h2>

                                {products.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500">لا توجد منتجات حية لهذا البائع.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                        {products.map((p) => (
                                            <div key={p.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                                                <div className="h-40 mb-3 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex items-center justify-center">
                                                    {p.image_url ? (
                                                        <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="text-gray-400">لا توجد صورة</div>
                                                    )}
                                                </div>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-medium text-gray-900 dark:text-gray-100">{p.title}</h3>
                                                        <div className="text-sm text-gray-500 mt-1">{p.category?.name || 'غير مصنف'}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-semibold text-blue-600 dark:text-blue-400">{p.formatted_price || p.price}</div>
                                                        {p.negotiable && <div className="text-xs text-green-600">قابل للتفاوض</div>}
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex gap-2 justify-end">
                                                    <Link
                                                        href={route('products.show', p.id)}
                                                        className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md text-sm"
                                                    >
                                                        عرض
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ products = [] }) {
    const { flash = {} } = usePage().props;

    const badgeClasses = (status) => {
        switch (status) {
            case 'approved':
                return 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'rejected':
                return 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default:
                return 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
        }
    };

    const handleDelete = (productId) => {
        if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
            router.delete(route('products.destroy', productId));
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">المنتجات</h2>}
        >
            <Head title="المنتجات" />

            <div className="py-4 sm:py-6 lg:py-8">
                <div className="max-w-7xl mx-auto sm:px-3 lg:px-6 xl:px-8">
                    {/* Success Message */}
                    {flash.success && (
                        <div className="mb-4 sm:mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg shadow-sm">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>{flash.success}</span>
                            </div>
                        </div>
                    )}

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-xl">
                        <div className="p-4 sm:p-6 text-gray-900 dark:text-gray-100">
                            {/* Header Section */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
                                        قائمة المنتجات
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        إجمالي المنتجات: {products.length}
                                    </p>
                                </div>
                                <Link
                                    href={route('products.create')}
                                    className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md w-full sm:w-auto"
                                >
                                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    إضافة منتج جديد
                                </Link>
                            </div>

                            {/* Empty State */}
                            {products.length === 0 ? (
                                <div className="text-center py-12 sm:py-16">
                                    <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        لا توجد منتجات حالياً
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                        ابدأ بإضافة منتج جديد ليتسنى للعملاء رؤيته وشرائه
                                    </p>
                                    <Link
                                        href={route('products.create')}
                                        className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
                                    >
                                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                        إضافة أول منتج
                                    </Link>
                                </div>
                            ) : (
                                /* Products Table - Responsive Container */
                                <div className="overflow-hidden">
                                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                                        <div className="inline-block min-w-full align-middle">
                                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                                                        <tr>
                                                            {/* Image Column */}
                                                            <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                <span className="hidden sm:inline">الصورة</span>
                                                                <span className="sm:hidden">📷</span>
                                                            </th>
                                                            
                                                            {/* Title Column */}
                                                            <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                المنتج
                                                            </th>
                                                            
                                                            {/* Category Column - Hide on mobile */}
                                                            <th className="hidden md:table-cell px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                الفئة
                                                            </th>
                                                            
                                                            {/* Price Column */}
                                                            <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                السعر
                                                            </th>
                                                            
                                                            {/* Status Column */}
                                                            <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                الحالة
                                                            </th>

                                                            {/* Actions Column */}
                                                            <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                الإجراءات
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                                        {products.map((product) => (
                                                            <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150">
                                                                {/* Product Image */}
                                                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                                    <div className="flex items-center justify-center">
                                                                        <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 flex-shrink-0">
                                                                            {product.image_url ? (
                                                                                <img
                                                                                    src={product.image_url}
                                                                                    alt={product.title}
                                                                                    className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                                                                                    loading="lazy"
                                                                                    onError={(e) => {
                                                                                        e.target.onerror = null;
                                                                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjBGMEYwIi8+CjxwYXRoIGQ9Ik01MCAzM0M0MC4xOTI5IDMzIDMyIDQxLjE5MjkgMzIgNTBDMzIgNTguODA3MSA0MC4xOTI5IDY3IDUwIDY3QzU5LjgwNzEgNjcgNjggNTguODA3MSA2OCA1MEM2OCA0MS4xOTI5IDU5LjgwNzEgMzMgNTAgMzNaIiBmaWxsPSIjRDNEM0QzIi8+CjxwYXRoIGQ9Ik02Mi44MjQ0IDQwLjM0MjVMNTEuODk5NSA1NS42Njg4TDQzLjU0NTUgNDguMTQwOUwzNyA1NS41NTY5TDUxLjg5OTUgNzRMNjcgNDkuODA4NUw2Mi44MjQ0IDQwLjM0MjVaIiBmaWxsPSIjOTk5OTk5Ii8+Cjwvc3ZnPgo=';
                                                                                    }}
                                                                                />
                                                                            ) : (
                                                                                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700">
                                                                                    <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                                    </svg>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                
                                                                {/* Product Info */}
                                                                <td className="px-4 sm:px-6 py-4">
                                                                    <div className="text-right">
                                                                        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                                                                            {product.title}
                                                                        </div>
                                                                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                                                            {product.description || 'لا يوجد وصف'}
                                                                        </div>
                                                                        {/* Show category on mobile */}
                                                                        <div className="md:hidden mt-2">
                                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                                                                                {product.category?.name || 'غير مصنف'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                
                                                                {/* Category - Hidden on mobile */}
                                                                <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-right">
                                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                                                            {product.category?.name || 'غير مصنف'}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                
                                                                {/* Price */}
                                                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-right">
                                                                        <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                                                                            {product.formatted_price || `${product.price} $`}
                                                                        </span>
                                                                        {product.negotiable && (
                                                                            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                                                                                ✓ قابل للتفاوض
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </td>

                                                                {/* Status */}
                                                                <td className="hidden sm:table-cell px-4 sm:px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-right">
                                                                        <span className={badgeClasses(product.status)}>{product.status_text || product.status}</span>
                                                                    </div>
                                                                </td>
                                                                
                                                                {/* Actions */}
                                                                <td className="px-4 sm:px-6 py-4">
                                                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
                                                                        {/* View Button */}
                                                                        <Link
                                                                            href={route('products.show', product.id)}
                                                                            className="inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors duration-200 shadow-sm"
                                                                        >
                                                                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                            </svg>
                                                                            <span className="hidden sm:inline">عرض</span>
                                                                            <span className="sm:hidden">👁️</span>
                                                                        </Link>
                                                                        
                                                                        {/* Edit Button */}
                                                                        <Link
                                                                            href={route('products.edit', product.id)}
                                                                            className="inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 text-sm font-medium rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1 transition-colors duration-200 shadow-sm"
                                                                        >
                                                                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                            </svg>
                                                                            <span className="hidden sm:inline">تعديل</span>
                                                                            <span className="sm:hidden">✏️</span>
                                                                        </Link>
                                                                        
                                                                        {/* Delete Button */}
                                                                        <button
                                                                            onClick={() => handleDelete(product.id)}
                                                                            className="inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm font-medium rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors duration-200 shadow-sm"
                                                                        >
                                                                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                            </svg>
                                                                            <span className="hidden sm:inline">حذف</span>
                                                                            <span className="sm:hidden">🗑️</span>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Table Info Footer */}
                                    <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 sm:mb-0">
                                            عرض <span className="font-medium text-gray-700 dark:text-gray-300">{products.length}</span> منتج
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            لعرض تفاصيل المنتج، انقر على زر "عرض"
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
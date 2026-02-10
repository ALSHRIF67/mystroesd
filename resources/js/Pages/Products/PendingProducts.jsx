import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';

export default function PendingProducts() {
    const { props } = usePage();
    const pendingProducts = props.pendingProducts || [];
    const [deletingId, setDeletingId] = useState(null);

    // دالة لحذف منتج
    const handleDelete = (productId, status) => {
        if (status !== 'pending') {
            alert('لا يمكن حذف هذا المنتج لأنه ليس في حالة قيد المراجعة.');
            return;
        }

        if (confirm('هل أنت متأكد من حذف هذا المنتج؟ سيتم حذفه نهائياً.')) {
            setDeletingId(productId);
            router.delete(route('products.destroy', productId), {
                onFinish: () => setDeletingId(null),
                preserveScroll: true,
            });
        }
    };

    // دالة للتحقق مما إذا كان المنتج قيد الحذف
    const isDeleting = (productId) => deletingId === productId;

    const badgeClasses = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-green-500 text-white';
            case 'rejected':
                return 'bg-red-500 text-white';
            default:
                return 'bg-yellow-500 text-white';
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="المنتجات المعلقة" />
            <div className="py-6 max-w-7xl mx-auto px-4">
                {/* العنوان والإحصائيات */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div className="text-right">
                        <h2 className="text-2xl font-bold text-gray-800">المنتجات المعلقة</h2>
                        <p className="text-gray-600 mt-1">المنتجات التي تنتظر مراجعة الأدمن</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-full px-4 py-2">
                            <span className="text-yellow-800 text-sm font-medium">
                                {pendingProducts.length} منتج معلق
                            </span>
                        </div>
                        <Link 
                            href={route('products.create')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            إضافة منتج جديد
                        </Link>
                    </div>
                </div>

                {/* حالة عدم وجود منتجات */}
                {pendingProducts.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-white">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">لا توجد منتجات معلقة</h3>
                        <p className="text-gray-500 mb-6">جميع منتجاتك تمت الموافقة عليها أو لم تقم بإضافة أي منتجات بعد</p>
                        <Link 
                            href={route('products.create')}
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            أضف منتجك الأول
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* شبكة المنتجات */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pendingProducts.map(product => (
                                <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
                                    {/* صورة المنتج */}
                                    <div className="relative h-48 overflow-hidden bg-gray-100">
                                        <img 
                                            src={product.image_url || '/storage/products/placeholder.png'} 
                                            alt={product.title}
                                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                            onError={(e) => {
                                                e.target.src = '/storage/products/placeholder.png';
                                            }}
                                        />
                                        <div className="absolute top-3 right-3">
                                            <span className={`${badgeClasses(product.status)} text-xs px-3 py-1.5 rounded-full font-medium shadow-sm`}>
                                                {product.status_text || 'قيد المراجعة'}
                                            </span>
                                        </div>
                                        {product.category && (
                                            <div className="absolute top-3 left-3">
                                                <span className="bg-blue-500/90 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                                                    {product.category.name}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* معلومات المنتج */}
                                    <div className="p-4">
                                        <div className="mb-3">
                                            <h3 className="font-bold text-lg text-gray-800 text-right line-clamp-1 mb-1">
                                                {product.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm text-right line-clamp-2 min-h-[2.5rem]">
                                                {product.description || 'لا يوجد وصف'}
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="text-left">
                                                <span className="text-green-600 font-bold text-lg">
                                                    {product.formatted_price}
                                                </span>
                                                {product.negotiable && (
                                                    <span className="text-xs text-gray-500 block mt-1">(قابل للتفاوض)</span>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-gray-500">
                                                    تاريخ الإضافة
                                                </div>
                                                <div className="text-sm text-gray-700 font-medium">
                                                    {new Date(product.created_at).toLocaleDateString('ar-SA', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* العلامات */}
                                        {product.tags && (
                                            <div className="mb-4">
                                                <div className="flex flex-wrap gap-1 justify-end">
                                                    {product.tags.split(',').slice(0, 3).map((tag, index) => (
                                                        <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                                            {tag.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* أزرار الإجراءات */}
                                        <div className="flex gap-2 pt-4 border-t border-gray-100">
                                            {product.status === 'pending' ? (
                                                <Link 
                                                    href={route('products.edit', product.id)}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    تعديل
                                                </Link>
                                            ) : (
                                                <div className="flex-1 flex items-center justify-center gap-2 bg-gray-50 text-gray-400 px-3 py-2 rounded-lg text-sm font-medium">
                                                    تعديل
                                                </div>
                                            )}

                                            <Link 
                                                href={route('products.show', product.id)}
                                                className="flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                معاينة
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product.id, product.status)}
                                                disabled={isDeleting(product.id) || product.status !== 'pending'}
                                                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${product.status !== 'pending' ? 'bg-gray-50 text-gray-400' : 'bg-red-50 hover:bg-red-100 text-red-700'}`}
                                            >
                                                {isDeleting(product.id) ? (
                                                    <>
                                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        جاري الحذف
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        حذف
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* معلومات عن حالة المنتجات المعلقة */}
                        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
                            <div className="flex items-start gap-3">
                                <div className="text-yellow-600 mt-1 flex-shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="text-right">
                                    <h4 className="font-medium text-yellow-800">معلومة هامة</h4>
                                    <p className="text-yellow-700 text-sm mt-1">
                                        المنتجات المعلقة هي المنتجات التي قمت بإضافتها حديثاً وتنتظر مراجعة الأدمن. 
                                        عادةً تتم المراجعة خلال 24-48 ساعة. يمكنك تعديل المنتج أو حذفه أثناء انتظار المراجعة.
                                        <br />
                                        <span className="font-medium mt-1 block">
                                            لن يتم نشر المنتج للعامة حتى تتم الموافقة عليه من قبل الأدمن.
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* رابط للعودة إلى جميع المنتجات */}
                <div className="mt-8 text-center">
                    <Link 
                        href={route('products.mine')}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        العودة إلى جميع منتجاتي
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

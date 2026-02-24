// resources/js/Pages/Cart/Index.jsx

import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';

export default function Cart({ cart, items }) {
    const [processing, setProcessing] = useState(false);

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) return;
        setProcessing(true);
        router.put(
            route('cart.update', productId), // استخدم productId كمعامل
            { quantity: newQuantity },
            {
                preserveScroll: true,
                onSuccess: () => setProcessing(false),
                onError: () => setProcessing(false),
            }
        );
    };

    const removeItem = (productId) => {
        if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
        setProcessing(true);
        router.delete(route('cart.destroy', productId), { // استخدم productId كمعامل
            preserveScroll: true,
            onSuccess: () => setProcessing(false),
            onError: () => setProcessing(false),
        });
    };

    const clearCart = () => {
        if (!confirm('إفراغ السلة بالكامل؟')) return;
        setProcessing(true);
        router.delete(route('cart.clear'), {
            preserveScroll: true,
            onSuccess: () => setProcessing(false),
            onError: () => setProcessing(false),
        });
    };

    const checkout = () => {
        router.visit(route('checkout.index'));
    };

    if (!cart || items.length === 0) {
        return (
            <AuthenticatedLayout
                header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">سلة المشتريات</h2>}
            >
                <Head title="سلة المشتريات" />
                <div className="py-12">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                            <div className="p-6 text-center text-gray-900 dark:text-gray-100">
                                <i className="fas fa-shopping-cart text-6xl text-gray-400 mb-4"></i>
                                <h3 className="text-lg font-medium">سلة المشتريات فارغة</h3>
                                <p className="mt-2">ابدأ بالتسوق وأضف منتجات إلى سلتك.</p>
                                <Link
                                    href="/"
                                    className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    العودة للتسوق
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">سلة المشتريات</h2>}
        >
            <Head title="سلة المشتريات" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden dark:bg-gray-800">
                        <div className="p-6 md:p-10">
                            {/* Header with store name and total */}
                            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">المتجر</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{cart.store_name || 'متجر غير معروف'}</p>
                                </div>
                                <div className="text-left">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">الإجمالي</p>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {new Intl.NumberFormat('ar-SA').format(cart.total_price)} ج.س
                                    </p>
                                </div>
                            </div>

                            {/* Items list */}
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {items.map((item) => (
                                    <div key={item.product_id} className="py-6 flex flex-col sm:flex-row gap-4">
                                        {/* Product image */}
                                        <div className="w-full sm:w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            {item.image ? (
                                                <img
                                                    src={item.image.startsWith('http') ? item.image : `/storage/products/${item.image}`}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <i className="fas fa-image text-2xl"></i>
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                السعر: {new Intl.NumberFormat('ar-SA').format(item.price)} ج.س
                                            </p>
                                        </div>

                                        {/* Quantity controls */}
                                        <div className="flex items-center gap-3 mt-2 sm:mt-0">
                                            <button
                                                onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                                disabled={processing || item.quantity <= 1}
                                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                            >
                                                <i className="fas fa-minus text-sm"></i>
                                            </button>
                                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                                disabled={processing}
                                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 flex items-center justify-center"
                                            >
                                                <i className="fas fa-plus text-sm"></i>
                                            </button>
                                        </div>

                                        {/* Subtotal and remove */}
                                        <div className="text-left flex flex-col items-end justify-between">
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {new Intl.NumberFormat('ar-SA').format(item.subtotal)} ج.س
                                            </p>
                                            <button
                                                onClick={() => removeItem(item.product_id)}
                                                disabled={processing}
                                                className="text-red-600 hover:text-red-800 text-sm mt-2"
                                            >
                                                <i className="fas fa-trash ml-1"></i>
                                                حذف
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Action buttons */}
                            <div className="mt-8 flex flex-wrap gap-4 justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-6">
                                <button
                                    onClick={clearCart}
                                    disabled={processing}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition disabled:opacity-50"
                                >
                                    <i className="fas fa-trash-alt ml-2"></i>
                                    إفراغ السلة
                                </button>
                                <button
                                    onClick={checkout}
                                    disabled={processing}
                                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition disabled:opacity-50"
                                >
                                    متابعة الشراء
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
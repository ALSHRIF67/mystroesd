import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function Dashboard({ store = null, stats = [], recentActivities = [], recentProducts = [] }) {
    function activateOrderSystem() {
        router.post(route('merchant.orderSystem.activate'));
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-3 rounded-xl">
                        <i className="fas fa-chart-pie text-blue-600 text-2xl"></i>
                    </div>
                    <h2 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
                        لوحة التحكم
                    </h2>
                </div>
            }
        >
            <Head title="لوحة التحكم" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* بطاقات الإحصائيات */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 dark:bg-gray-800"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10`}></div>
                                <div className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {stat.title}
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                                {stat.value}
                                            </p>
                                        </div>
                                        <div className={`p-4 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                                            <i className={`fas ${stat.icon} text-2xl text-white`}></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* النشاطات الأخيرة */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden dark:bg-gray-800">
                                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                                        <i className="fas fa-history ml-2 text-blue-600"></i>
                                        النشاطات الأخيرة
                                    </h3>
                                </div>
                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {recentActivities.length > 0 ? (
                                        recentActivities.map((activity) => (
                                            <div key={activity.id} className="px-6 py-4 flex items-center gap-4">
                                                <div className="flex-shrink-0">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
                                                        <i className={`fas ${activity.icon} text-blue-600`}></i>
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {activity.action}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {activity.product}
                                                    </p>
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                    {activity.time}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-6 py-8 text-center text-gray-500">لا توجد نشاطات بعد</div>
                                    )}
                                </div>
                                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 text-center">
                                    <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                        عرض جميع النشاطات
                                        <i className="fas fa-arrow-left mr-2"></i>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* بطاقة الإجراءات السريعة */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden dark:bg-gray-800">
                                <div className="px-6 py-8 text-center border-b border-gray-200 dark:border-gray-700">
                                    <div className="inline-flex p-4 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 mb-4">
                                        <i className="fas fa-user-circle text-5xl text-blue-600"></i>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        مرحباً بعودتك!
                                    </h3>
                                </div>
                                <div className="p-6 space-y-3">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                        <i className="fas fa-bolt ml-2 text-yellow-500"></i>
                                        الإجراءات السريعة
                                    </h4>
                                    <a
                                        href={route('products.create')}
                                        className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200"
                                    >
                                        <span className="flex items-center">
                                            <i className="fas fa-plus-circle text-blue-600 ml-3 text-lg"></i>
                                            <span className="font-medium text-gray-900 dark:text-white">إضافة منتج جديد</span>
                                        </span>
                                        <i className="fas fa-arrow-left text-blue-600"></i>
                                    </a>
                                    <a
                                        href={route('products.mine')}
                                        className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200"
                                    >
                                        <span className="flex items-center">
                                            <i className="fas fa-boxes text-green-600 ml-3 text-lg"></i>
                                            <span className="font-medium text-gray-900 dark:text-white">عرض منتجاتي</span>
                                        </span>
                                        <i className="fas fa-arrow-left text-green-600"></i>
                                    </a>
                                    {(!store || !store.system_enabled) ? (
                                        <button
                                            onClick={activateOrderSystem}
                                            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium"
                                        >
                                            Activate Order System
                                        </button>
                                    ) : (
                                        <a
                                            href={route('merchant.orderSystem.dashboard')}
                                            className="w-full mt-2 inline-flex items-center justify-center py-3 px-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-medium"
                                        >
                                            Open Order System
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* شبكة أحدث المنتجات */}
                    {recentProducts.length > 0 && (
                        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 dark:bg-gray-800">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center mb-6">
                                <i className="fas fa-boxes ml-2 text-blue-600"></i>
                                أحدث منتجاتك
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                                {recentProducts.map((product) => (
                                    <div key={product.id} className="bg-gray-50 rounded-xl p-3 border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-200 mb-3">
                                            {product.image ? (
                                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <i className="fas fa-image text-3xl"></i>
                                                </div>
                                            )}
                                        </div>
                                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{product.name}</h4>
                                        <div className="flex items-center justify-between mt-2 text-xs">
                                            <span className={`px-2 py-0.5 rounded-full font-medium ${
                                                product.status === 'approved'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                            }`}>
                                                {product.status === 'approved' ? 'منشور' : 'غير منشور'}
                                            </span>
                                            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                <i className="fas fa-eye"></i> {product.views_count}
                                            </span>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                            <i className="fas fa-shopping-cart"></i> طلبات: {product.orders_count ?? 0}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* عناصر الخلفية الزخرفية */}
                    <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
                        <div className="absolute -top-40 -right-32 h-96 w-96 rounded-full bg-gradient-to-br from-blue-200 via-blue-100 to-transparent opacity-30 blur-3xl"></div>
                        <div className="absolute top-60 -left-32 h-96 w-96 rounded-full bg-gradient-to-tr from-indigo-200 via-blue-100 to-transparent opacity-30 blur-3xl"></div>
                        <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-gradient-to-t from-blue-200 via-blue-100 to-transparent opacity-20 blur-3xl"></div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
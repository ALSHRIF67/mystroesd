import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';

export default function UserDashboard() {
    const { auth } = usePage().props;
    const user = auth.user;

    // إحصائيات المستخدم (يُفضل جلبها من الخادم)
    const userStats = [
        { title: 'إجمالي منتجاتي', value: '45', icon: 'fa-boxes', color: 'from-blue-500 to-blue-700' },
        { title: 'منتجات معلقة', value: '3', icon: 'fa-clock', color: 'from-yellow-500 to-yellow-700' },
        { title: 'منتجات منشورة', value: '42', icon: 'fa-check-circle', color: 'from-green-500 to-green-700' },
        { title: 'إجمالي المشاهدات', value: '١٬٢٤٠', icon: 'fa-eye', color: 'from-purple-500 to-purple-700' },
    ];

    // آخر نشاطات المستخدم (يفضل جلبها من الخادم)
    const recentActivities = [
        { id: 1, action: 'تم إضافة منتج جديد', product: 'سماعات لاسلكية', time: 'منذ 5 دقائق', icon: 'fa-plus-circle' },
        { id: 2, action: 'تم تحديث منتج', product: 'ماوس ألعاب', time: 'منذ ساعة', icon: 'fa-edit' },
        { id: 3, action: 'تم حذف منتج', product: 'كيبورد ميكانيكي', time: 'منذ 3 ساعات', icon: 'fa-trash' },
        { id: 4, action: 'تمت الموافقة على منتج', product: 'شاشة 24 بوصة', time: 'منذ يوم', icon: 'fa-check-circle' },
    ];

    // آخر المنتجات المضافة (يمكن جلبها من props)
    const recentProducts = [
        { id: 1, title: 'سماعات لاسلكية', price: '٢٥٠ ج.س', status: 'منشور', statusColor: 'green' },
        { id: 2, title: 'ماوس ألعاب', price: '١٨٠ ج.س', status: 'معلق', statusColor: 'yellow' },
        { id: 3, title: 'كيبورد ميكانيكي', price: '٣٢٠ ج.س', status: 'منشور', statusColor: 'green' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-3 rounded-xl">
                        <i className="fas fa-store text-blue-600 text-2xl"></i>
                    </div>
                    <h2 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
                        مرحباً، {user.name} 👋
                    </h2>
                </div>
            }
        >
            <Head title="لوحة تحكم المستخدم" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* بطاقات الإحصائيات */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {userStats.map((stat, index) => (
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

                    {/* محتوى الصفحة الرئيسي */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* آخر النشاطات */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden dark:bg-gray-800">
                                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                                        <i className="fas fa-history ml-2 text-blue-600"></i>
                                        آخر نشاطاتك
                                    </h3>
                                </div>
                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {recentActivities.map((activity) => (
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
                                    ))}
                                </div>
                                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 text-center">
                                    <Link 
                                        href={route('products.mine')}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        عرض جميع منتجاتي
                                        <i className="fas fa-arrow-left mr-2"></i>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* الإجراءات السريعة وملخص المنتجات */}
                        <div className="lg:col-span-1">
                            {/* الإجراءات السريعة */}
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden dark:bg-gray-800 mb-6">
                                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                                        <i className="fas fa-bolt ml-2 text-yellow-500"></i>
                                        الإجراءات السريعة
                                    </h3>
                                </div>
                                <div className="p-6 space-y-3">
                                    <Link
                                        href={route('products.create')}
                                        className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 dark:from-blue-900/20 dark:to-blue-800/20 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30"
                                    >
                                        <span className="flex items-center">
                                            <i className="fas fa-plus-circle text-blue-600 ml-3 text-lg"></i>
                                            <span className="font-medium text-gray-900 dark:text-white">إضافة منتج جديد</span>
                                        </span>
                                        <i className="fas fa-arrow-left text-blue-600"></i>
                                    </Link>
                                    <Link
                                        href={route('products.mine')}
                                        className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-200 dark:from-green-900/20 dark:to-green-800/20 dark:hover:from-green-900/30 dark:hover:to-green-800/30"
                                    >
                                        <span className="flex items-center">
                                            <i className="fas fa-boxes text-green-600 ml-3 text-lg"></i>
                                            <span className="font-medium text-gray-900 dark:text-white">جميع منتجاتي</span>
                                        </span>
                                        <i className="fas fa-arrow-left text-green-600"></i>
                                    </Link>
                                    <Link
                                        href={route('products.pending')}
                                        className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 transition-all duration-200 dark:from-yellow-900/20 dark:to-yellow-800/20 dark:hover:from-yellow-900/30 dark:hover:to-yellow-800/30"
                                    >
                                        <span className="flex items-center">
                                            <i className="fas fa-clock text-yellow-600 ml-3 text-lg"></i>
                                            <span className="font-medium text-gray-900 dark:text-white">المنتجات المعلقة</span>
                                        </span>
                                        <i className="fas fa-arrow-left text-yellow-600"></i>
                                    </Link>
                                </div>
                            </div>

                            {/* آخر المنتجات المضافة */}
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden dark:bg-gray-800">
                                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                                        <i className="fas fa-clock ml-2 text-blue-600"></i>
                                        آخر منتجاتك
                                    </h3>
                                </div>
                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {recentProducts.map((product) => (
                                        <div key={product.id} className="px-6 py-4 flex items-center justify-between">
                                            <div className="flex-1 min-w-0 ml-4">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {product.title}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {product.price}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full font-medium bg-${product.statusColor}-100 text-${product.statusColor}-800 dark:bg-${product.statusColor}-900/30 dark:text-${product.statusColor}-300`}>
                                                {product.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 text-center">
                                    <Link 
                                        href={route('products.mine')}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        عرض الكل
                                        <i className="fas fa-arrow-left mr-2"></i>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* نصائح سريعة للمستخدم */}
                    <div className="mt-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800/30">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                                    <i className="fas fa-lightbulb text-white text-xl"></i>
                                </div>
                            </div>
                            <div className="flex-1 text-right">
                                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                                    نصائح لزيادة مبيعاتك
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    أضف صوراً واضحة لمنتجاتك، واكتب وصفاً دقيقاً، وحدد سعراً مناسباً. 
                                    المنتجات ذات الصور عالية الجودة تحصل على مشاهدات أكثر بنسبة 80%.
                                </p>
                                <Link 
                                    href={route('products.create')}
                                    className="inline-flex items-center mt-3 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    <span>أضف منتجاً الآن</span>
                                    <i className="fas fa-arrow-left mr-2"></i>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* طبقات الخلفية الزخرفية (اختياري) */}
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
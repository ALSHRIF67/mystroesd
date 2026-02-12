import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    // إحصائيات وهمية – يمكن استبدالها ببيانات حقيقية من الخادم
    const stats = [
        { title: 'إجمالي المنتجات', value: '124', icon: 'fa-box', color: 'from-blue-500 to-blue-700' },
        { title: 'منتجاتي', value: '23', icon: 'fa-boxes', color: 'from-green-500 to-green-700' },
        { title: 'الطلبات الجديدة', value: '12', icon: 'fa-shopping-cart', color: 'from-yellow-500 to-yellow-700' },
        { title: 'إجمالي المبيعات', value: '١٢٬٣٤٠ ج.س', icon: 'fa-chart-line', color: 'from-purple-500 to-purple-700' },
    ];

    const recentActivities = [
        { id: 1, action: 'تم إضافة منتج جديد', product: 'سماعات لاسلكية', time: 'منذ 5 دقائق', icon: 'fa-plus-circle' },
        { id: 2, action: 'تم تحديث منتج', product: 'ماوس ألعاب', time: 'منذ ساعة', icon: 'fa-edit' },
        { id: 3, action: 'تم حذف منتج', product: 'كيبورد ميكانيكي', time: 'منذ 3 ساعات', icon: 'fa-trash' },
        { id: 4, action: 'تم بيع منتج', product: 'شاشة 24 بوصة', time: 'منذ يوم', icon: 'fa-check-circle' },
    ];

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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

                    {/* محتوى الصفحة الرئيسي */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* النشاطات الأخيرة */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden dark:bg-gray-800">
                                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                                        <i className="fas fa-history ml-2 text-blue-600"></i>
                                        النشاطات الأخيرة
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
                                    <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                        عرض جميع النشاطات
                                        <i className="fas fa-arrow-left mr-2"></i>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* بطاقة الترحيب والإجراءات السريعة */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden dark:bg-gray-800">
                                <div className="px-6 py-8 text-center border-b border-gray-200 dark:border-gray-700">
                                    <div className="inline-flex p-4 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 mb-4">
                                        <i className="fas fa-user-circle text-5xl text-blue-600"></i>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        مرحباً بعودتك!
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                        سعيدون برؤيتك مرة أخرى في لوحة التحكم.
                                    </p>
                                </div>
                                <div className="p-6 space-y-3">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                        <i className="fas fa-bolt ml-2 text-yellow-500"></i>
                                        الإجراءات السريعة
                                    </h4>
                                    <a
                                        href={route('products.create')}
                                        className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 dark:from-blue-900/20 dark:to-blue-800/20 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30"
                                    >
                                        <span className="flex items-center">
                                            <i className="fas fa-plus-circle text-blue-600 ml-3 text-lg"></i>
                                            <span className="font-medium text-gray-900 dark:text-white">إضافة منتج جديد</span>
                                        </span>
                                        <i className="fas fa-arrow-left text-blue-600"></i>
                                    </a>
                                    <a
                                        href={route('products.mine')}
                                        className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-200 dark:from-green-900/20 dark:to-green-800/20 dark:hover:from-green-900/30 dark:hover:to-green-800/30"
                                    >
                                        <span className="flex items-center">
                                            <i className="fas fa-boxes text-green-600 ml-3 text-lg"></i>
                                            <span className="font-medium text-gray-900 dark:text-white">عرض منتجاتي</span>
                                        </span>
                                        <i className="fas fa-arrow-left text-green-600"></i>
                                    </a>
                                    <a
                                        href="#"
                                        className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-200 dark:from-purple-900/20 dark:to-purple-800/20 dark:hover:from-purple-900/30 dark:hover:to-purple-800/30"
                                    >
                                        <span className="flex items-center">
                                            <i className="fas fa-cog text-purple-600 ml-3 text-lg"></i>
                                            <span className="font-medium text-gray-900 dark:text-white">إعدادات المتجر</span>
                                        </span>
                                        <i className="fas fa-arrow-left text-purple-600"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* طبقات الخلفية الزخرفية (اختياري، يمكن إضافتها لمزيد من التميز) */}
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
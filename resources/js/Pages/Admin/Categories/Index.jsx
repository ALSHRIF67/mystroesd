import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

// Global route helper (injected by @routes)
const route = typeof window !== 'undefined' ? window.route : null;

export default function AdminCategoriesIndex({ categories = [] }) {
    const [searchTerm, setSearchTerm] = useState('');

    // Check if route function is available
    const isRouteAvailable = !!route;
    const hasCreateRoute = isRouteAvailable && route().has('admin.categories.create');
    const hasEditRoute = isRouteAvailable && route().has('admin.categories.edit');
    const hasToggleRoute = isRouteAvailable && route().has('admin.categories.toggle');

    // Calculate stats
    const totalCategories = categories.length;
    const activeCategories = categories.filter(c => c.is_active).length;
    const inactiveCategories = categories.filter(c => !c.is_active).length;

    // Sort: active first (is_active = true first), then inactive
    const filteredAndSortedCategories = useMemo(() => {
        return categories
            .filter(category =>
                category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
            )
            .sort((a, b) => {
                if (a.is_active === b.is_active) return 0;
                return a.is_active ? -1 : 1; // active first
            });
    }, [categories, searchTerm]);

    const handleToggleStatus = (category) => {
        if (!hasToggleRoute) {
            alert('Toggle route is not defined.');
            return;
        }
        const action = category.is_active ? 'إلغاء تنشيط' : 'تنشيط';
        if (confirm(`هل أنت متأكد من ${action} هذه الفئة؟`)) {
            router.post(route('admin.categories.toggle', category.id), {}, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="إدارة الفئات" />

            <div dir="rtl" className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header with Add Button */}
                    <header className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-400 rounded-2xl flex items-center justify-center shadow-lg">
                                <i className="fas fa-tags text-white text-2xl"></i>
                            </div>
                            <div className="text-right">
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">إدارة الفئات</h1>
                                <p className="text-gray-600 text-lg">عرض وإدارة جميع الفئات في المنصة.</p>
                            </div>
                        </div>
                        {hasCreateRoute && (
                            <Link
                                href={route('admin.categories.create')}
                                className="bg-gradient-to-r from-green-600 to-green-500 text-white font-bold px-6 py-3.5 rounded-xl hover:from-green-700 hover:to-green-600 active:scale-[0.98] transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                            >
                                <i className="fas fa-plus"></i>
                                إضافة فئة جديدة
                            </Link>
                        )}
                    </header>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between border border-gray-100">
                            <div>
                                <p className="text-gray-500 text-sm">إجمالي الفئات</p>
                                <p className="text-3xl font-bold text-gray-800">{totalCategories}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <i className="fas fa-tags text-purple-600 text-xl"></i>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between border border-gray-100">
                            <div>
                                <p className="text-gray-500 text-sm">نشطة</p>
                                <p className="text-3xl font-bold text-green-600">{activeCategories}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <i className="fas fa-check-circle text-green-600 text-xl"></i>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between border border-gray-100">
                            <div>
                                <p className="text-gray-500 text-sm">غير نشطة</p>
                                <p className="text-3xl font-bold text-gray-500">{inactiveCategories}</p>
                            </div>
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                                <i className="fas fa-ban text-gray-500 text-xl"></i>
                            </div>
                        </div>
                    </div>

                    {/* Search/Filter Bar */}
                    <div className="bg-white rounded-2xl shadow-lg p-4 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between border border-gray-100">
                        <div className="relative flex-1 w-full">
                            <i className="fas fa-search absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input
                                type="text"
                                placeholder="ابحث عن فئة بالاسم أو الوصف..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full border-2 border-gray-200 rounded-xl py-3 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                            />
                        </div>
                        <button className="bg-gradient-to-r from-purple-600 to-purple-500 text-white font-medium px-6 py-3 rounded-xl hover:from-purple-700 hover:to-purple-600 transition-all shadow-md flex items-center gap-2 whitespace-nowrap">
                            <i className="fas fa-filter"></i>
                            تصفية
                        </button>
                    </div>

                    {/* Categories Table */}
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">#</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">الاسم</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">الوصف</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">الحالة</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredAndSortedCategories.length > 0 ? (
                                        filteredAndSortedCategories.map((category) => (
                                            <tr key={category.id} className="hover:bg-purple-50 transition-colors">
                                                <td className="px-6 py-4 text-gray-700">#{category.id}</td>
                                                <td className="px-6 py-4 font-medium text-gray-800">{category.name}</td>
                                                <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                                                    {category.description || '—'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-medium ${
                                                        category.is_active
                                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                                                    }`}>
                                                        <i className={`fas fa-circle text-xs ml-2 ${
                                                            category.is_active ? 'text-green-500' : 'text-gray-400'
                                                        }`}></i>
                                                        {category.is_active ? 'نشط' : 'غير نشط'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {hasEditRoute && (
                                                            <Link
                                                                href={route('admin.categories.edit', category.id)}
                                                                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                                                title="تعديل"
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </Link>
                                                        )}
                                                        {hasToggleRoute && (
                                                            <button
                                                                onClick={() => handleToggleStatus(category)}
                                                                className={`p-2 rounded-lg transition-colors ${
                                                                    category.is_active
                                                                        ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                                                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                                                                }`}
                                                                title={category.is_active ? 'إلغاء التنشيط' : 'تنشيط'}
                                                            >
                                                                <i className={`fas ${
                                                                    category.is_active ? 'fa-ban' : 'fa-check-circle'
                                                                }`}></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center">
                                                    <i className="fas fa-folder-open text-4xl text-gray-300 mb-3"></i>
                                                    <p className="text-lg">لا توجد فئات.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer */}
                    <footer className="mt-8 text-center">
                        <p className="text-gray-500 text-sm">
                            © {new Date().getFullYear()} منصة السوق المبوبة. جميع الحقوق محفوظة.
                        </p>
                    </footer>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
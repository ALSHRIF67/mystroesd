import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function AdminSellersIndex({ sellers = [] }) {
    const [searchTerm, setSearchTerm] = useState('');

    // Calculate stats
    const totalSellers = sellers.length;
    const activeSellers = sellers.filter(s => !s.is_suspended).length;
    const suspendedSellers = sellers.filter(s => s.is_suspended).length;

    // Sort: active first (is_suspended = false first), then suspended
    // Filter by search term (name or email)
    const filteredAndSortedSellers = useMemo(() => {
        return sellers
            .filter(seller =>
                seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                seller.email.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
                // Sort by is_suspended: false (active) comes before true (suspended)
                if (a.is_suspended === b.is_suspended) return 0;
                return a.is_suspended ? 1 : -1; // active (false) first
            });
    }, [sellers, searchTerm]);

    return (
        <AuthenticatedLayout>
            <Head title="Admin - Sellers Management" />

            <div dir="rtl" className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <header className="mb-10 text-center">
                        <div className="inline-flex items-center justify-center mb-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center shadow-lg">
                                <i className="fas fa-users text-white text-2xl"></i>
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                            إدارة البائعين
                        </h1>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            عرض وإدارة جميع البائعين المسجلين في المنصة.
                        </p>
                    </header>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between border border-gray-100">
                            <div>
                                <p className="text-gray-500 text-sm">إجمالي البائعين</p>
                                <p className="text-3xl font-bold text-gray-800">{totalSellers}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <i className="fas fa-users text-blue-600 text-xl"></i>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between border border-gray-100">
                            <div>
                                <p className="text-gray-500 text-sm">نشط</p>
                                <p className="text-3xl font-bold text-green-600">{activeSellers}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <i className="fas fa-check-circle text-green-600 text-xl"></i>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between border border-gray-100">
                            <div>
                                <p className="text-gray-500 text-sm">موقوف</p>
                                <p className="text-3xl font-bold text-red-600">{suspendedSellers}</p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                <i className="fas fa-ban text-red-600 text-xl"></i>
                            </div>
                        </div>
                    </div>

                    {/* Search/Filter Bar */}
                    <div className="bg-white rounded-2xl shadow-lg p-4 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between border border-gray-100">
                        <div className="relative flex-1 w-full">
                            <i className="fas fa-search absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input
                                type="text"
                                placeholder="ابحث عن بائع بالاسم أو البريد الإلكتروني..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full border-2 border-gray-200 rounded-xl py-3 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                        </div>
                        <button className="bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all shadow-md flex items-center gap-2 whitespace-nowrap">
                            <i className="fas fa-filter"></i>
                            تصفية
                        </button>
                    </div>

                    {/* Sellers Table */}
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">#</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">الاسم</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">البريد الإلكتروني</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">الحالة</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredAndSortedSellers.length > 0 ? (
                                        filteredAndSortedSellers.map((seller) => (
                                            <tr key={seller.id} className="hover:bg-blue-50 transition-colors">
                                                <td className="px-6 py-4 text-gray-700">#{seller.id}</td>
                                                <td className="px-6 py-4 font-medium text-gray-800">{seller.name}</td>
                                                <td className="px-6 py-4 text-gray-600">{seller.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-medium ${
                                                        seller.is_suspended
                                                            ? 'bg-red-100 text-red-700 border border-red-200'
                                                            : 'bg-green-100 text-green-700 border border-green-200'
                                                    }`}>
                                                        <i className={`fas fa-circle text-xs ml-2 ${
                                                            seller.is_suspended ? 'text-red-500' : 'text-green-500'
                                                        }`}></i>
                                                        {seller.is_suspended ? 'موقوف' : 'نشط'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={route('admin.sellers.show', seller.id)}
                                                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                                            title="عرض التفاصيل"
                                                        >
                                                            <i className="fas fa-eye"></i>
                                                        </Link>
                                                        {seller.is_suspended ? (
                                                            <button
                                                                onClick={() => {
                                                                    // Handle activate
                                                                    if (confirm('هل أنت متأكد من تفعيل هذا البائع؟')) {
                                                                        router.post(route('admin.sellers.activate', seller.id));
                                                                    }
                                                                }}
                                                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                                                title="تفعيل"
                                                            >
                                                                <i className="fas fa-check-circle"></i>
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => {
                                                                    // Handle suspend
                                                                    if (confirm('هل أنت متأكد من إيقاف هذا البائع؟')) {
                                                                        router.post(route('admin.sellers.suspend', seller.id));
                                                                    }
                                                                }}
                                                                className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors"
                                                                title="إيقاف"
                                                            >
                                                                <i className="fas fa-ban"></i>
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
                                                    <i className="fas fa-box-open text-4xl text-gray-300 mb-3"></i>
                                                    <p className="text-lg">لا يوجد بائعين.</p>
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
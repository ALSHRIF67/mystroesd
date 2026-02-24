import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Header() {
    const { auth, cartCount } = usePage().props;
    const user = auth?.user;

    const [profileOpen, setProfileOpen] = useState(false);

    const handleLogout = () => {
        router.post(route('logout'));
    };

    return (
        <header className="w-full bg-white/70 backdrop-blur-md shadow-lg sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-center justify-between gap-4 py-4">

                    {/* Logo */}
                    <Link href={route('home')} className="flex items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-2xl shadow-lg hover:shadow-xl transition">
                        <i className="fas fa-store text-2xl ml-2"></i>
                        <span className="text-xl font-bold">Mystroesd</span>
                    </Link>

                    {/* Right side buttons */}
                    <div className="flex items-center flex-wrap gap-3">

                        {/* Language switcher (static) */}
                        <div className="flex items-center gap-1 bg-gray-100 px-3 py-2 rounded-xl shadow-sm">
                            <span className="text-sm font-bold text-blue-600">AR</span>
                            <span className="text-gray-400">|</span>
                            <span className="text-sm text-gray-600">EN</span>
                        </div>

                        {/* Add listing button */}
                        <Link
                            href={route('products.create')}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition"
                        >
                            <i className="fas fa-plus ml-2"></i>
                            <span className="text-sm">إضافة قائمة</span>
                        </Link>

                        {/* Cart icon */}
                        <Link
                            href={route('cart.index')}
                            className="relative p-2 rounded-xl hover:bg-gray-100 transition"
                        >
                            <i className="fas fa-shopping-cart text-xl text-gray-700"></i>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Auth section */}
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center gap-2 p-1 rounded-full hover:scale-105 hover:shadow-xl transition duration-200"
                                >
                                    {user.profile_photo_url ? (
                                        <img
                                            src={user.profile_photo_url}
                                            alt={user.name}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <i className="fas fa-chevron-down text-xs text-gray-600"></i>
                                </button>

                                {profileOpen && (
                                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 z-50">
                                        <Link
                                            href={route('dashboard')}
                                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-t-xl transition"
                                            onClick={() => setProfileOpen(false)}
                                        >
                                            <i className="fas fa-tachometer-alt"></i>
                                            <span className="font-medium">لوحة التحكم</span>
                                        </Link>
                                        <Link
                                            href={route('profile.edit')}
                                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                                            onClick={() => setProfileOpen(false)}
                                        >
                                            <i className="fas fa-user-cog"></i>
                                            <span className="font-medium">ملفي الشخصي</span>
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setProfileOpen(false);
                                                handleLogout();
                                            }}
                                            className="flex items-center gap-3 w-full text-right px-4 py-3 text-red-600 hover:bg-red-50 rounded-b-xl transition border-t border-gray-100"
                                        >
                                            <i className="fas fa-sign-out-alt"></i>
                                            <span className="font-medium">تسجيل خروج</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition"
                                >
                                    <i className="fas fa-sign-in-alt ml-2"></i>
                                    <span className="text-sm">تسجيل الدخول</span>
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="inline-flex items-center px-4 py-2 bg-white border-2 border-blue-600 text-blue-700 hover:bg-blue-50 font-bold rounded-xl shadow-md hover:shadow-lg transition"
                                >
                                    <i className="fas fa-user-plus ml-2"></i>
                                    <span className="text-sm">إنشاء حساب</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
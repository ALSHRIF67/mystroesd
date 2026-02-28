import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth = {}, ziggy = {} } = usePage().props || {};
    const user = auth?.user ?? {};

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    // دالة للتحقق من وجود المسار قبل استخدام route()
    const hasRoute = (routeName) => {
        try {
            route(routeName);
            return true;
        } catch (error) {
            return false;
        }
    };

    return (
        <div className="min-h-screen" dir="rtl">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');
                body { 
                    font-family: 'Cairo', sans-serif !important; 
                    background: linear-gradient(135deg, #f9fafb 0%, #ffffff 50%, #eff6ff 100%);
                    margin: 0;
                    padding: 0;
                }
            `}</style>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

            {/* شريط التنقل */}
            <nav className="fixed-top navbar border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/80 dark:backdrop-blur-md sticky top-0 z-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* القسم الأيمن (الشعار + العلم + روابط سطح المكتب) */}
                        <div className="flex items-center gap-4 lg:gap-6">
                            {/* الشعار - متجرك */}
                            <Link href="/" className="flex shrink-0 items-center">
                                <div className="inline-flex items-center bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white p-3 md:p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                                    <i className="fas fa-store text-2xl md:text-3xl ml-2 md:ml-3"></i>
                                    <span className="text-lg md:text-xl font-bold">متجرك</span>
                                </div>
                            </Link>

                            {/* علم الدولة - السودان */}
                            <div className="hidden items-center md:flex">
                                <img
                                    src="https://mystroesd.com/images/flags/32/sd.png"
                                    alt="السودان"
                                    className="h-6 w-6 rounded-sm object-cover shadow-sm"
                                />
                            </div>

                            {/* روابط التنقل الرئيسية - سطح المكتب */}
                            <div className="hidden gap-1 lg:gap-2 xl:gap-3 md:flex">
                                {hasRoute('dashboard') && (
                                    <NavLink
                                        href={route('dashboard')}
                                        active={route().current('dashboard')}
                                        className="px-4 py-2 text-base font-semibold rounded-xl transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                    >
                                        <i className="fas fa-chart-pie ml-2 text-blue-600"></i>
                                        لوحة التحكم
                                    </NavLink>
                                )}
                                
                                {/* ✅ منتجاتي - الرابط الجديد (بدلاً من المنتجات) */}
                                {hasRoute('products.mine') && (
                                    <NavLink
                                        href={route('products.mine')}
                                        active={route().current('products.mine')}
                                        className="px-4 py-2 text-base font-semibold rounded-xl transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                    >
                                        <i className="fas fa-boxes ml-2 text-blue-600"></i>
                                        منتجاتي
                                    </NavLink>
                                )}

                                {hasRoute('orders.index') && (
                                    <NavLink
                                        href={route('orders.index')}
                                        active={route().current('orders.index')}
                                        className="px-4 py-2 text-base font-semibold rounded-xl transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                    >
                                        <i className="fas fa-plus-circle ml-2 text-blue-600"></i>
                                طلباتي
                                    </NavLink>
                                )}
                            </div>
                        </div>

                        {/* القسم الأيسر (إضافة قائمة + المستخدم + اللغة) */}
                        <div className="flex items-center gap-2 lg:gap-3">
                            {/* زر "إضافة قائمة" - سطح المكتب */}
                            {hasRoute('products.create') && (
                                <Link
                                    href={route('products.create')}
                                    className="hidden items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 md:flex"
                                >
                                    <i className="fas fa-plus-circle text-lg"></i>
                                    <span> إضافة منتج </span>
                                </Link>
                            )}

                            {/* قائمة المستخدم */}
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-xl">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:bg-gray-700"
                                            >
                                                <i className="fas fa-user-circle text-blue-600 ml-2 text-lg"></i>
                                                {user.name}
                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content align="left" width="48">
                                        {hasRoute('profile.edit') && (
                                            <Dropdown.Link href={route('profile.edit')}>
                                                <i className="fas fa-user ml-2 text-blue-600"></i>
                                                الملف الشخصي
                                            </Dropdown.Link>
                                        )}
                                        {hasRoute('logout') && (
                                            <Dropdown.Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                            >
                                                <i className="fas fa-sign-out-alt ml-2 text-red-600"></i>
                                                تسجيل الخروج
                                            </Dropdown.Link>
                                        )}
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>

                            {/* قائمة اللغات */}
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="flex items-center rounded-xl p-2.5 text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300">
                                            <i className="fas fa-globe text-xl text-blue-600"></i>
                                            <span className="mr-1 hidden text-sm font-medium md:inline">العربية</span>
                                            <svg
                                                className="mr-1 h-4 w-4"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content align="left" width="40">
                                        {hasRoute('locale') && (
                                            <>
                                                <Dropdown.Link
                                                    href={route('locale', 'en')}
                                                    as="button"
                                                    active={ziggy?.locale === 'en'}
                                                >
                                                    <span className="flex items-center">
                                                        <img src="https://flagcdn.com/w40/gb.png" className="ml-2 h-4 w-6 object-cover" alt="EN" />
                                                        English
                                                    </span>
                                                </Dropdown.Link>
                                                <Dropdown.Link
                                                    href={route('locale', 'ar')}
                                                    as="button"
                                                    active={ziggy?.locale === 'ar'}
                                                >
                                                    <span className="flex items-center">
                                                        <img src="https://flagcdn.com/w40/sa.png" className="ml-2 h-4 w-6 object-cover" alt="AR" />
                                                        العربية
                                                    </span>
                                                </Dropdown.Link>
                                            </>
                                        )}
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* زر القائمة للهواتف */}
                        <div className="flex items-center md:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((prev) => !prev)}
                                className="inline-flex items-center justify-center rounded-xl p-2.5 text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* القائمة الجانبية للهواتف */}
                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' border-t border-gray-200 bg-white/95 backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/95 dark:backdrop-blur-md md:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2 px-2">
                        {hasRoute('dashboard') && (
                            <ResponsiveNavLink
                                href={route('dashboard')}
                                active={route().current('dashboard')}
                                className="!rounded-xl !py-3 !text-base !font-semibold"
                            >
                                <i className="fas fa-chart-pie ml-2 w-5 text-blue-600"></i>
                                لوحة التحكم
                            </ResponsiveNavLink>
                        )}

                        {/* ✅ منتجاتي - للهواتف (بدلاً من المنتجات) */}
                        {hasRoute('products.mine') && (
                            <ResponsiveNavLink
                                href={route('products.mine')}
                                active={route().current('products.mine')}
                                className="!rounded-xl !py-3 !text-base !font-semibold"
                            >
                                <i className="fas fa-boxes ml-2 w-5 text-blue-600"></i>
                                منتجاتي
                            </ResponsiveNavLink>
                        )}

                        {hasRoute('products.create') && (
                            <ResponsiveNavLink
                                href={route('products.create')}
                                active={route().current('products.create')}
                                className="!rounded-xl !py-3 !text-base !font-semibold"
                            >
                                <i className="fas fa-plus-circle ml-2 w-5 text-blue-600"></i>
                                إضافة منتج
                            </ResponsiveNavLink>
                        )}

                        {hasRoute('products.create') && (
                            <ResponsiveNavLink
                                href={route('products.create')}
                                className="!rounded-xl !border-2 !border-blue-600 !bg-gradient-to-r !from-blue-600 !via-blue-700 !to-blue-800 !py-3 !text-base !font-bold !text-white shadow-md"
                            >
                                <i className="fas fa-plus-circle ml-2 w-5"></i>
                                إضافة قائمة
                            </ResponsiveNavLink>
                        )}
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4 dark:border-gray-600">
                        <div className="px-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                                    <i className="fas fa-user text-lg"></i>
                                </div>
                                <div>
                                    <div className="text-base font-bold text-gray-900 dark:text-gray-200">
                                        {user.name}
                                    </div>
                                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        {user.email}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 space-y-1 px-2">
                            {hasRoute('profile.edit') && (
                                <ResponsiveNavLink
                                    href={route('profile.edit')}
                                    className="!rounded-xl !py-3 !text-base !font-semibold"
                                >
                                    <i className="fas fa-user ml-2 w-5 text-blue-600"></i>
                                    الملف الشخصي
                                </ResponsiveNavLink>
                            )}
                            {hasRoute('logout') && (
                                <ResponsiveNavLink
                                    method="post"
                                    href={route('logout')}
                                    as="button"
                                    className="!rounded-xl !py-3 !text-base !font-semibold"
                                >
                                    <i className="fas fa-sign-out-alt ml-2 w-5 text-red-600"></i>
                                    تسجيل الخروج
                                </ResponsiveNavLink>
                            )}
                            <div className="border-t border-gray-200 pt-3 dark:border-gray-600">
                                <div className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                                    <i className="fas fa-globe ml-2 text-blue-600"></i>
                                    اللغة
                                </div>
                                {hasRoute('locale') && (
                                    <div className="space-y-1">
                                        <ResponsiveNavLink
                                            href={route('locale', 'en')}
                                            as="button"
                                            active={ziggy?.locale === 'en'}
                                            className="!rounded-xl !py-3 !text-base !font-medium"
                                        >
                                            <span className="flex items-center">
                                                <img src="https://flagcdn.com/w40/gb.png" className="ml-3 h-4 w-6 object-cover" alt="EN" />
                                                English
                                            </span>
                                        </ResponsiveNavLink>
                                        <ResponsiveNavLink
                                            href={route('locale', 'ar')}
                                            as="button"
                                            active={ziggy?.locale === 'ar'}
                                            className="!rounded-xl !py-3 !text-base !font-medium"
                                        >
                                            <span className="flex items-center">
                                                <img src="https://flagcdn.com/w40/sa.png" className="ml-3 h-4 w-6 object-cover" alt="AR" />
                                                العربية
                                            </span>
                                        </ResponsiveNavLink>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* رأس الصفحة (اختياري) */}
            {header && (
                <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200 dark:bg-gray-800/80 dark:border-gray-700">
                    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-3 rounded-xl">
                                <i className="fas fa-store text-blue-600 text-2xl"></i>
                            </div>
                            <div className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
                                {header}
                            </div>
                        </div>
                    </div>
                </header>
            )}

            {/* المحتوى الرئيسي مع خلفية متدرجة */}
            <main className="relative">
                {/* طبقات خلفية زخرفية */}
                <div className="absolute inset-0 overflow-hidden -z-10">
                    <div className="absolute -top-40 -right-32 h-96 w-96 rounded-full bg-gradient-to-br from-blue-200 via-blue-100 to-transparent opacity-30 blur-3xl"></div>
                    <div className="absolute top-60 -left-32 h-96 w-96 rounded-full bg-gradient-to-tr from-indigo-200 via-blue-100 to-transparent opacity-30 blur-3xl"></div>
                    <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-gradient-to-t from-blue-200 via-blue-100 to-transparent opacity-20 blur-3xl"></div>
                </div>
                
                {/* محتوى الصفحة */}
                <div className="relative z-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
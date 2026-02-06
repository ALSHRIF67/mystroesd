import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="تسجيل الدخول" />
            
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');
                body { 
                    font-family: 'Cairo', sans-serif; 
                    direction: rtl; 
                    background: linear-gradient(135deg, #f9fafb 0%, #ffffff 50%, #eff6ff 100%);
                    min-height: 100vh;
                    margin: 0;
                    padding: 0;
                }
            `}</style>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

            <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
                <div className="w-full max-w-lg">
                    {/* Header Section */}
                    <div className="text-center mb-8 md:mb-12">
                        <div className="flex justify-center mb-6">
                            <div className="inline-flex items-center bg-blue-600 text-white p-4 md:p-5 rounded-2xl shadow-lg">
                                <i className="fas fa-store text-3xl md:text-4xl ml-3"></i>
                                <span className="text-xl md:text-2xl font-bold">متجرك</span>
                            </div>
                        </div>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                            مرحباً بعودتك
                        </h1>
                        
                        <p className="text-gray-600 text-lg md:text-xl max-w-md mx-auto">
                            سجل دخولك إلى حسابك التجاري واستأنف رحلتك في بيع منتجاتك
                        </p>
                    </div>

                    {/* Status Message */}
                    {status && (
                        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl text-center text-lg">
                            <i className="fas fa-check-circle ml-2"></i>
                            {status}
                        </div>
                    )}

                    {/* Main Login Card */}
                    <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10">
                        <form onSubmit={submit} className="space-y-6 md:space-y-8">
                            {/* Email Field */}
                            <div className="space-y-4">
                                <label className="block text-gray-900 font-bold text-right text-xl md:text-2xl">
                                    <div className="flex items-center mb-3">
                                        <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-3 md:p-4 rounded-xl ml-4">
                                            <i className="fas fa-envelope text-blue-600 text-xl md:text-2xl"></i>
                                        </div>
                                        <span>البريد الإلكتروني</span>
                                    </div>
                                </label>
                                <div className="relative">
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        placeholder="example@domain.com"
                                        className="w-full border-2 border-gray-300 rounded-2xl px-5 sm:px-6 md:px-7 py-4 md:py-5 focus:outline-none focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-900 text-lg md:text-xl h-14 md:h-16 pr-14 md:pr-16 hover:border-blue-400"
                                        autoComplete="email"
                                        isFocused={true}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                    <span className="absolute right-5 md:right-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl md:text-2xl">
                                        <i className="fas fa-at"></i>
                                    </span>
                                </div>
                                <InputError message={errors.email} className="mt-2 text-right text-base md:text-lg" />
                            </div>

                            {/* Password Field */}
                            <div className="space-y-4">
                                <label className="block text-gray-900 font-bold text-right text-xl md:text-2xl">
                                    <div className="flex items-center mb-3">
                                        <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-3 md:p-4 rounded-xl ml-4">
                                            <i className="fas fa-lock text-blue-600 text-xl md:text-2xl"></i>
                                        </div>
                                        <span>كلمة المرور</span>
                                    </div>
                                </label>
                                <div className="relative">
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        placeholder="أدخل كلمة المرور"
                                        className="w-full border-2 border-gray-300 rounded-2xl px-5 sm:px-6 md:px-7 py-4 md:py-5 focus:outline-none focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-900 text-lg md:text-xl h-14 md:h-16 pr-14 md:pr-16 hover:border-blue-400"
                                        autoComplete="current-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                    />
                                    <span className="absolute right-5 md:right-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl md:text-2xl">
                                        <i className="fas fa-key"></i>
                                    </span>
                                </div>
                                <InputError message={errors.password} className="mt-2 text-right text-base md:text-lg" />
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <label className="flex items-center gap-3 bg-gray-50 px-5 py-3 rounded-xl">
                                    <Checkbox
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded"
                                    />
                                    <span className="text-lg text-gray-800 font-medium">
                                        تذكرني على هذا الجهاز
                                    </span>
                                </label>

                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-blue-600 hover:text-blue-800 font-bold text-lg px-5 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-all duration-300"
                                    >
                                        <i className="fas fa-key ml-2"></i>
                                        نسيت كلمة المرور؟
                                    </Link>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <PrimaryButton
                                    className="w-full justify-center bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-bold py-5 md:py-6 px-8 md:px-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-xl md:text-2xl h-16 md:h-20 transform hover:scale-[1.02]"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin ml-4 text-2xl"></i>
                                            <span className="mr-4">جاري تسجيل الدخول...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-sign-in-alt ml-4 text-2xl"></i>
                                            <span className="mr-4">تسجيل الدخول</span>
                                        </>
                                    )}
                                </PrimaryButton>
                            </div>

                            {/* Registration Link */}
                            <div className="text-center pt-6 border-t border-gray-200">
                                <p className="text-gray-600 text-lg md:text-xl">
                                    ليس لديك حساب؟{' '}
                                    <Link
                                        href={route('register')}
                                        className="text-blue-600 hover:text-blue-800 font-bold text-xl md:text-2xl underline"
                                    >
                                        <i className="fas fa-user-plus ml-2"></i>
                                        إنشاء حساب جديد
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>

                    {/* Features Section for Mobile */}
                    <div className="mt-8 lg:hidden">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-2xl shadow text-center">
                                <i className="fas fa-shield-alt text-2xl text-blue-600 mb-2"></i>
                                <p className="text-sm text-gray-700">حساب آمن</p>
                            </div>
                            <div className="bg-white p-4 rounded-2xl shadow text-center">
                                <i className="fas fa-bolt text-2xl text-blue-600 mb-2"></i>
                                <p className="text-sm text-gray-700">دخول سريع</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Note */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-500 text-sm">
                            © {new Date().getFullYear()} منصة متجرك. جميع الحقوق محفوظة.
                        </p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
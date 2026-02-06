import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
  const [localErrors, setLocalErrors] = useState({});
  const { data, setData, post, processing, errors, reset } = useForm({
    first_name: '',
    email: '',
    phone: '',
    country_code: '+249',
    password: '',
    password_confirmation: '',
    terms_accepted: false,
    is_marketing_subscribed: false,
  });

  const submit = (e) => {
    e.preventDefault();
    setLocalErrors({});

    // Lightweight client-side detection of obvious SQL-like payloads (UX only).
    // Server-side validation is authoritative and required for security.
    const suspiciousSql = /(--|;|\/\*|\*\/|\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC|UNION)\b)/i;
    const toCheck = {
      first_name: data.first_name,
      email: data.email,
      phone: data.phone,
      password: data.password,
    };

    for (const [k, v] of Object.entries(toCheck)) {
      if (typeof v === 'string' && suspiciousSql.test(v)) {
        setLocalErrors({ [k]: 'قيمة غير صالحة' });
        return;
      }
    }

    // Trim / normalize common fields (client-side convenience)
    setData('email', String(data.email || '').trim());
    setData('phone', String(data.phone || '').trim());

    // Preserve existing backend-compatible `name` field (no backend edits requested)
    setData('name', `${data.first_name?.trim() || ''}${data.last_name ? ' ' + data.last_name.trim() : ''}`);

    post(route('register'), {
      onFinish: () => reset('password', 'password_confirmation'),
    });
  };

  return (
    <GuestLayout>
      <Head title="إنشاء حساب تجاري" />

      {/* Main Page Container */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-7xl mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-10 md:mb-14 lg:mb-16">
            {/* Logo/Brand */}
            <div className="flex justify-center mb-6 md:mb-8">
              <div className="inline-flex items-center bg-blue-600 text-white p-4 md:p-5 rounded-2xl shadow-lg">
                <i className="fas fa-store text-3xl md:text-4xl ml-3"></i>
                <span className="text-xl md:text-2xl font-bold">متجرك</span>
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 md:mb-6">
              إنشاء حساب تجاري
            </h1>

            {/* Subtitle */}
            <p className="text-gray-600 text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto mb-6 md:mb-8 px-4 leading-relaxed">
              انضم إلى أكبر منصة للسوق المبوبة وارفع مبيعاتك بنسبة تصل إلى 300%
            </p>

            {/* Login Link */}
            <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 bg-white rounded-2xl px-6 py-4 shadow-md">
              <span className="text-gray-700 text-base md:text-lg font-medium">
                لديك حساب بالفعل؟
              </span>
              <Link 
                href={route('login')} 
                className="text-blue-600 hover:text-blue-800 font-bold text-lg md:text-xl px-5 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-all duration-300"
              >
                <i className="fas fa-sign-in-alt ml-2"></i>
                تسجيل الدخول
              </Link>
            </div>
          </div>

          {/* Main Content Area - Cards Layout */}
          <div className="flex flex-col lg:flex-row gap-8 md:gap-10 lg:gap-12 xl:gap-14">
            
            {/* Left Column - Main Form Card */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                {/* Decorative Background Elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 md:w-28 md:h-28 bg-blue-100 rounded-full opacity-50 z-0"></div>
                <div className="absolute -bottom-4 -left-4 w-24 h-24 md:w-32 md:h-32 bg-blue-100 rounded-full opacity-30 z-0"></div>

                {/* Main Form Card */}
                <form onSubmit={submit} autoComplete="off" noValidate className="relative z-10">
                  {/* Hidden Anti-Autofill Inputs */}
                  <input type="text" name="__username_fake" autoComplete="username" tabIndex={-1} className="hidden" />
                  <input type="password" name="__password_fake" autoComplete="new-password" tabIndex={-1} className="hidden" />

                  {/* Form Container */}
                  <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 lg:p-12 space-y-8 sm:space-y-10">
                    {/* Form Header */}
                    <div className="text-center pb-6 border-b border-gray-200">
                      <div className="inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-full mb-4">
                        <i className="fas fa-user-plus ml-3"></i>
                        <span className="text-lg md:text-xl font-bold">معلومات التسجيل الأساسية</span>
                      </div>
                      <p className="text-gray-600 text-base md:text-lg mt-3">
                        املأ النموذج التالي للبدء في رحلتك التجارية
                      </p>
                    </div>

                    {/* Store Name Field */}
                    <div className="space-y-4">
                      <label className="block text-gray-900 font-bold text-right text-xl md:text-2xl">
                        <div className="flex items-center mb-3">
                          <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-3 md:p-4 rounded-xl ml-4">
                            <i className="fas fa-store text-blue-600 text-xl md:text-2xl"></i>
                          </div>
                          <span>اسم المحل التجاري</span>
                        </div>
                      </label>
                      <div className="relative">
                        <TextInput
                          value={data.first_name}
                          placeholder="أدخل اسم المحل التجاري..."
                          className="w-full border-2 border-gray-300 rounded-2xl px-5 sm:px-6 md:px-7 py-4 md:py-5 focus:outline-none focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-900 text-lg md:text-xl h-14 md:h-16 pr-14 md:pr-16 hover:border-blue-400"
                          onChange={(e) => setData('first_name', e.target.value)}
                          required
                        />
                        <span className="absolute right-5 md:right-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl md:text-2xl">
                          <i className="fas fa-building"></i>
                        </span>
                      </div>
                      <InputError message={errors.first_name || localErrors.first_name} className="mt-2 text-right text-base md:text-lg" />
                    </div>

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
                          name="email"
                          type="email"
                          autoComplete="off"
                          value={data.email}
                          placeholder="example@domain.com"
                          className="w-full border-2 border-gray-300 rounded-2xl px-5 sm:px-6 md:px-7 py-4 md:py-5 focus:outline-none focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-900 text-lg md:text-xl h-14 md:h-16 pr-14 md:pr-16 hover:border-blue-400"
                          onChange={(e) => setData('email', e.target.value)}
                          required
                        />
                        <span className="absolute right-5 md:right-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl md:text-2xl">
                          <i className="fas fa-at"></i>
                        </span>
                      </div>
                      <InputError message={errors.email || localErrors.email} className="mt-2 text-right text-base md:text-lg" />
                    </div>

                    {/* Phone Field */}
                    <div className="space-y-4">
                      <label className="block text-gray-900 font-bold text-right text-xl md:text-2xl">
                        <div className="flex items-center mb-3">
                          <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-3 md:p-4 rounded-xl ml-4">
                            <i className="fas fa-phone text-blue-600 text-xl md:text-2xl"></i>
                          </div>
                          <span>رقم الهاتف</span>
                        </div>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Country Code */}
                        <div className="relative">
                          <select
                            autoComplete="off"
                            className="w-full border-2 border-gray-300 rounded-2xl px-4 md:px-5 py-4 md:py-5 appearance-none focus:outline-none focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white text-gray-900 text-lg md:text-xl h-14 md:h-16 hover:border-blue-400"
                            value={data.country_code}
                            onChange={(e) => setData('country_code', e.target.value)}
                          >
                            <option value="+249" className="text-lg">🇸🇩 +249 السودان</option>
                            <option value="+966" className="text-lg">🇸🇦 +966 السعودية</option>

                          </select>
                          <span className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-gray-500 text-xl">
                            <i className="fas fa-chevron-down"></i>
                          </span>
                        </div>
                        
                        {/* Phone Number */}
                        <div className="relative sm:col-span-2">
                          <TextInput
                            type="tel"
                            name="phone"
                            inputMode="tel"
                            maxLength={20}
                            autoComplete="tel-national"
                            placeholder="رقم الواتساب للتواصل"
                            value={data.phone}
                            className="w-full border-2 border-gray-300 rounded-2xl px-5 sm:px-6 md:px-7 py-4 md:py-5 focus:outline-none focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-900 text-lg md:text-xl h-14 md:h-16 pr-14 md:pr-16 hover:border-blue-400"
                            onChange={(e) => setData('phone', e.target.value)}
                            required
                          />
                          <span className="absolute right-5 md:right-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl md:text-2xl">
                            <i className="fas fa-mobile-alt"></i>
                          </span>
                        </div>
                      </div>
                      <InputError message={errors.phone || localErrors.phone} className="mt-2 text-right text-base md:text-lg" />
                    </div>

                    {/* Password Fields Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
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
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            value={data.password}
                            placeholder="أنشئ كلمة مرور قوية"
                            className="w-full border-2 border-gray-300 rounded-2xl px-5 sm:px-6 md:px-7 py-4 md:py-5 focus:outline-none focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-900 text-lg md:text-xl h-14 md:h-16 pr-14 md:pr-16 hover:border-blue-400"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                          />
                          <span className="absolute right-5 md:right-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl md:text-2xl">
                            <i className="fas fa-key"></i>
                          </span>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mt-3">
                          <p className="text-blue-800 text-base md:text-lg font-medium mb-2 flex items-center">
                            <i className="fas fa-shield-alt ml-2"></i>
                            متطلبات الأمان:
                          </p>
                          <ul className="space-y-1 mr-5">
                            <li className="text-gray-700 text-sm md:text-base flex items-center">
                              <i className="fas fa-check text-green-500 ml-2 text-sm"></i>
                              6 أحرف على الأقل
                            </li>
                            <li className="text-gray-700 text-sm md:text-base flex items-center">
                              <i className="fas fa-check text-green-500 ml-2 text-sm"></i>
                              مزيج من أحرف وأرقام
                            </li>
                          </ul>
                        </div>
                        <InputError message={errors.password || localErrors.password} className="mt-2 text-right text-base md:text-lg" />
                      </div>

                      {/* Confirm Password Field */}
                      <div className="space-y-4">
                        <label className="block text-gray-900 font-bold text-right text-xl md:text-2xl">
                          <div className="flex items-center mb-3">
                            <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-3 md:p-4 rounded-xl ml-4">
                              <i className="fas fa-lock text-blue-600 text-xl md:text-2xl"></i>
                            </div>
                            <span>تأكيد كلمة المرور</span>
                          </div>
                        </label>
                        <div className="relative">
                          <TextInput
                            name="password_confirmation"
                            type="password"
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            placeholder="أعد إدخال كلمة المرور"
                            className="w-full border-2 border-gray-300 rounded-2xl px-5 sm:px-6 md:px-7 py-4 md:py-5 focus:outline-none focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-900 text-lg md:text-xl h-14 md:h-16 pr-14 md:pr-16 hover:border-blue-400"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                          />
                          <span className="absolute right-5 md:right-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl md:text-2xl">
                            <i className="fas fa-key"></i>
                          </span>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl border border-green-200 mt-3">
                          <p className="text-green-800 text-base md:text-lg font-medium flex items-center">
                            <i className="fas fa-check-circle ml-2"></i>
                            تأكد من تطابق كلمتي المرور
                          </p>
                        </div>
                        <InputError message={errors.password_confirmation || localErrors.password_confirmation} className="mt-2 text-right text-base md:text-lg" />
                      </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="space-y-6 pt-6 border-t border-gray-200">
                      {/* Terms Checkbox */}
                      <div className="flex items-start space-x-4 space-x-reverse bg-blue-50 p-5 md:p-6 rounded-2xl">
                        <div className="flex items-center h-8 mt-1">
                          <input
                            id="terms_accepted"
                            type="checkbox"
                            checked={data.terms_accepted}
                            onChange={(e) => setData('terms_accepted', e.target.checked)}
                            className="w-6 h-6 md:w-7 md:h-7 rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-3 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <label htmlFor="terms_accepted" className="flex-1 text-lg md:text-xl text-gray-900 leading-relaxed">
                          أوافق على{' '}
                          <Link href="#" className="text-blue-600 hover:text-blue-800 font-bold underline">
                            الشروط والأحكام
                          </Link>{' '}
                          و{' '}
                          <Link href="#" className="text-blue-600 hover:text-blue-800 font-bold underline">
                            سياسة الخصوصية
                          </Link>{' '}
                          الخاصة بالمنصة
                        </label>
                      </div>
                      <InputError message={errors.terms_accepted || localErrors.terms_accepted} className="text-right text-base md:text-lg" />

                      {/* Marketing Checkbox */}
                      <div className="flex items-start space-x-4 space-x-reverse bg-gray-50 p-5 md:p-6 rounded-2xl">
                        <div className="flex items-center h-8 mt-1">
                          <input
                            id="is_marketing_subscribed"
                            type="checkbox"
                            checked={data.is_marketing_subscribed}
                            onChange={(e) => setData('is_marketing_subscribed', e.target.checked)}
                            className="w-6 h-6 md:w-7 md:h-7 rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-3 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <label htmlFor="is_marketing_subscribed" className="flex-1 text-lg md:text-xl text-gray-900 leading-relaxed">
                          أرغب في الاشتراك في النشرة البريدية لتلقي العروض الحصرية والتحديثات
                        </label>
                      </div>
                    </div>

                    {/* Submit Button Section */}
                    <div className="pt-6">
                      <PrimaryButton 
                        disabled={processing} 
                        className="w-full justify-center bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-bold py-5 md:py-6 px-8 md:px-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-xl md:text-2xl h-16 md:h-20 transform hover:scale-[1.02]"
                      >
                        {processing ? (
                          <>
                            <i className="fas fa-spinner fa-spin ml-4 text-2xl"></i>
                            <span className="mr-4">جاري إنشاء الحساب...</span>
                          </>
                        ) : (
                          <>
                            <i className="fas fa-rocket ml-4 text-2xl"></i>
                            <span className="mr-4">إنشاء حساب تجاري</span>
                          </>
                        )}
                      </PrimaryButton>

                      {/* Login Link Footer */}
                      <div className="text-center mt-8 pt-6 border-t border-gray-200">
                        <p className="text-gray-600 text-lg md:text-xl">
                          لديك حساب بالفعل؟{' '}
                          <Link 
                            href={route('login')} 
                            className="text-blue-600 hover:text-blue-800 font-bold text-xl md:text-2xl underline"
                          >
                            تسجيل الدخول إلى حسابك
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column - Benefits Card */}
            <div className="lg:w-2/5 xl:w-1/3">
              <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 lg:p-12 h-full">
                {/* Benefits Header */}
                <div className="text-center mb-8 md:mb-10">
                  <div className="inline-flex items-center bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-full mb-4">
                    <i className="fas fa-award ml-3"></i>
                    <span className="text-lg md:text-xl font-bold">مزايا الحساب التجاري</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    لماذا تختارنا؟
                  </h3>
                  <p className="text-gray-600 text-lg">
                    اكتشف الفوائد التي تجعلنا المنصة المفضلة
                  </p>
                </div>

                {/* Benefits List */}
                <div className="space-y-8 md:space-y-10">
                  {/* Benefit 1 */}
                  <div className="bg-gradient-to-r from-blue-50 to-white p-5 md:p-6 rounded-2xl border-2 border-blue-100 hover:border-blue-300 transition-all duration-300">
                    <div className="flex items-center mb-5">
                      <div className="bg-blue-600 text-white p-4 rounded-xl ml-4">
                        <i className="fas fa-bullhorn text-2xl md:text-3xl"></i>
                      </div>
                      <div>
                        <h4 className="text-xl md:text-2xl font-bold text-gray-900">إعلانات مجانية</h4>
                        <p className="text-blue-600 text-lg font-medium mt-1">بدون رسوم</p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      انشر إعلاناتك بدون أي رسوم إضافية مع وصول مباشر إلى آلاف المشترين المحتملين يومياً.
                    </p>
                    <ul className="mt-4 space-y-2">
                      <li className="flex items-center text-gray-600">
                        <i className="fas fa-check text-green-500 ml-2"></i>
                        <span>بدون عمولات على المبيعات</span>
                      </li>
                      <li className="flex items-center text-gray-600">
                        <i className="fas fa-check text-green-500 ml-2"></i>
                        <span>إعلانات غير محدودة</span>
                      </li>
                    </ul>
                  </div>

                  {/* Benefit 2 */}
                  <div className="bg-gradient-to-r from-green-50 to-white p-5 md:p-6 rounded-2xl border-2 border-green-100 hover:border-green-300 transition-all duration-300">
                    <div className="flex items-center mb-5">
                      <div className="bg-green-600 text-white p-4 rounded-xl ml-4">
                        <i className="fas fa-shield-alt text-2xl md:text-3xl"></i>
                      </div>
                      <div>
                        <h4 className="text-xl md:text-2xl font-bold text-gray-900">حماية كاملة</h4>
                        <p className="text-green-600 text-lg font-medium mt-1">أمان مضمون</p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      بياناتك محمية بأحدث تقنيات التشفير مع فريق مختص لمراقبة الجودة والأمان.
                    </p>
                    <ul className="mt-4 space-y-2">
                      <li className="flex items-center text-gray-600">
                        <i className="fas fa-check text-green-500 ml-2"></i>
                        <span>شهادات أمان معتمدة</span>
                      </li>
                      <li className="flex items-center text-gray-600">
                        <i className="fas fa-check text-green-500 ml-2"></i>
                        <span>حماية ضد الاحتيال</span>
                      </li>
                    </ul>
                  </div>

                  {/* Benefit 3 */}
                  <div className="bg-gradient-to-r from-purple-50 to-white p-5 md:p-6 rounded-2xl border-2 border-purple-100 hover:border-purple-300 transition-all duration-300">
                    <div className="flex items-center mb-5">
                      <div className="bg-purple-600 text-white p-4 rounded-xl ml-4">
                        <i className="fas fa-headset text-2xl md:text-3xl"></i>
                      </div>
                      <div>
                        <h4 className="text-xl md:text-2xl font-bold text-gray-900">دعم مميز</h4>
                        <p className="text-purple-600 text-lg font-medium mt-1">24/7</p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      فريق دعم فني متخصص على مدار الساعة لتقديم المساعدة الفورية لحل أي مشكلة تواجهك.
                    </p>
                    <ul className="mt-4 space-y-2">
                      <li className="flex items-center text-gray-600">
                        <i className="fas fa-check text-green-500 ml-2"></i>
                        <span>سرعة استجابة خلال دقائق</span>
                      </li>
                      <li className="flex items-center text-gray-600">
                        <i className="fas fa-check text-green-500 ml-2"></i>
                        <span>دعم عربي متخصص</span>
                      </li>
                    </ul>
                  </div>

                  {/* Stats Section */}
                  <div className="bg-gradient-to-r from-gray-50 to-white p-6 md:p-8 rounded-2xl border-2 border-gray-200">
                    <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 text-center">إحصائيات مذهلة</h4>
                    <div className="grid grid-cols-3 gap-4 md:gap-6">
                      <div className="text-center bg-white p-4 rounded-xl shadow-sm">
                        <div className="text-3xl md:text-4xl font-bold text-blue-600">75K+</div>
                        <div className="text-gray-600 mt-2 text-sm md:text-base">مستخدم</div>
                      </div>
                      <div className="text-center bg-white p-4 rounded-xl shadow-sm">
                        <div className="text-3xl md:text-4xl font-bold text-blue-600">200K+</div>
                        <div className="text-gray-600 mt-2 text-sm md:text-base">إعلان</div>
                      </div>
                      <div className="text-center bg-white p-4 rounded-xl shadow-sm">
                        <div className="text-3xl md:text-4xl font-bold text-blue-600">98%</div>
                        <div className="text-gray-600 mt-2 text-sm md:text-base">رضا</div>
                      </div>
                    </div>
                    <div className="mt-6 text-center">
                      <div className="inline-flex items-center bg-gradient-to-r from-yellow-50 to-yellow-100 px-6 py-3 rounded-full border border-yellow-200">
                        <i className="fas fa-star text-yellow-500 ml-2 text-xl"></i>
                        <span className="text-gray-800 text-lg font-medium">تقييم 4.9/5 من 10,000+ تقييم</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile-Only Features */}
          <div className="mt-10 md:mt-12 lg:hidden">
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-3xl p-8 text-center text-white shadow-2xl">
              <div className="flex justify-center mb-6">
                <div className="bg-white bg-opacity-20 p-4 rounded-2xl">
                  <i className="fas fa-bolt text-3xl"></i>
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">جاهز لبدء رحلتك التجارية؟</h3>
              <p className="text-lg md:text-xl mb-6 opacity-90">
                أنشئ حسابك الآن وابدأ بيع منتجاتك خلال دقائق بدون أي تعقيدات
              </p>
              <button 
                onClick={() => document.querySelector('form').scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-blue-600 font-bold text-xl px-10 py-4 rounded-2xl hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <i className="fas fa-play ml-3"></i>
                ابدأ الآن مجاناً
              </button>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm md:text-base">
              © {new Date().getFullYear()} منصة متجرك. جميع الحقوق محفوظة.
              <span className="mx-2">•</span>
              <Link href="#" className="text-gray-600 hover:text-blue-600">
                سياسة الخصوصية
              </Link>
              <span className="mx-2">•</span>
              <Link href="#" className="text-gray-600 hover:text-blue-600">
                الشروط والأحكام
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Font Awesome CDN */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      
      {/* Inline Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');
        
        body {
          font-family: 'Cairo', sans-serif;
          direction: rtl;
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #f9fafb 0%, #ffffff 50%, #eff6ff 100%);
          min-height: 100vh;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #2563eb;
        }

        /* Animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        /* Focus Styles */
        input:focus, select:focus, textarea:focus {
          outline: 2px solid transparent;
          outline-offset: 2px;
        }

        /* Smooth Transitions */
        .transition-all {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 300ms;
        }

        /* Responsive Adjustments */
        @media (max-width: 640px) {
          .h-16 {
            height: 4rem;
          }
          .pr-16 {
            padding-right: 4rem;
          }
        }

        @media (min-width: 641px) and (max-width: 768px) {
          .h-16 {
            height: 4.5rem;
          }
          .pr-16 {
            padding-right: 4.5rem;
          }
        }

        @media (min-width: 769px) {
          .h-16 {
            height: 5rem;
          }
          .pr-16 {
            padding-right: 5rem;
          }
        }
      `}</style>
    </GuestLayout>
  );
}
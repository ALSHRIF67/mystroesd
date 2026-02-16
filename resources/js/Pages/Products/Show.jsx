import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { useState } from 'react';

export default function Show({ product }) {
    const { title, description, price, image, location, phone } = product;
    const [imageError, setImageError] = useState(false);

    // دمج معلومات البائع
    const seller = product.user || product.seller || { name: 'بائع مجهول', phone: null };
    const contactPhone = phone || seller.phone || null;

    // تنظيف الرقم لاستخدامه في واتساب
    const cleanPhone = contactPhone ? String(contactPhone).replace(/\D/g, '') : null;
    const whatsappLink = cleanPhone
        ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent('مرحباً، أود الاستفسار عن المنتج: ' + title)}`
        : null;
    const callLink = contactPhone ? `tel:${contactPhone}` : null;

    // Resolve image source: prefer `image_url` accessor added by model,
    // fall back to storage path for filenames, and finally a placeholder.
    const imageUrl = product.image_url || (image ? `/storage/products/${image}` : null) || '/images/placeholder-product.png';

    return (
        <GuestLayout>
            <Head title={title} />

            <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* صورة المنتج */}
                        <div className="relative h-72 md:h-[500px] bg-gray-100">
                            {imageUrl && !imageError ? (
                                <img
                                    src={imageUrl}
                                    alt={title}
                                    className="w-full h-full object-cover"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <i className="fas fa-image text-6xl text-gray-400"></i>
                                    <span className="sr-only">لا توجد صورة</span>
                                </div>
                            )}
                        </div>

                        {/* محتوى المنتج */}
                        <div className="p-6 md:p-10 space-y-8">
                            {/* 1. عنوان المنتج */}
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                                {title}
                            </h1>

                            {/* 2. الوصف */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    تفاصيل الإعلان
                                </h3>
                                <p className="whitespace-pre-line leading-relaxed text-gray-700">
                                    {description || 'لا يوجد وصف متاح'}
                                </p>
                            </div>

                            {/* 3. السعر والموقع */}
                            <div className="flex items-center justify-between">
                                <p className="text-2xl font-semibold text-red-600">
                                    {price}
                                </p>
                                {location && (
                                    <p className="flex items-center gap-1 text-gray-600">
                                        <i className="fas fa-map-marker-alt"></i>
                                        <span>{location}</span>
                                    </p>
                                )}
                            </div>

                            {/* 4. معلومات البائع */}
                            <div className="bg-gray-50 rounded-2xl p-5 border">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">
                                    معلومات البائع
                                </h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
                                        <i className="fas fa-user"></i>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-lg">
                                            {seller.name}
                                        </p>
                                        {seller.phone && (
                                            <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                                                <i className="fas fa-phone-alt text-gray-400"></i>
                                                {seller.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 5. أزرار الاتصال */}
                            {contactPhone && (
                                <div className="space-y-4 pt-4">
                                    <a
                                        href={whatsappLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full flex flex-row-reverse items-center justify-center gap-3 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition text-lg"
                                    >
                                        <i className="fab fa-whatsapp text-xl"></i>
                                        <span>تواصل عبر واتساب</span>
                                    </a>
                                    <a
                                        href={callLink}
                                        className="w-full flex flex-row-reverse items-center justify-center gap-3 py-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition text-lg"
                                    >
                                        <i className="fas fa-phone-alt"></i>
                                        <span>اتصل بالبائع</span>
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
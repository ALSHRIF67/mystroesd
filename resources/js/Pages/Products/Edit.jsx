import { useState } from 'react';
import { useForm, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Edit({ product, categories }) {
    const { data, setData, put, processing, errors } = useForm({
        title: product.title,
        description: product.description || '',
        price: product.price,
        category_id: product.category_id,
        image: null,
    });

    const [previewImage, setPreviewImage] = useState(product.image_url);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('products.update', product.id));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setData('image', null);
        setPreviewImage(null);
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">تعديل المنتج</h2>}
        >
            <Head title="تعديل المنتج" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold">تعديل المنتج</h2>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">قم بتعديل بيانات المنتج أدناه.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        عنوان المنتج
                                    </label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                                        required
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        الوصف
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        rows="4"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Category */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            الفئة
                                        </label>
                                        <select
                                            value={data.category_id}
                                            onChange={e => setData('category_id', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                                            required
                                        >
                                            <option value="">اختر الفئة</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category_id && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category_id}</p>
                                        )}
                                    </div>

                                    {/* Price */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            السعر
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.price}
                                            onChange={e => setData('price', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                                            required
                                        />
                                        {errors.price && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.price}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Image */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        صورة المنتج (اختياري)
                                    </label>
                                    <div className="space-y-4">
                                        {/* Current Image Preview */}
                                        {previewImage && (
                                            <div className="relative inline-block">
                                                <img
                                                    src={previewImage}
                                                    alt="معاينة الصورة"
                                                    className="w-48 h-48 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="absolute top-2 left-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        )}

                                        {/* File Input */}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                                        />
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        اترك الحقل فارغاً للحفاظ على الصورة الحالية. المسموح: JPEG, PNG, JPG, GIF. الحد الأقصى: 2MB
                                    </p>
                                    {errors.image && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.image}</p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        سيتم استبدال الصورة القديمة عند رفع صورة جديدة
                                    </div>
                                    
                                    <div className="flex space-x-3">
                                        <a
                                            href={route('products.index')}
                                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                                        >
                                            رجوع
                                        </a>
                                        
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {processing ? (
                                                <span className="flex items-center">
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    جاري التحديث...
                                                </span>
                                            ) : 'تحديث المنتج'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
import { useState, useEffect, useRef } from 'react';
import { useForm, Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create({ categories = [], auth }) {
    console.log('Create component loaded with categories:', categories);

    // Access guard: only sellers can create products
    useEffect(() => {
        if (auth && auth.user && auth.user.role && auth.user.role !== 'seller') {
            // Redirect non-sellers to dashboard
            router.visit(route('dashboard'));
        }
    }, []);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        price: '',
        negotiable: false,
        category_id: '',
        subcategory_id: '',
        tags: '',
        email: auth?.user?.email || '',
        phone: '',
        country_code: '+249',
        images: [],
    });

    const saveDraft = (e) => {
        e?.preventDefault();
        setErrorMessage('');

        const formData = new FormData();
        const formDataFields = {
            title: data.title,
            description: data.description,
            price: data.price,
            negotiable: data.negotiable ? 1 : 0,
            category_id: data.category_id,
            subcategory_id: data.subcategory_id,
            tags: data.tags,
            email: data.email,
            phone: data.phone,
            country_code: data.country_code || '+249',
            status: 'draft',
        };

        Object.keys(formDataFields).forEach(key => {
            if (formDataFields[key] !== undefined && formDataFields[key] !== null) {
                formData.append(key, formDataFields[key]);
            }
        });

        if (data.images && data.images.length > 0) {
            data.images.forEach((file, index) => {
                if (file instanceof File) {
                    formData.append(`images[${index}]`, file);
                }
            });

            if (data.images[0] instanceof File) {
                formData.append('image', data.images[0]);
            }
        }

        router.post(route('products.store'), formData, {
            forceFormData: true,
            onStart: () => setIsLoading(true),
            onSuccess: () => {
                setIsLoading(false);
                reset();
                setImagePreviews([]);
                router.visit(route('products.mine'));
            },
            onError: (errors) => {
                setIsLoading(false);
                if (errors.message) setErrorMessage(errors.message);
            }
        });
    };

    const [subcategories, setSubcategories] = useState([]);
    const [activeStep, setActiveStep] = useState(1);
    const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
    const [toolbarActive, setToolbarActive] = useState({
        bold: false,
        italic: false,
        underline: false,
        list: false,
    });
    const [imagePreviews, setImagePreviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);

    const fileInputRef = useRef();
    const descriptionRef = useRef();

    // جلب الأقسام الفرعية عند تغيير القسم
    useEffect(() => {
        if (data.category_id) {
            setIsLoading(true);
            fetch(`/api/subcategories/${data.category_id}`)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    console.log('Fetched subcategories:', data);
                    setSubcategories(Array.isArray(data) ? data : []);
                    setIsLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching subcategories:', error);
                    setIsLoading(false);
                    setErrorMessage('حدث خطأ في جلب الأقسام الفرعية');
                    setSubcategories([]);
                });
        } else {
            setSubcategories([]);
            setData('subcategory_id', '');
        }
    }, [data.category_id]);

    // تنظيف object URLs عند إلغاء المكون
    useEffect(() => {
        return () => {
            imagePreviews.forEach(preview => {
                if (preview?.url) URL.revokeObjectURL(preview.url);
            });
        };
    }, [imagePreviews]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage('');
        
        if (activeStep === 4) {
            // التحقق من البيانات المطلوبة
            if (!data.title.trim()) {
                setErrorMessage('يرجى إدخال عنوان المنتج');
                setActiveStep(1);
                return;
            }
            if (!data.category_id) {
                setErrorMessage('يرجى اختيار القسم');
                setActiveStep(1);
                return;
            }
            if (!data.price || data.price <= 0) {
                setErrorMessage('يرجى إدخال سعر صحيح');
                setActiveStep(1);
                return;
            }

            // إنشاء FormData لإرسال الملفات
            const formData = new FormData();

            // إضافة البيانات النصية (تحويل القيم البوليانية إلى أرقام)
            const formDataFields = {
                title: data.title,
                description: data.description,
                price: data.price,
                negotiable: data.negotiable ? 1 : 0,
                category_id: data.category_id,
                subcategory_id: data.subcategory_id,
                tags: data.tags,
                email: data.email,
                phone: data.phone,
                country_code: data.country_code || '+249',
            };

            Object.keys(formDataFields).forEach(key => {
                if (formDataFields[key] !== undefined && formDataFields[key] !== null) {
                    formData.append(key, formDataFields[key]);
                }
            });

            // إضافة الصور
            if (data.images && data.images.length > 0) {
                data.images.forEach((file, index) => {
                    if (file instanceof File) {
                        formData.append(`images[${index}]`, file);
                    }
                });

                // إضافة الصورة الرئيسية (الأولى)
                if (data.images[0] instanceof File) {
                    formData.append('image', data.images[0]);
                }
            }

            // إرسال البيانات باستخدام Inertia
            router.post(route('products.store'), formData, {
                forceFormData: true,
                onStart: () => setIsLoading(true),
                onSuccess: () => {
                    setIsLoading(false);
                    reset();
                    setImagePreviews([]);
                },
                onError: (errors) => {
                    setIsLoading(false);
                    console.error('Form errors:', errors);
                    if (errors.message) {
                        setErrorMessage(errors.message);
                    }
                },
            });
        } else {
            handleNextStep();
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
        const maxSize = 2 * 1024 * 1024; // 2MB

        // تحديد الحد الأقصى للصور
        const remainingSlots = 10 - data.images.length;
        const filesToConsider = files.slice(0, remainingSlots);

        const validFiles = [];
        const newPreviews = [];

        filesToConsider.forEach(file => {
            if (!allowedTypes.includes(file.type)) {
                setErrorMessage('نوع الملف غير مدعوم. استخدم JPEG, PNG, GIF أو WEBP.');
                return;
            }
            if (file.size > maxSize) {
                setErrorMessage('تجاوز حجم الملف الحد الأقصى 2MB لكل صورة.');
                return;
            }

            validFiles.push(file);
            newPreviews.push({ file, url: URL.createObjectURL(file) });
        });

        if (validFiles.length === 0) return;

        setImagePreviews(prev => [...prev, ...newPreviews]);
        setData('images', [...data.images, ...validFiles]);

        // إعادة تعيين input file للسماح باختيار نفس الملفات مرة أخرى
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeImage = (index) => {
        // تحرير object URL
        if (imagePreviews[index]?.url) {
            URL.revokeObjectURL(imagePreviews[index].url);
        }
        
        const newImages = data.images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        
        setData('images', newImages);
        setImagePreviews(newPreviews);
    };

    const handleNextStep = () => {
        // التحقق من صحة البيانات قبل الانتقال للخطوة التالية
        let valid = true;
        
        switch(activeStep) {
            case 1:
                if (!data.title.trim()) {
                    setErrorMessage('يرجى إدخال عنوان المنتج');
                    valid = false;
                }
                if (!data.category_id) {
                    setErrorMessage('يرجى اختيار القسم');
                    valid = false;
                }
                break;
            case 2:
                if (!data.email.trim() && !data.phone.trim()) {
                    setErrorMessage('يرجى إدخال وسيلة اتصال واحدة على الأقل');
                    valid = false;
                }
                break;
            case 3:
                if (data.images.length === 0) {
                    setErrorMessage('يرجى إضافة صورة واحدة على الأقل');
                    valid = false;
                }
                break;
        }
        
        if (valid) {
            setErrorMessage('');
            setActiveStep(activeStep + 1);
        }
    };

    const handlePrevStep = () => {
        if (activeStep > 1) {
            setActiveStep(activeStep - 1);
            setErrorMessage('');
        }
    };

    const handleToolbarClick = (format) => {
        if (descriptionRef.current) {
            const selection = window.getSelection();
            if (selection.rangeCount === 0) return;
            
            const range = selection.getRangeAt(0);
            
            try {
                if (format === 'list') {
                    const listItem = document.createElement('li');
                    listItem.appendChild(range.extractContents());
                    const list = document.createElement('ul');
                    list.setAttribute('dir', 'rtl');
                    list.appendChild(listItem);
                    range.insertNode(list);
                } else {
                    const tag = format === 'bold' ? 'strong' : 
                               format === 'italic' ? 'em' : 
                               format === 'underline' ? 'u' : format;
                    const formattedNode = document.createElement(tag);
                    const contents = range.extractContents();
                    if (contents) {
                        formattedNode.appendChild(contents);
                    }
                    range.insertNode(formattedNode);
                }
                
                setData('description', descriptionRef.current.innerHTML);
                setToolbarActive(prev => ({ ...prev, [format]: !prev[format] }));
            } catch (error) {
                console.error('Error formatting text:', error);
            }
        }
    };

    // إضافة نص مؤقت في منطقة التحرير
    const setDescriptionPlaceholder = () => {
        if (descriptionRef.current) {
            if (!descriptionRef.current.innerHTML.trim() || 
                descriptionRef.current.innerHTML.includes('صِف منتجك بالتفصيل')) {
                descriptionRef.current.innerHTML = 
                    '<p style="color: #9ca3af; text-align: right; padding: 1rem;">' +
                    'صِف منتجك بالتفصيل: المميزات، الحالة، الاستخدام، وأي معلومات أخرى مهمة للمشتري...' +
                    '</p>';
            }
        }
    };

    // إزالة النص المؤقت عند التركيز
    const handleDescriptionFocus = () => {
        setIsDescriptionFocused(true);
        if (descriptionRef.current) {
            const content = descriptionRef.current.innerHTML;
            if (content.includes('صِف منتجك بالتفصيل')) {
                descriptionRef.current.innerHTML = '';
            }
        }
    };

    // تهيئة النص المؤقت عند التحميل
    useEffect(() => {
        if (descriptionRef.current && !data.description) {
            setDescriptionPlaceholder();
        }
    }, []);

    // العثور على اسم القسم
    const getCategoryName = () => {
        if (!categories || !Array.isArray(categories)) return "غير محدد";
        const category = categories.find(c => c.id == data.category_id);
        return category?.name || "غير محدد";
    };

    const renderStepContent = () => {
        switch(activeStep) {
            case 1:
                return (
                    <div className="space-y-8">
                        {/* اختيار القسم */}
                        <div>
                            <label className="block text-gray-800 font-semibold mb-3 text-right">
                                <span className="text-blue-600 ml-2">●</span>
                                القسم
                            </label>
                            <div className="relative">
                                <select 
                                    value={data.category_id}
                                    onChange={e => setData('category_id', e.target.value)}
                                    required
                                    className="w-full border-2 border-gray-200 rounded-2xl py-4 pr-14 pl-5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800 text-lg shadow-sm hover:border-gray-300"
                                    dir="rtl"
                                >
                                    <option value="">اختر القسم المناسب</option>
                                    {Array.isArray(categories) && categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                                    <i className="fas fa-chevron-down"></i>
                                </span>
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-blue-500 text-lg">
                                    <i className="fas fa-folder"></i>
                                </span>
                            </div>
                            {errors.category_id && (
                                <p className="mt-2 text-sm text-red-600 text-right">{errors.category_id}</p>
                            )}
                        </div>

                        {/* القسم الفرعي */}
                        {subcategories.length > 0 && (
                            <div>
                                <label className="block text-gray-800 font-semibold mb-3 text-right">
                                    <span className="text-blue-400 ml-2">●</span>
                                    القسم الفرعي
                                </label>
                                <div className="relative">
                                    <select 
                                        value={data.subcategory_id}
                                        onChange={e => setData('subcategory_id', e.target.value)}
                                        className="w-full border-2 border-gray-200 rounded-2xl py-4 pr-14 pl-5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800 text-lg shadow-sm hover:border-gray-300"
                                        dir="rtl"
                                    >
                                        <option value="">اختر قسم فرعي</option>
                                        {subcategories.map(subcategory => (
                                            <option key={subcategory.id} value={subcategory.id}>
                                                {subcategory.name}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                                        <i className="fas fa-chevron-down"></i>
                                    </span>
                                </div>
                                {errors.subcategory_id && (
                                    <p className="mt-2 text-sm text-red-600 text-right">{errors.subcategory_id}</p>
                                )}
                            </div>
                        )}

                        {/* العنوان */}
                        <div>
                            <label className="block text-gray-800 font-semibold mb-3 text-right">
                                <span className="text-blue-600 ml-2">●</span>
                                العنوان
                            </label>
                            <input 
                                type="text"
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                placeholder="أدخل عنوانًا واضحًا وجذابًا للإعلان"
                                required
                                className="w-full border-2 border-gray-200 rounded-2xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 text-lg shadow-sm hover:border-gray-300 placeholder:text-gray-400"
                                dir="rtl"
                            />
                            <p className="text-gray-500 text-sm mt-2 text-right">
                                اختر عنوانًا واضحًا يصف منتجك بدقة
                            </p>
                            {errors.title && (
                                <p className="mt-2 text-sm text-red-600 text-right">{errors.title}</p>
                            )}
                        </div>

                        {/* الوصف - محسن */}
                        <div>
                            <label className="block text-gray-800 font-semibold mb-3 text-right">
                                <span className="text-blue-600 ml-2">●</span>
                                الوصف
                            </label>
                            <div className={`border-2 ${isDescriptionFocused ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'} rounded-2xl overflow-hidden shadow-sm transition-all duration-200`}>
                                {/* شريط الأدوات */}
                                <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 p-3 flex flex-wrap gap-2 justify-end">
                                    <button 
                                        type="button" 
                                        onClick={() => handleToolbarClick('bold')}
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${toolbarActive.bold ? 'bg-blue-100 text-blue-600 border border-blue-200' : 'text-gray-600 hover:bg-gray-100 border border-transparent'}`}
                                        title="نص عريض"
                                    >
                                        <i className="fas fa-bold text-lg"></i>
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => handleToolbarClick('italic')}
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${toolbarActive.italic ? 'bg-blue-100 text-blue-600 border border-blue-200' : 'text-gray-600 hover:bg-gray-100 border border-transparent'}`}
                                        title="نص مائل"
                                    >
                                        <i className="fas fa-italic text-lg"></i>
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => handleToolbarClick('underline')}
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${toolbarActive.underline ? 'bg-blue-100 text-blue-600 border border-blue-200' : 'text-gray-600 hover:bg-gray-100 border border-transparent'}`}
                                        title="نص مسطر"
                                    >
                                        <i className="fas fa-underline text-lg"></i>
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => handleToolbarClick('list')}
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${toolbarActive.list ? 'bg-blue-100 text-blue-600 border border-blue-200' : 'text-gray-600 hover:bg-gray-100 border border-transparent'}`}
                                        title="قائمة نقطية"
                                    >
                                        <i className="fas fa-list-ul text-lg"></i>
                                    </button>
                                </div>
                                
                                {/* منطقة النص المحسن */}
                                <div 
                                    ref={descriptionRef}
                                    contentEditable="true"
                                    onFocus={handleDescriptionFocus}
                                    onBlur={() => {
                                        setIsDescriptionFocused(false);
                                        setData('description', descriptionRef.current.innerHTML);
                                        setDescriptionPlaceholder();
                                    }}
                                    className="min-h-40 p-6 focus:outline-none text-gray-800 text-lg bg-white placeholder:text-gray-400 leading-relaxed"
                                    dir="rtl"
                                    style={{ 
                                        minHeight: '160px',
                                        lineHeight: '1.8'
                                    }}
                                />
                            </div>
                            <div className="flex justify-between items-center mt-3">
                                <p className="text-gray-500 text-sm">
                                    يمكنك استخدام أدوات التنسيق أعلاه لتحسين مظهر الوصف
                                </p>
                                <p className="text-gray-400 text-sm">
                                    {data.description?.replace(/<[^>]*>/g, '').length || 0} حرف
                                </p>
                            </div>
                            {errors.description && (
                                <p className="mt-2 text-sm text-red-600 text-right">{errors.description}</p>
                            )}
                        </div>

                        {/* السعر */}
                        <div>
                            <label className="block text-gray-800 font-semibold mb-3 text-right">
                                <span className="text-blue-600 ml-2">●</span>
                                السعر
                            </label>
                            <div className="flex flex-col md:flex-row md:items-center gap-4" dir="rtl">
                                <div className="relative flex-grow">
                                    <input 
                                        type="number"
                                        value={data.price}
                                        onChange={e => setData('price', e.target.value)}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        required
                                        className="w-full border-2 border-gray-200 rounded-2xl py-4 pr-32 pl-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 text-lg shadow-sm hover:border-gray-300"
                                        dir="ltr"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100 font-medium">
                                        جنيه سوداني
                                    </span>
                                </div>
                                
                                <div className="flex items-center mr-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                    <input 
                                        type="checkbox"
                                        id="negotiable"
                                        checked={data.negotiable}
                                        onChange={e => setData('negotiable', e.target.checked)}
                                        className="w-6 h-6 rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-blue-500 ml-3"
                                    />
                                    <label htmlFor="negotiable" className="text-gray-700 text-lg font-medium cursor-pointer">
                                        السعر قابل للتفاوض
                                    </label>
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm mt-2 text-right">
                                أدخل السعر بالجنيه السوداني
                            </p>
                            {errors.price && (
                                <p className="mt-2 text-sm text-red-600 text-right">{errors.price}</p>
                            )}
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-8">
                        {/* الكلمات الدالة */}
                        <div>
                            <label className="block text-gray-800 font-semibold mb-3 text-right">
                                <span className="text-blue-600 ml-2">●</span>
                                الكلمات الدالة
                            </label>
                            <input 
                                type="text"
                                value={data.tags}
                                onChange={e => setData('tags', e.target.value)}
                                placeholder="مثال: سيارات، مستعمل، تويوتا، 2020، كامري"
                                className="w-full border-2 border-gray-200 rounded-2xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 text-lg shadow-sm hover:border-gray-300 placeholder:text-gray-400"
                                dir="rtl"
                            />
                            <p className="text-gray-500 text-sm mt-2 text-right">
                                أضف كلمات دالة تساعد في ظهور إعلانك في نتائج البحث (افصل بينها بفواصل)
                            </p>
                            {errors.tags && (
                                <p className="mt-2 text-sm text-red-600 text-right">{errors.tags}</p>
                            )}
                        </div>

                        {/* معلومات البائع */}
                        <div className="border-t border-gray-100 pt-8">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 text-right flex items-center justify-end">
                                <i className="fas fa-user-circle mr-3 text-blue-600 text-2xl"></i>
                                معلومات البائع
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" dir="rtl">
                                {/* البريد الإلكتروني */}
                                <div>
                                    <label className="block text-gray-800 font-semibold mb-3 text-right">
                                        البريد الإلكتروني
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            placeholder="example@domain.com"
                                            className="w-full border-2 border-gray-200 rounded-2xl py-4 pr-14 pl-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 text-lg shadow-sm hover:border-gray-300 placeholder:text-gray-400"
                                            dir="ltr"
                                        />
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                                            <i className="fas fa-envelope"></i>
                                        </span>
                                    </div>
                                    {errors.email && (
                                        <p className="mt-2 text-sm text-red-600 text-right">{errors.email}</p>
                                    )}
                                </div>
                                
                                {/* رقم الهاتف */}
                                <div>
                                    <label className="block text-gray-800 font-semibold mb-3 text-right">
                                        رقم الهاتف
                                    </label>
                                    <div className="flex flex-row-reverse">
                                        <input 
                                            type="tel"
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                            placeholder="123456789"
                                            className="w-full border-2 border-gray-200 border-l-0 rounded-l-none rounded-2xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 text-lg shadow-sm hover:border-gray-300 placeholder:text-gray-400"
                                            dir="ltr"
                                        />
                                        <div className="relative flex-shrink-0 w-1/3">
                                            <select 
                                                value={data.country_code}
                                                onChange={e => setData('country_code', e.target.value)}
                                                className="w-full border-2 border-gray-200 rounded-r-none rounded-2xl py-4 px-5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800 text-lg shadow-sm hover:border-gray-300"
                                                dir="rtl"
                                            >
                                                <option value="+249">+249 🇸🇩</option>
                                                <option value="+966">+966 🇸🇦</option>
                                                <option value="+971">+971 🇦🇪</option>
                                                <option value="+20">+20 🇪🇬</option>
                                                <option value="+965">+965 🇰🇼</option>
                                                <option value="+968">+968 🇴🇲</option>
                                            </select>
                                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
                                                <i className="fas fa-chevron-down"></i>
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-gray-500 text-sm mt-2 text-right">
                                        سيتم التواصل معك على هذا الرقم
                                    </p>
                                    {errors.phone && (
                                        <p className="mt-2 text-sm text-red-600 text-right">{errors.phone}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-8">
                        {/* رفع الصور */}
                        <div>
                            <label className="block text-gray-800 font-semibold mb-4 text-right">
                                <span className="text-blue-600 ml-2">●</span>
                                رفع الصور
                                <span className="text-red-500 mr-2">*</span>
                            </label>
                            
                            <div className="border-3 border-dashed border-gray-300 rounded-2xl p-8 text-center transition-all hover:border-blue-400 hover:bg-blue-50" dir="rtl">
                                <input 
                                    type="file" 
                                    multiple 
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="image-upload"
                                    accept="image/*"
                                />
                                
                                <label htmlFor="image-upload" className="cursor-pointer block">
                                    <div className="text-gray-500 mb-4">
                                        <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <i className="fas fa-cloud-upload-alt text-3xl text-blue-500"></i>
                                        </div>
                                        <p className="text-xl font-semibold text-gray-700 mb-2">
                                            اسحب وأفلت الصور هنا
                                        </p>
                                        <p className="text-gray-500">أو انقر لاختيار الصور</p>
                                        <p className="text-gray-400 mt-2 text-sm">
                                            يسمح بحد أقصى 10 صور (JPEG, PNG, JPG, GIF)
                                        </p>
                                    </div>
                                </label>
                                
                                {imagePreviews.length > 0 && (
                                    <div className="mt-8">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-gray-700 font-semibold text-lg text-right">
                                                الصور المرفوعة ({imagePreviews.length})
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
                                            >
                                                <i className="fas fa-plus ml-2"></i>
                                                إضافة المزيد
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {imagePreviews.map((preview, index) => (
                                                <div key={index} className="relative group">
                                                    <div className="aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                                        <img 
                                                            src={preview.url} 
                                                            alt={`صورة المنتج ${index + 1}`}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                                                    >
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                    {index === 0 && (
                                                        <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-lg">
                                                            الرئيسية
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between items-center mt-4">
                                <p className="text-gray-500 text-sm text-right">
                                    الصورة الأولى ستكون صورة الغلاف للإعلان
                                </p>
                                <p className="text-gray-400 text-sm">
                                    {imagePreviews.length}/10 صور
                                </p>
                            </div>
                            {(errors.images || data.images.length === 0) && (
                                <p className="mt-2 text-sm text-red-600 text-right">
                                    {errors.images || 'يرجى إضافة صورة واحدة على الأقل'}
                                </p>
                            )}
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-8">
                        {/* مراجعة الإعلان */}
                        <div className="bg-gradient-to-l from-blue-50 to-white border border-blue-100 rounded-2xl p-6 shadow-sm" dir="rtl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-blue-800 flex items-center">
                                    <i className="fas fa-clipboard-check ml-3 text-2xl"></i>
                                    مراجعة الإعلان
                                </h3>
                                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-medium">
                                    جاهز للنشر
                                </span>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white p-4 rounded-xl border border-gray-100">
                                        <p className="text-gray-600 text-sm mb-1">العنوان:</p>
                                        <p className="font-semibold text-gray-800 text-lg">{data.title || "غير محدد"}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-gray-100">
                                        <p className="text-gray-600 text-sm mb-1">السعر:</p>
                                        <p className="font-semibold text-gray-800 text-lg">
                                            {data.price ? `${Number(data.price).toLocaleString()} جنيه سوداني` : "غير محدد"}
                                            {data.negotiable && (
                                                <span className="text-green-600 text-sm mr-2">✓ قابل للتفاوض</span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-gray-100">
                                        <p className="text-gray-600 text-sm mb-1">القسم:</p>
                                        <p className="font-semibold text-gray-800">
                                            {getCategoryName()}
                                        </p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-gray-100">
                                        <p className="text-gray-600 text-sm mb-1">عدد الصور:</p>
                                        <p className="font-semibold text-gray-800 flex items-center">
                                            {imagePreviews.length} صورة
                                            {imagePreviews.length > 0 && (
                                                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* معاينة الوصف */}
                                <div className="bg-white rounded-xl p-5 border border-gray-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-gray-600 font-medium">الوصف:</p>
                                        <span className="text-blue-500 text-sm">
                                            <i className="fas fa-eye ml-1"></i>
                                            معاينة
                                        </span>
                                    </div>
                                    <div 
                                        className="text-gray-800 leading-relaxed text-right border-t border-gray-100 pt-4"
                                        dangerouslySetInnerHTML={{ 
                                            __html: data.description || 
                                            '<p class="text-gray-400 text-center py-8">لم يتم إضافة وصف</p>'
                                        }}
                                    />
                                </div>

                                {/* معاينة الصور */}
                                {imagePreviews.length > 0 && (
                                    <div className="bg-white rounded-xl p-5 border border-gray-100">
                                        <p className="text-gray-600 font-medium mb-3">معاينة الصور:</p>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {imagePreviews.slice(0, 3).map((preview, index) => (
                                                <div key={index} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                                                    <img 
                                                        src={preview.url} 
                                                        alt={`معاينة ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                            {imagePreviews.length > 3 && (
                                                <div className="aspect-square rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                                                    <span className="text-gray-600 font-semibold">
                                                        +{imagePreviews.length - 3}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* الشروط والأحكام */}
                        <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50" dir="rtl">
                            <div className="flex items-start">
                                <input 
                                    type="checkbox" 
                                    id="terms"
                                    required
                                    className="w-6 h-6 mt-1 ml-4 rounded-lg border-2 border-gray-300 checked:bg-blue-600 checked:border-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="terms" className="text-gray-700 text-right">
                                    <span className="font-semibold">أوافق على شروط الاستخدام:</span>
                                    <ul className="mt-2 space-y-1 text-sm text-gray-600 pr-5">
                                        <li className="flex items-center">
                                            <i className="fas fa-check-circle text-green-500 ml-2 text-sm"></i>
                                            الإعلان يتبع سياسة الموقع وقوانين الدولة
                                        </li>
                                        <li className="flex items-center">
                                            <i className="fas fa-check-circle text-green-500 ml-2 text-sm"></i>
                                            المعلومات المقدمة صحيحة ودقيقة
                                        </li>
                                        <li className="flex items-center">
                                            <i className="fas fa-check-circle text-green-500 ml-2 text-sm"></i>
                                            أوافق على <a href="/privacy" className="text-blue-600 hover:underline font-medium">سياسة الخصوصية</a>
                                        </li>
                                    </ul>
                                </label>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="إنشاء إعلان جديد" />
            
            <div dir="rtl" className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* رسالة الخطأ */}
                    {errorMessage && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
                            <div className="flex items-center">
                                <i className="fas fa-exclamation-triangle text-red-500 ml-3"></i>
                                <p className="text-red-700 font-medium">{errorMessage}</p>
                            </div>
                        </div>
                    )}

                    {/* العنوان الرئيسي */}
                    <header className="mb-10 text-center">
                        <div className="inline-flex items-center justify-center mb-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center shadow-lg">
                                <i className="fas fa-plus text-white text-2xl"></i>
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                            نشر إعلان جديد
                        </h1>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            أضف إعلانك مجانًا على منصة السوق المبوبة ووصل إلى آلاف المشترين
                        </p>
                    </header>

                    {/* بطاقة النموذج */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl overflow-hidden">
                        {/* شريط التقدم */}
                        <div className="px-8 pt-8 pb-6 border-b border-gray-100">
                            <div className="mb-6">
                                <div className="flex items-center justify-between relative">
                                    <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-100 -translate-y-1/2 rounded-full z-0"></div>
                                    <div 
                                        className="absolute top-1/2 left-0 h-2 bg-gradient-to-r from-blue-500 to-blue-400 -translate-y-1/2 rounded-full z-10 transition-all duration-500"
                                        style={{ width: `${(activeStep - 1) * 33.33}%` }}
                                    ></div>
                                    
                                    {[1, 2, 3, 4].map(step => (
                                        <div 
                                            key={step}
                                            className={`relative z-20 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                                                step <= activeStep 
                                                    ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white scale-110' 
                                                    : 'bg-white text-gray-400 border-2 border-gray-200'
                                            }`}
                                            onClick={() => activeStep > step && setActiveStep(step)}
                                            style={{ cursor: activeStep > step ? 'pointer' : 'default' }}
                                        >
                                            <span className="text-lg font-bold">{step}</span>
                                            {step < activeStep && (
                                                <i className="fas fa-check absolute -top-1 -right-1 bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs"></i>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-6 text-sm font-medium">
                                    <span className={`${activeStep >= 4 ? 'text-blue-600' : 'text-gray-500'}`}>المراجعة</span>
                                    <span className={`${activeStep >= 3 ? 'text-blue-600' : 'text-gray-500'}`}>الصور</span>
                                    <span className={`${activeStep >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>المعلومات</span>
                                    <span className={`${activeStep >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>التفاصيل</span>
                                </div>
                            </div>
                        </div>

                        {/* محتوى النموذج */}
                        <div className="p-8">
                            {renderStepContent()}
                        </div>

                        {/* أزرار التنقل */}
                        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div>
                                    {activeStep > 1 && (
                                        <button 
                                            type="button"
                                            onClick={handlePrevStep}
                                            className="text-gray-700 font-medium px-8 py-3.5 rounded-xl border-2 border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center justify-center shadow-sm"
                                            disabled={isLoading}
                                        >
                                            <i className="fas fa-arrow-left ml-3"></i>
                                            الرجوع للخطوة السابقة
                                        </button>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    {activeStep < 4 ? (
                                        <>
                                            <button 
                                                type="button"
                                                onClick={saveDraft}
                                                className="text-gray-600 font-medium px-6 py-3.5 rounded-xl border-2 border-gray-300 hover:bg-gray-100 transition-all shadow-sm"
                                                disabled={isLoading}
                                            >
                                                <i className="fas fa-save ml-2"></i>
                                                حفظ كمسودة
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={handleNextStep}
                                                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold px-10 py-3.5 rounded-xl hover:from-blue-700 hover:to-blue-600 active:scale-[0.98] transition-all shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={isLoading}
                                            >
                                                التالي
                                                <i className="fas fa-arrow-right mr-3"></i>
                                            </button>
                                        </>
                                    ) : (
                                        <button 
                                            type="submit"
                                            disabled={processing || isLoading}
                                            className="bg-gradient-to-r from-green-600 to-green-500 text-white font-bold px-12 py-4 rounded-xl hover:from-green-700 hover:to-green-600 active:scale-[0.98] transition-all shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {processing || isLoading ? (
                                                <>
                                                    <i className="fas fa-spinner fa-spin mr-3"></i>
                                                    جاري النشر...
                                                </>
                                            ) : (
                                                <>
                                                    نشر الإعلان الآن
                                                    <i className="fas fa-check-circle mr-3 text-lg"></i>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* تذييل الصفحة */}
                    <footer className="mt-8 text-center">
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="text-right">
                                    <h4 className="font-semibold text-gray-800 mb-1">معلومات مهمة</h4>
                                    <p className="text-gray-600 text-sm">
                                        سيتم مراجعة إعلانك خلال 24 ساعة قبل نشره للتأكد من مطابقته لشروط الاستخدام
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <a href="/help" className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
                                        <i className="fas fa-question-circle ml-2"></i>
                                        المساعدة
                                    </a>
                                    <a href="/terms" className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
                                        <i className="fas fa-file-alt ml-2"></i>
                                        شروط الاستخدام
                                    </a>
                                </div>
                            </div>
                        </div>
                        <p className="text-gray-500 text-sm mt-6">
                            © {new Date().getFullYear()} منصة السوق المبوبة. جميع الحقوق محفوظة.
                        </p>
                    </footer>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
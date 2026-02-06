import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function Create() {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [tags, setTags] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+249");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [cityId, setCityId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
  const [toolbarActive, setToolbarActive] = useState({
    bold: false,
    italic: false,
    underline: false
  });

  const fileInputRef = useRef();
  const descriptionRef = useRef();

  useEffect(() => {
    // Fetch categories
    axios.get("/api/categories").then(res => {
      setCategories(res.data);
    });

    // Fetch cities (you'll need to create this API endpoint)
    axios.get("/api/cities").then(res => {
      setCities(res.data);
    }).catch(() => {
      // Fallback cities if API fails
      setCities([
        { id: "khartoum", title: "الخرطوم" },
        { id: "omdurman", title: "أم درمان" },
        { id: "bahri", title: "بحري" },
        { id: "port_sudan", title: "بورتسودان" },
        { id: "nyala", title: "نيالا" },
        { id: "kassala", title: "كسلا" }
      ]);
    });
  }, []);

  useEffect(() => {
    if (!categoryId) {
      setSubcategories([]);
      setSubcategoryId("");
      return;
    }

    axios.get(`/api/subcategories/${categoryId}`).then(res => {
      setSubcategories(res.data);
    });
  }, [categoryId]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files.map(file => ({
      file,
      url: URL.createObjectURL(file),
    })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("negotiable", negotiable ? 1 : 0);
    formData.append("subcategory_id", subcategoryId);
    formData.append("city_id", cityId);
    formData.append("tags", tags);
    formData.append("email", email);
    formData.append("phone", `${countryCode}${phone}`);

    images.forEach(img => {
      formData.append("images[]", img.file);
    });

    try {
      await axios.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("تم حفظ المنتج بنجاح!");
    } catch (error) {
      alert("حدث خطأ أثناء حفظ المنتج. يرجى المحاولة مرة أخرى.");
    }
  };

  const handleNextStep = () => {
    if (activeStep < 4) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleToolbarClick = (format) => {
    setToolbarActive(prev => ({
      ...prev,
      [format]: !prev[format]
    }));
    
    if (descriptionRef.current) {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      
      if (toolbarActive[format]) {
        // Remove formatting
        const parent = range.commonAncestorContainer.parentElement;
        if (parent.tagName === format.toUpperCase()) {
          const text = parent.textContent;
          parent.replaceWith(text);
        }
      } else {
        // Apply formatting
        const formattedNode = document.createElement(format === 'bold' ? 'strong' : format);
        formattedNode.appendChild(range.extractContents());
        range.insertNode(formattedNode);
      }
    }
  };

  const renderStepContent = () => {
    switch(activeStep) {
      case 1:
        return (
          <div className="space-y-8">
            {/* 1. Category Selector */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                <i className="fas fa-tags ml-2"></i>
                القسم
              </label>
              <div className="relative">
                <select 
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-xl px-12 py-4 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800 text-lg"
                >
                  <option value="">اختر القسم</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <i className="fas fa-chevron-down"></i>
                </span>
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                  <i className="fas fa-list-alt"></i>
                </span>
              </div>
            </div>

            {/* Subcategory */}
            {subcategories.length > 0 && (
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  <i className="fas fa-tag ml-2"></i>
                  القسم الفرعي
                </label>
                <div className="relative">
                  <select 
                    value={subcategoryId}
                    onChange={e => setSubcategoryId(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-12 py-4 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800 text-lg"
                  >
                    <option value="">اختر قسم فرعي</option>
                    {subcategories.map(s => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <i className="fas fa-chevron-down"></i>
                  </span>
                </div>
              </div>
            )}

            {/* 2. Title Input */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                <i className="fas fa-heading ml-2"></i>
                عنوان الإعلان
              </label>
              <input 
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="عنوان الإعلان"
                required
                className="w-full border border-gray-300 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 text-lg"
              />
            </div>

            {/* 3. Rich Text Editor */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                <i className="fas fa-align-right ml-2"></i>
                الوصف
              </label>
              <div className={`border border-gray-300 rounded-xl overflow-hidden ${isDescriptionFocused ? 'ring-2 ring-blue-500' : ''}`}>
                {/* Toolbar */}
                <div className="rich-text-toolbar border-b border-gray-300 bg-gray-50 p-3 flex flex-wrap gap-2">
                  <button 
                    type="button" 
                    onClick={() => handleToolbarClick('bold')}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${toolbarActive.bold ? 'active bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-200'}`}
                    title="عريض"
                  >
                    <i className="fas fa-bold"></i>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleToolbarClick('italic')}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${toolbarActive.italic ? 'active bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-200'}`}
                    title="مائل"
                  >
                    <i className="fas fa-italic"></i>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleToolbarClick('underline')}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${toolbarActive.underline ? 'active bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-200'}`}
                    title="تحته خط"
                  >
                    <i className="fas fa-underline"></i>
                  </button>
                </div>
                
                {/* Content Area */}
                <div 
                  ref={descriptionRef}
                  contentEditable="true"
                  onFocus={() => setIsDescriptionFocused(true)}
                  onBlur={() => setIsDescriptionFocused(false)}
                  onInput={(e) => setDescription(e.currentTarget.innerHTML)}
                  className="p-5 min-h-[200px] focus:outline-none text-gray-800 text-lg"
                  data-placeholder="أدخل وصفًا تفصيليًا للإعلان هنا..."
                >
                  {!description && <p>أدخل وصفًا تفصيليًا للإعلان هنا...</p>}
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-2">يرجى تقديم وصف واضح وشامل للمنتج أو الخدمة</p>
            </div>

            {/* 4. Price Input */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                <i className="fas fa-tag ml-2"></i>
                السعر
              </label>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="relative flex-grow">
                  <input 
                    type="number"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="السعر"
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 text-lg"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray-100 text-gray-700 px-3 py-1 rounded-lg border border-gray-300">
                    جنيه سوداني
                  </span>
                </div>
                
                <div className="flex items-center mr-4">
                  <input 
                    type="checkbox"
                    id="negotiable"
                    checked={negotiable}
                    onChange={e => setNegotiable(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ml-3"
                  />
                  <label htmlFor="negotiable" className="text-gray-700 text-lg cursor-pointer">
                    قابل للتفاوض
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            {/* City Selector */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                <i className="fas fa-map-marker-alt ml-2"></i>
                المدينة
              </label>
              <div className="relative">
                <select 
                  value={cityId}
                  onChange={e => setCityId(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-xl px-12 py-4 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800 text-lg"
                >
                  <option value="">حدد مدينة</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>{city.title}</option>
                  ))}
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <i className="fas fa-chevron-down"></i>
                </span>
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                  <i className="fas fa-city"></i>
                </span>
              </div>
            </div>

            {/* Tags Input */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                <i className="fas fa-hashtag ml-2"></i>
                الكلمات الدالة
              </label>
              <input 
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="مثال: سيارات, مستعمل, تويوتا, 2020"
                className="w-full border border-gray-300 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 text-lg"
              />
              <p className="text-gray-500 text-sm mt-2">أضف كلمات دالة مفصلية تفصل بفواصل لتسهيل البحث عن إعلانك</p>
            </div>

            {/* Seller Information Section */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <i className="fas fa-user-circle ml-3 text-blue-600"></i>
                معلومات البائع
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    <i className="fas fa-envelope ml-2"></i>
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <input 
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="example@domain.com"
                      required
                      className="w-full border border-gray-300 rounded-xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 text-lg"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                      <i className="fas fa-at"></i>
                    </span>
                  </div>
                </div>
                
                {/* Phone */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    <i className="fas fa-phone ml-2"></i>
                    رقم الهاتف
                  </label>
                  <div className="flex">
                    <div className="relative flex-shrink-0 w-1/3">
                      <select 
                        value={countryCode}
                        onChange={e => setCountryCode(e.target.value)}
                        className="w-full border border-gray-300 rounded-r-none rounded-xl px-4 py-4 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800"
                      >
                        <option value="+249">+249 🇸🇩</option>
                        <option value="+966">+966 🇸🇦</option>
                        <option value="+971">+971 🇦🇪</option>
                      </select>
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <i className="fas fa-chevron-down"></i>
                      </span>
                    </div>
                    <input 
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="xx xxx xxxx"
                      required
                      className="w-full border border-gray-300 border-r-0 rounded-l-none rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 text-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            {/* Images Upload */}
            <div>
              <label className="block text-gray-700 font-medium mb-4">
                <i className="fas fa-images ml-2"></i>
                صور المنتج
              </label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
                <input 
                  type="file" 
                  multiple 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                  accept="image/*"
                />
                
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="text-gray-500 mb-4">
                    <i className="fas fa-cloud-upload-alt text-5xl mb-4"></i>
                    <p className="text-xl font-medium">اسحب وأفلت الصور هنا أو انقر للرفع</p>
                    <p className="text-gray-400 mt-2">يسمح بحد أقصى 10 صور (JPEG, PNG, JPG)</p>
                  </div>
                </label>
                
                {images.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-gray-700 font-medium mb-4">الصور المرفوعة ({images.length})</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {images.map((img, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={img.url} 
                            alt={`Product ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                            className="absolute top-2 left-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            {/* Review Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                <i className="fas fa-clipboard-check ml-3"></i>
                مراجعة الإعلان
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">العنوان:</p>
                    <p className="font-medium text-gray-800">{title || "غير محدد"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">السعر:</p>
                    <p className="font-medium text-gray-800">
                      {price ? `${price} جنيه سوداني` : "غير محدد"}
                      {negotiable && " (قابل للتفاوض)"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">المدينة:</p>
                    <p className="font-medium text-gray-800">
                      {cities.find(c => c.id === cityId)?.title || "غير محدد"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">عدد الصور:</p>
                    <p className="font-medium text-gray-800">{images.length} صورة</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 mt-4">
                  <p className="text-gray-600 mb-2">الوصف:</p>
                  <div 
                    className="text-gray-800"
                    dangerouslySetInnerHTML={{ __html: description || "لا يوجد وصف" }}
                  />
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-start">
                <input 
                  type="checkbox" 
                  id="terms"
                  required
                  className="w-5 h-5 mt-1 ml-3"
                />
                <label htmlFor="terms" className="text-gray-700">
                  أوافق على <a href="#" className="text-blue-600 hover:underline">شروط الاستخدام</a> و <a href="#" className="text-blue-600 hover:underline">سياسة الخصوصية</a> للموقع
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
    <div dir="rtl" className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">نشر إعلان مجاني</h1>
          <p className="text-gray-600 mt-2">أضف إعلانك الخاص في منصة السوق المبوبة</p>
        </header>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {/* Progress Indicator */}
          <div className="mb-10">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-1/2 right-0 left-0 h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
              <div 
                className="absolute top-1/2 right-0 h-1 bg-blue-600 -translate-y-1/2 z-10 transition-all duration-300"
                style={{ width: `${(activeStep - 1) * 33.33}%` }}
              ></div>
              
              {[1, 2, 3, 4].map(step => (
                <div 
                  key={step}
                  className={`relative z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    step <= activeStep 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}
                  onClick={() => activeStep > step && setActiveStep(step)}
                  style={{ cursor: activeStep > step ? 'pointer' : 'default' }}
                >
                  <span>{step}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span className={`font-medium ${activeStep >= 1 ? 'text-blue-600' : ''}`}>التفاصيل</span>
              <span className={`${activeStep >= 2 ? 'text-blue-600' : ''}`}>المعلومات</span>
              <span className={`${activeStep >= 3 ? 'text-blue-600' : ''}`}>الصور</span>
              <span className={`${activeStep >= 4 ? 'text-blue-600' : ''}`}>المراجعة</span>
            </div>
          </div>

          {/* Form Fields */}
          {renderStepContent()}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-12 pt-8 border-t border-gray-200 gap-4">
            {activeStep > 1 && (
              <button 
                type="button"
                onClick={handlePrevStep}
                className="text-gray-600 font-medium px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition-all"
              >
                <i className="fas fa-arrow-right ml-2"></i>
                رجوع
              </button>
            )}
            
            <div className="flex items-center gap-4">
              {activeStep < 4 ? (
                <>
                  <button 
                    type="button"
                    className="text-gray-600 font-medium px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition-all"
                  >
                    حفظ كمسودة
                  </button>
                  <button 
                    type="button"
                    onClick={handleNextStep}
                    className="bg-blue-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-all shadow-md hover:shadow-lg flex items-center"
                  >
                    التالي
                    <i className="fas fa-arrow-left mr-2"></i>
                  </button>
                </>
              ) : (
                <button 
                  type="submit"
                  className="bg-green-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-green-700 active:bg-green-800 transition-all shadow-md hover:shadow-lg flex items-center"
                >
                  نشر الإعلان
                  <i className="fas fa-check mr-2"></i>
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Footer Note */}
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>سيتم مراجعة إعلانك قبل نشره للتأكد من مطابقته <a href="#" className="text-blue-600 hover:underline">شروط الاستخدام</a></p>
        </footer>
      </div>
    </div>
  );
}
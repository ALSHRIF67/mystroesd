import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function Create() {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [negotiable, setNegotiable] = useState(false);

  const fileInputRef = useRef();

  useEffect(() => {
    axios.get("/api/categories").then(res => {
      setCategories(res.data);
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

    images.forEach(img => {
      formData.append("images[]", img.file);
    });

    await axios.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    alert("تم حفظ المنتج");
  };

  return (
    <div dir="rtl" className="p-6 bg-gray-100 min-h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded space-y-4">
        <input placeholder="العنوان" value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full border p-2 rounded" />

        <textarea placeholder="الوصف"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full border p-2 rounded" />

        <select value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          className="w-full border p-2 rounded">
          <option value="">اختر تصنيف</option>
          {categories.map(c =>
            <option key={c.id} value={c.id}>{c.title}</option>
          )}
        </select>

        <select value={subcategoryId}
          onChange={e => setSubcategoryId(e.target.value)}
          className="w-full border p-2 rounded">
          <option value="">اختر قسم فرعي</option>
          {subcategories.map(s =>
            <option key={s.id} value={s.id}>{s.title}</option>
          )}
        </select>

        <input type="number" placeholder="السعر"
          value={price}
          onChange={e => setPrice(e.target.value)}
          className="w-full border p-2 rounded" />

        <label className="flex gap-2">
          <input type="checkbox"
            checked={negotiable}
            onChange={e => setNegotiable(e.target.checked)} />
          قابل للتفاوض
        </label>

        <input type="file" multiple ref={fileInputRef}
          onChange={handleImageChange} />

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          حفظ المنتج
        </button>
      </form>
    </div>
  );
}

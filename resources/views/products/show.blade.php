<!doctype html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>{{ $product->title }}</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50 text-gray-800">
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-4xl mx-auto bg-white rounded shadow p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="md:col-span-1">
                    <img loading="lazy" src="{{ $product->image_url }}" alt="{{ $product->title }}" class="w-full h-64 object-cover rounded">
                </div>
                <div class="md:col-span-2">
                    <h1 class="text-2xl font-bold">{{ $product->title }}</h1>
                    <p class="text-xl text-red-600 mt-2">{{ $product->formatted_price }}</p>
                    <p class="text-sm text-gray-600 mt-1">بواسطة: {{ $product->seller?->name ?? 'بائع مجهول' }}</p>
                    <div class="mt-4 text-gray-800">{!! nl2br(e($product->description)) !!}</div>
                    <div class="mt-6">
                        <a href="{{ route('home') }}" class="inline-block px-3 py-2 bg-gray-200 rounded">عودة للمنتجات</a>

                        @can('update', $product)
                            <a href="{{ route('products.edit', $product->id) }}" class="inline-block px-3 py-2 bg-blue-600 text-white rounded mr-2">تعديل</a>
                        @endcan

                        @can('delete', $product)
                            <form method="POST" action="{{ route('products.destroy', $product->id) }}" class="inline-block" onsubmit="return confirm('هل أنت متأكد من حذف المنتج؟');">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="px-3 py-2 bg-red-600 text-white rounded">حذف</button>
                            </form>
                        @endcan
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>

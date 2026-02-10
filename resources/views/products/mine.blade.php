<!doctype html>
<html lang="ar">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>منتجاتي</title>
</head>
<body>
    <h1>منتجاتي</h1>
    @if($products->isEmpty())
        <p>لا توجد منتجات بعد.</p>
    @else
        <ul>
            @foreach($products as $product)
                <li>{{ $product->title }} - الحالة: {{ $product->status }}</li>
            @endforeach
        </ul>
    @endif
</body>
</html>

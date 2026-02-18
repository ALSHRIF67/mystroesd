<!doctype html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>منتجات معلقة</title>
    <style>body{font-family: Arial, Helvetica, sans-serif;direction: rtl;}</style>
</head>
<body>
    <h1>منتجات معلقة</h1>
    <ul>
        @foreach($pendingProducts as $p)
            <li>{{ $p->title }} ({{ $p->status }})</li>
        @endforeach
    </ul>
</body>
</html>

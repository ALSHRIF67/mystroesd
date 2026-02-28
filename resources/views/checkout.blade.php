<!doctype html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Checkout - {{ config('app.name') }}</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        body { font-family: system-ui, sans-serif; background: #f3f4f6; margin:0; padding:20px; }
        .container { max-width: 1000px; margin:0 auto; background:white; border-radius:1rem; box-shadow:0 4px 10px rgba(0,0,0,0.1); padding:2rem; }
        h1, h2 { color:#111827; }
        .checkout-grid { display:grid; grid-template-columns: 2fr 1fr; gap:2rem; }
        @media(max-width:768px){ .checkout-grid{ grid-template-columns:1fr; } }
        table { width:100%; border-collapse:collapse; margin-bottom:1rem; }
        th, td { padding:0.75rem; text-align:right; border-bottom:1px solid #e5e7eb; }
        th { background:#f9fafb; }
        .btn { background:#3b82f6; color:white; padding:0.5rem 1rem; border-radius:0.5rem; border:none; cursor:pointer; transition:0.2s; }
        .btn:hover { background:#2563eb; }
        .btn-remove { background:transparent; color:#dc2626; border:none; cursor:pointer; font-weight:bold; }
        .alert { padding:1rem; border-radius:0.5rem; margin-bottom:1rem; }
        .alert-error { background:#fee2e2; color:#b91c1c; }
        .alert-info { background:#fef3c7; color:#92400e; }
        .quantity-controls button { padding:0.25rem 0.5rem; margin:0 0.1rem; border-radius:0.25rem; border:1px solid #d1d5db; background:#f3f4f6; cursor:pointer; }
        .total { font-weight:bold; font-size:1.2rem; text-align:right; margin-top:1rem; }
    </style>
</head>
<body>
<div class="container">
    <h1 class="mb-4 text-2xl font-bold">إتمام الشراء</h1>

    @if(session('error'))
        <div class="alert alert-error">{{ session('error') }}</div>
    @endif
    @if(session('success'))
        <div class="alert alert-info">{{ session('success') }}</div>
    @endif

    <div class="checkout-grid">
        <div>
            <h2 class="mb-4 text-xl font-semibold">سلة المشتريات</h2>
            <table>
                <thead>
                    <tr>
                        <th>المنتج</th>
                        <th>الكمية</th>
                        <th>سعر الوحدة</th>
                        <th>المجموع</th>
                        <th>إجراءات</th>
                    </tr>
                </thead>
                <tbody id="checkout-items">
                    {{-- JS سيملأها --}}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" class="text-right font-bold">المجموع الكلي</td>
                        <td class="font-bold" id="checkout-total">0.00</td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>

            <div style="text-align:right;">
                @auth
                    <form id="confirm-order-form" method="POST" action="{{ route('checkout.process') }}">
                        @csrf
                        <input type="hidden" name="items" id="order-items">
                        <button type="submit" class="btn">تأكيد الطلب</button>
                    </form>
                @else
                    <a href="{{ route('login') }}" class="btn">تسجيل الدخول لإتمام الشراء</a>
                @endauth
            </div>
        </div>
    </div>

    <script>
    (function(){
        const GUEST = {!! json_encode($guest) !!};
        const SERVER_CART = {!! json_encode($cart) !!};
        const money = v => Number(v||0).toFixed(2) + ' {{ config("app.currency","SAR") }}';

        function render(items){
            const tbody = document.getElementById('checkout-items');
            tbody.innerHTML='';
            let total=0;
            items.forEach(it=>{
                const qty=Number(it.quantity||1);
                const price=Number(it.product?.price||it.price||0);
                const subtotal=qty*price;
                total+=subtotal;

                const tr=document.createElement('tr');
                tr.innerHTML=`
                    <td>${it.product?.name || it.name || 'منتج'}</td>
                    <td class="quantity-controls">
                        <button data-action="decrease" data-id="${it.product_id||it.product?.id}">-</button>
                        ${qty}
                        <button data-action="increase" data-id="${it.product_id||it.product?.id}">+</button>
                    </td>
                    <td>${money(price)}</td>
                    <td>${money(subtotal)}</td>
                    <td>
                        <button data-action="remove" data-id="${it.product_id||it.product?.id}" class="btn-remove">إزالة</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
            document.getElementById('checkout-total').textContent = money(total);
        }

        async function refresh(){
            const items = GUEST ? SERVER_CART : await fetch("{{ route('cart.show') }}",{credentials:'same-origin',headers:{'Accept':'application/json'}})
                .then(r=>r.ok?r.json():{cart:[]}).then(d=>d.cart||[]);
            render(items);
        }

        document.addEventListener('click', async e=>{
            const btn = e.target.closest('button[data-action]');
            if(!btn) return;
            const action = btn.getAttribute('data-action');
            const id = btn.getAttribute('data-id');
            if(!id) return;

            let items = [...SERVER_CART];

            if (action==='remove'){
                items = items.filter(i=>Number(i.product_id||i.product?.id)!==Number(id));
            } else {
                items = items.map(i=>{
                    if(Number(i.product_id||i.product?.id)===Number(id)){
                        let qty = Number(i.quantity||1) + (action==='increase'?1:-1);
                        i.quantity = qty>0? qty:1;
                    }
                    return i;
                });
            }

            window.SERVER_CART = items;
            render(items);
        });

        document.getElementById('confirm-order-form')?.addEventListener('submit', function(e){
            const items = window.SERVER_CART || [];
            document.getElementById('order-items').value = JSON.stringify(items);
        });

        document.addEventListener('DOMContentLoaded', refresh);
    })();
    </script>
</div>
</body>
</html>
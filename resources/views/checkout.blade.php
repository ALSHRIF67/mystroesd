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

    {{-- Session Error --}}
    @if(session('error'))
        <div class="alert alert-error">{{ session('error') }}</div>
    @endif

    {{-- Validation errors --}}
    @if($errors->any())
        <div class="alert alert-error">
            <ul>
                @foreach($errors->all() as $error) <li>{{ $error }}</li> @endforeach
            </ul>
        </div>
    @endif

    {{-- Guest notice --}}
    @if($guest)
        <div class="alert alert-info">
            <i class="fas fa-info-circle"></i> أنت تستخدم سلة ضيوف. سيتم مسح السلة عند تحديث الصفحة.
        </div>
    @endif

    <div class="checkout-grid">
        <div>
            <h2 class="mb-4 text-xl font-semibold">سلة المشتريات</h2>
            <div id="checkout-root">
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
                        {{-- JS will populate items --}}
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
                            <button type="submit" class="btn">تأكيد الطلب</button>
                        </form>
                    @else
                        <a href="{{ route('login') }}" class="btn">تسجيل الدخول لإتمام الشراء</a>
                    @endauth
                </div>
            </div>
        </div>
    </div>

    <script>
    (function(){
        const GUEST = {!! json_encode($guest) !!};
        const SERVER_CART = {!! json_encode($cart) !!};
        const money = v => Number(v||0).toFixed(2) + ' {{ config("app.currency","SAR") }}';

        async function fetchCart(){
            if (GUEST) {
                return Array.isArray(SERVER_CART) ? SERVER_CART : [];
            }
            try{
                const res = await fetch("{{ route('cart.show') }}",{credentials:'same-origin',headers:{'Accept':'application/json'}});
                if(!res.ok) return [];
                const data = await res.json();
                return data.cart || [];
            }catch(e){ return []; }
        }

        function render(items){
            const tbody = document.getElementById('checkout-items');
            tbody.innerHTML='';
            let total=0;
            items.forEach(it=>{
                const qty=Number(it.quantity||1);
                const price=Number((it.product&&it.product.price)||it.price||0);
                const subtotal=qty*price;
                total+=subtotal;

                const tr=document.createElement('tr');
                tr.innerHTML=`
                    <td>${(it.product&&it.product.name)||it.name||'منتج'}</td>
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
            const items=await fetchCart();
            render(items);
        }

        document.addEventListener('click', async e=>{
            const btn = e.target.closest('button[data-action]');
            if(!btn) return;
            const action = btn.getAttribute('data-action');
            const id = btn.getAttribute('data-id');
            if(!id) return;

            if (GUEST) {
                // operate on local server-passed cart for guest (session was cleared on render)
                let items = Array.isArray(SERVER_CART) ? SERVER_CART : [];
                const idx = items.findIndex(i => Number(i.product_id || i.product?.id) === Number(id));
                if (idx === -1) return;
                if (action === 'remove') {
                    items.splice(idx,1);
                } else {
                    let it = items[idx];
                    let newQty = Number(it.quantity||1) + (action === 'increase' ? 1 : -1);
                    if (newQty <= 0) items.splice(idx,1);
                    else items[idx].quantity = newQty;
                }
                // update SERVER_CART and re-render
                window.SERVER_CART = items;
                render(items);
                return;
            }

            if(action==='remove'){
                await fetch("{{ url('cart/remove') }}/"+id,{method:'DELETE',credentials:'same-origin',headers:{'X-CSRF-TOKEN':document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')||''}});
                await refresh(); return;
            }

            const items=await fetchCart();
            const it = items.find(i=>Number(i.product_id||i.product?.id)===Number(id));
            if(!it) return;
            let newQty = Number(it.quantity||1) + (action==='increase'?1:-1);
            if(newQty<=0){
                await fetch("{{ url('cart/remove') }}/"+id,{method:'DELETE',credentials:'same-origin',headers:{'X-CSRF-TOKEN':document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')||''}});
            }else{
                await fetch("{{ url('cart/update') }}/"+id,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-CSRF-TOKEN':document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')||''},body:JSON.stringify({quantity:newQty})});
            }
            await refresh();
        });

        document.addEventListener('DOMContentLoaded', refresh);
    })();
    </script>
</div>
</body>
</html>
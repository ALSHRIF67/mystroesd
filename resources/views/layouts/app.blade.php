<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', config('app.name')) - {{ config('app.name') }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @stack('styles')
</head>
<body class="antialiased">
    <x-header />
    <main class="min-h-screen flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8">
        <div class="w-full max-w-7xl">
            @yield('content')
        </div>
    </main>
    <x-footer />
    {{-- Global cart merge & helpers: runs on every page. Authenticated users will automatically
         POST localStorage cart to server on first page load after login. --}}
    @auth
        <script>
        (function(){
            async function tryMerge() {
                try {
                    const raw = localStorage.getItem('cart_items');
                    if (!raw) return;
                    const items = JSON.parse(raw);
                    if (!Array.isArray(items) || items.length === 0) return;

                    const resp = await fetch("{{ route('cart.merge') }}", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                            'Accept': 'application/json'
                        },
                        credentials: 'same-origin',
                        body: JSON.stringify({ items })
                    });

                    const data = await resp.json().catch(() => ({}));
                    if (resp.ok && data.success) {
                        localStorage.removeItem('cart_items');
                    }
                } catch (e) {
                    console.error('Cart merge failed', e);
                }
            }

            // Run once on DOM ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', tryMerge);
            } else {
                tryMerge();
            }
        })();
        </script>
    @endauth

    <script>
        // Global cart helper to be used by Alpine components or inline handlers.
        window.cartHelper = function () {
            return {
                _showToast(msg) {
                    try {
                        const id = 'cart-toast';
                        let el = document.getElementById(id);
                        if (!el) {
                            el = document.createElement('div');
                            el.id = id;
                            el.style.position = 'fixed';
                            el.style.bottom = '20px';
                            el.style.left = '20px';
                            el.style.zIndex = 9999;
                            document.body.appendChild(el);
                        }
                        const item = document.createElement('div');
                        item.style.background = 'rgba(0,0,0,0.8)';
                        item.style.color = '#fff';
                        item.style.padding = '10px 14px';
                        item.style.marginTop = '8px';
                        item.style.borderRadius = '6px';
                        item.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
                        item.textContent = msg;
                        el.appendChild(item);
                        setTimeout(() => { item.remove(); }, 4000);
                    } catch (e) {
                        try { alert(msg); } catch (_) {}
                    }
                },
                async add(productId, qty = 1) {
                    qty = Number(qty) || 1;
                    if (qty < 1) return;
                    // If user is authenticated, server endpoints will be available.
                    // We detect server-side auth via a meta flag rendered for JS if needed.
                    try {
                        // Attempt to POST — server will reject if unauthenticated
                        const res = await fetch("{{ route('cart.add') }}", {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                                'Accept': 'application/json'
                            },
                            credentials: 'same-origin',
                            body: JSON.stringify({ product_id: productId, quantity: qty })
                        });

                        if (res.ok) {
                            const json = await res.json().catch(() => ({}));
                            try { window.dispatchEvent(new CustomEvent('cart:changed')); } catch(e){}
                            return json;
                        }

                        // If unauthenticated, fall back to guest localStorage
                        if (res.status === 401 || res.status === 403) {
                            throw new Error('Unauthenticated');
                        }

                        // Business error (e.g. 400 Insufficient stock) — surface to user
                        let body = {};
                        try { body = await res.json(); } catch (e) { }
                        const msg = (body && body.message) ? body.message : 'Could not add to cart';
                        this._showToast(msg);
                        return { success: false, message: msg };
                    } catch (e) {
                        const key = 'cart_items';
                        let items = [];
                        try { items = JSON.parse(localStorage.getItem(key) || '[]'); } catch (ex) { items = []; }
                        const found = items.find(i => Number(i.product_id) === Number(productId));
                        if (found) {
                            found.quantity = Math.max(1, Number(found.quantity || 0) + qty);
                        } else {
                            items.push({ product_id: Number(productId), quantity: qty });
                        }
                        localStorage.setItem(key, JSON.stringify(items));
                        // Notify any UI listeners that guest/local cart changed (optional)
                        window.dispatchEvent(new CustomEvent('cart:changed'));
                        return { success: true, guest: true };
                    }
                }
            }
        }();
    </script>

    @stack('scripts')
</body>
</html>
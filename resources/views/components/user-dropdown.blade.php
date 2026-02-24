@props(['user' => auth()->user()])
<div x-data="cartDropdown()" x-init="init()" class="relative">
    <button @click="open = !open" class="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm hover:shadow-md">
        <i class="fas fa-user-circle text-2xl"></i>
        <span class="hidden sm:inline">{{ $user->name ?? 'User' }}</span>
        <div class="relative">
            <i class="fas fa-shopping-cart ml-2"></i>
            <span x-text="totalCount" class="absolute -top-2 -left-3 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center" style="font-size:10px;"></span>
        </div>
    </button>

    <div x-show="open" @click.away="open=false" x-cloak class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg p-3 z-40">
        <template x-if="cartItems.length === 0">
            <div class="text-sm text-gray-600">سلة المشتريات فارغة</div>
        </template>

        <template x-for="item in cartItems" :key="item.product_id">
            <div class="flex items-center justify-between py-2 border-b last:border-b-0">
                <div class="flex items-center gap-3">
                    <img :src="item.product?.image_url || item.image_url || '/storage/placeholder.png'" alt="" class="w-10 h-10 object-cover rounded" />
                    <div class="text-sm">
                        <div x-text="item.product?.name || item.name"></div>
                        <div class="text-xs text-gray-500">{{ config('app.currency','SAR') }} <span x-text="(item.product?.price ?? item.price ?? 0).toFixed(2)"></span></div>
                    </div>
                </div>

                <div class="flex items-center gap-2">
                    <button @click="decrease(item)" class="px-2 py-1 bg-gray-100 rounded">-</button>
                    <div class="px-2" x-text="item.quantity"></div>
                    <button @click="increase(item)" class="px-2 py-1 bg-gray-100 rounded">+</button>
                    <button @click="remove(item)" class="px-2 py-1 text-red-500">✕</button>
                </div>
            </div>
        </template>

        <div class="mt-3">
            <a href="{{ route('checkout.index') }}" class="w-full inline-block text-center bg-blue-600 text-white px-4 py-2 rounded">انتقال إلى إتمام الشراء</a>
        </div>
    </div>

    <script>
        function cartDropdown() {
            return {
                open: false,
                cartItems: [],
                init() {
                    this.fetchCart();
                    // Refresh DB-backed count when other parts of the app emit changes
                    try {
                        window.addEventListener('cart:changed', () => this.fetchCount());
                    } catch (e) {}
                },
                dbCount: 0,
                get totalCount() {
                    // Prefer authoritative DB count when available, fallback to computed cartItems
                    return Number(this.dbCount) || this.cartItems.reduce((s, it) => s + (Number(it.quantity)||0), 0);
                },
                async fetchCart() {
                    try {
                        const res = await fetch("{{ route('cart.show') }}", { credentials: 'same-origin', headers: { 'Accept': 'application/json' } });
                        if (!res.ok) return;
                        const data = await res.json();
                        // `cart` can be array of models (with product relation) or guest session array
                        this.cartItems = (data && data.cart) ? data.cart.map(i => ({
                            product_id: Number(i.product_id ?? i.product?.id ?? i['product_id']),
                            quantity: Number(i.quantity || 1),
                            product: i.product ?? null,
                            name: i.name ?? null,
                            price: i.price ?? (i.product?.price ?? 0),
                            image_url: i.image_url ?? (i.product?.image_url ?? null)
                        })) : [];
                    } catch (e) {
                        console.error('Could not load cart', e);
                    }
                },
                async fetchCount() {
                    try {
                        const res = await fetch("{{ route('cart.count') }}", { credentials: 'same-origin', headers: { 'Accept': 'application/json' } });
                        if (!res.ok) return;
                        const json = await res.json();
                        if (json && json.success) {
                            this.dbCount = Number(json.count || 0);
                        }
                    } catch (e) {
                        console.error('Could not fetch cart count', e);
                    }
                },
                async increase(item) {
                    const newQty = Number(item.quantity) + 1;
                    await this.updateQuantity(item, newQty);
                    await this.fetchCount();
                },
                async decrease(item) {
                    const newQty = Number(item.quantity) - 1;
                    if (newQty <= 0) return this.remove(item);
                    await this.updateQuantity(item, newQty);
                    await this.fetchCount();
                },
                async updateQuantity(item, qty) {
                    qty = Math.max(1, Math.min(10000, Number(qty) || 1));
                    try {
                        const url = "{{ url('cart/update') }}" + '/' + (item.product_id || item.product?.id);
                        const res = await fetch(url, {
                            method: 'POST',
                            credentials: 'same-origin',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                            },
                            body: JSON.stringify({ quantity: qty })
                        });
                        if (res.ok) {
                            item.quantity = qty;
                            await this.fetchCount();
                        } else if (res.status === 401 || res.status === 403) {
                            // unauthenticated - ignore here (header only shown to auth users)
                        } else {
                            const body = await res.json().catch(()=>({}));
                            alert(body.message || 'Could not update quantity');
                        }
                    } catch (e) {
                        console.error('update failed', e);
                    }
                },
                async remove(item) {
                    try {
                        const url = "{{ url('cart/remove') }}" + '/' + (item.product_id || item.product?.id);
                        const res = await fetch(url, {
                            method: 'DELETE',
                            credentials: 'same-origin',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                            }
                        });

                        if (res.ok) {
                            this.cartItems = this.cartItems.filter(i => Number(i.product_id) !== Number(item.product_id));
                            await this.fetchCount();
                            try { window.dispatchEvent(new CustomEvent('cart:changed')); } catch(e){}
                            return;
                        }

                        const body = await res.json().catch(()=>({}));
                        alert(body.message || 'Could not remove item');
                    } catch (e) {
                        console.error('remove failed', e);
                        try { alert('Could not remove item'); } catch(_){}
                    }
                }
            }
        }
    </script>
</div>
<script>
    // Listen for global cart changes and refresh count (fired by global cartHelper)
    window.addEventListener('cart:changed', function () {
        // Find all Alpine components with cartDropdown and call their fetchCount if available
        try {
            document.querySelectorAll('[x-data]').forEach(el => {
                if (el.__x && el.__x.getUnobservedData) {
                    const ctx = el.__x.getUnobservedData();
                    if (ctx && typeof ctx.fetchCount === 'function') {
                        ctx.fetchCount();
                    }
                }
            });
        } catch (e) {
            // ignore
        }
    });
</script>
</div>

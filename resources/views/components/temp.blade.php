{{-- resources/views/home.blade.php --}}
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name', 'MyStore') }} - الصفحة الرئيسية</title>

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"/>
    <!-- Alpine.js -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>

    <style>
        body { font-family: 'Cairo', sans-serif; }
        .rtl-flip { transform: scaleX(-1); }
        .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
    </style>
</head>
<body class="bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen"
      x-data="cartData()"
      x-init="initCart()">

<!-- ================= HEADER ================= -->
<x-header />


<script>
function toggleMobileMenu(){ document.getElementById('mobileMenu').classList.toggle('hidden'); }

function cartData() {
    return {
        cartOpen:false, cartItems:[], cartCount:0, cartTotal:0,
        async initCart(){
            @auth await this.refreshCart(); @else
            const saved = localStorage.getItem('shoppingCart');
            if(saved){ try{ const c=JSON.parse(saved); this.cartItems=c.items||[]; this.cartCount=c.count||0; this.cartTotal=c.total||0;}catch(e){console.error(e);} }
            @endauth
        },
        async refreshCart(){
            @auth
            try{
                const res=await fetch('/cart');
                if(res.ok){
                    const data=await res.json();
                    this.cartItems = data.cart.map(i=>({
                        id:i.id,
                        product_id:i.product_id,
                        name:i.product.name,
                        price:i.product.price,
                        quantity:i.quantity,
                        image_url:i.product.image_url||'https://via.placeholder.com/400x300?text=No+Image'
                    }));
                    this.cartCount=this.cartItems.reduce((sum,i)=>sum+i.quantity,0);
                    this.cartTotal=this.cartItems.reduce((sum,i)=>sum+(i.price*i.quantity),0);
                }
            }catch(e){console.error(e);}
            @else
            this.cartCount=this.cartItems.reduce((sum,i)=>sum+i.quantity,0);
            this.cartTotal=this.cartItems.reduce((sum,i)=>sum+(i.price*i.quantity),0);
            localStorage.setItem('shoppingCart', JSON.stringify({items:this.cartItems,count:this.cartCount,total:this.cartTotal}));
            @endauth
        },
        async addToCart(productId,name,price,imageUrl){
            @auth
            try{
                const res=await fetch(`/cart/${productId}`,{
                    method:'POST',
                    headers:{'X-CSRF-TOKEN':document.querySelector('meta[name="csrf-token"]').getAttribute('content')}
                });
                if(res.ok) await this.refreshCart();
            }catch(e){console.error(e);}
            @else
            const existing=this.cartItems.find(i=>i.product_id===productId);
            if(existing) existing.quantity++;
            else this.cartItems.push({id:Date.now()+productId, product_id:productId,name,price,quantity:1,image_url:imageUrl});
            this.refreshCart();
            @endauth
        },
        async removeFromCart(productId){
            @auth
            try{
                const res=await fetch(`/cart/${productId}`,{
                    method:'DELETE',
                    headers:{'X-CSRF-TOKEN':document.querySelector('meta[name="csrf-token"]').getAttribute('content')}
                });
                if(res.ok) await this.refreshCart();
            }catch(e){console.error(e);}
            @else
            this.cartItems=this.cartItems.filter(i=>i.product_id!==productId);
            this.refreshCart();
            @endauth
        }
    }
}
</script>

</body>
</html>
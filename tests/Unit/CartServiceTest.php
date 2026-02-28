<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Product;
use App\Models\Cart;
use App\Services\Cart\CartService;

class CartServiceTest extends TestCase
{
    use RefreshDatabase;

    protected CartService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new CartService(app('db'));
    }

    public function test_add_to_cart_creates_row_or_increments()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $this->service->addToCart($user->id, $product->id, 2);
        $this->assertDatabaseHas('carts', ['user_id' => $user->id, 'product_id' => $product->id, 'quantity' => 2]);

        // adding again increments
        $this->service->addToCart($user->id, $product->id, 3);
        $this->assertDatabaseHas('carts', ['quantity' => 5]);
    }

    public function test_update_quantity_checks_stock_and_exists()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();
        // ensure predictable stock for the assertions below
        $product->stock = 5;
        $product->save();

        Cart::create(['user_id' => $user->id, 'product_id' => $product->id, 'quantity' => 1]);

        // regular update should work (4 < stock)
        $this->service->updateQuantity($user->id, $product->id, 4);
        $this->assertDatabaseHas('carts', ['quantity' => 4]);

        // exceeding stock should throw
        $this->expectException(\RuntimeException::class);
        $this->service->updateQuantity($user->id, $product->id, 20);    }

    public function test_remove_item_deletes_row()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();
        Cart::create(['user_id' => $user->id, 'product_id' => $product->id, 'quantity' => 2]);

        $this->service->removeItem($user->id, $product->id);
        $this->assertDatabaseMissing('carts', ['user_id' => $user->id]);
    }

    public function test_merge_cart_accumulates_quantities()
    {
        $user = User::factory()->create();
        $prodA = Product::factory()->create();
        $prodB = Product::factory()->create();
        // set high stock values to avoid random failures
        $prodA->stock = 100;
        $prodA->save();
        $prodB->stock = 100;
        $prodB->save();

        Cart::create(['user_id' => $user->id, 'product_id' => $prodA->id, 'quantity' => 1]);

        $this->service->mergeCart($user->id, [
            ['product_id' => $prodA->id, 'quantity' => 3],
            ['product_id' => $prodB->id, 'quantity' => 2],
        ]);

        $this->assertDatabaseHas('carts', ['product_id' => $prodA->id, 'quantity' => 4]);
        $this->assertDatabaseHas('carts', ['product_id' => $prodB->id, 'quantity' => 2]);
    }

    public function test_items_and_count_methods()
    {
        $user = User::factory()->create();
        $p1 = Product::factory()->create();
        $p2 = Product::factory()->create();
        Cart::create(['user_id' => $user->id, 'product_id' => $p1->id, 'quantity' => 2]);
        Cart::create(['user_id' => $user->id, 'product_id' => $p2->id, 'quantity' => 1]);

        $items = $this->service->itemsForUser($user->id);
        $this->assertCount(2, $items);
        $this->assertEquals(3, $this->service->countForUser($user->id));
    }
}

<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class DatabaseIntegrityTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Verify key foreign key constraints exist for critical tables.
     */
    public function test_carts_table_has_foreign_keys()
    {
        // Doctrine schema manager not available on SQLite in memory connection
        if (Schema::getConnection() instanceof \Illuminate\Database\SQLiteConnection) {
            $this->markTestSkipped('Foreign key introspection unavailable on SQLite');
        }

        $sm = Schema::getConnection()->getDoctrineSchemaManager();
        $fks = collect($sm->listTableForeignKeys('carts'))->pluck('getLocalColumns')->toArray();

        $this->assertTrue(collect($fks)->contains(['user_id']), 'carts.user_id FK missing');
        $this->assertTrue(collect($fks)->contains(['product_id']), 'carts.product_id FK missing');
    }

    public function test_orders_table_has_expected_constraints()
    {
        if (Schema::getConnection() instanceof \Illuminate\Database\SQLiteConnection) {
            $this->markTestSkipped('Foreign key introspection unavailable on SQLite');
        }

        $sm = Schema::getConnection()->getDoctrineSchemaManager();
        $fks = collect($sm->listTableForeignKeys('orders'))->pluck('getLocalColumns')->toArray();

        $this->assertTrue(collect($fks)->contains(['store_id']), 'orders.store_id FK missing');
        $this->assertTrue(collect($fks)->contains(['buyer_id']), 'orders.buyer_id FK missing');
    }

    public function test_order_items_table_has_constraints()
    {
        if (Schema::getConnection() instanceof \Illuminate\Database\SQLiteConnection) {
            $this->markTestSkipped('Foreign key introspection unavailable on SQLite');
        }

        $sm = Schema::getConnection()->getDoctrineSchemaManager();
        $fks = collect($sm->listTableForeignKeys('order_items'))->pluck('getLocalColumns')->toArray();

        $this->assertTrue(collect($fks)->contains(['order_id']), 'order_items.order_id FK missing');
        $this->assertTrue(collect($fks)->contains(['product_id']), 'order_items.product_id FK missing');
    }
}

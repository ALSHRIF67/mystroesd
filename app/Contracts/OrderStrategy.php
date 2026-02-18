<?php

namespace App\Contracts;

use Illuminate\Http\RedirectResponse;

interface OrderStrategy
{
    /**
     * Execute an order operation and return a response (redirect or data)
     */
    public function place(array $payload): RedirectResponse;
}

<?php

namespace App\Services\Orders\Strategies;

use App\Contracts\OrderStrategy;
use App\Models\Store;
use App\Models\WhatsappOrderLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;

class WhatsAppOrderStrategy implements OrderStrategy
{
    protected Store $store;

    public function __construct(Store $store)
    {
        $this->store = $store;
    }

    public function place(array $payload): RedirectResponse
    {
        // Build prefilled message
        $productName = $payload['product_name'] ?? '';
        $qty = $payload['quantity'] ?? 1;
        $buyerName = $payload['buyer_name'] ?? '';
        $message = "طلب عبر الموقع:\n";
        $message .= "المنتج: " . $productName . "\n";
        $message .= "الكمية: " . $qty . "\n";
        if ($buyerName) $message .= "الاسم: " . $buyerName . "\n";
        if (!empty($payload['notes'])) $message .= "ملاحظات: " . $payload['notes'] . "\n";

        // Log
        try {
            WhatsappOrderLog::create([
                'store_id' => $this->store->id,
                'user_id' => $payload['buyer_id'] ?? null,
                'product_id' => $payload['product_id'] ?? null,
                'message' => $message,
            ]);
        } catch (\Exception $e) {
            Log::error('WhatsApp log failed: ' . $e->getMessage());
        }

        // Build WhatsApp URL (assume international number stored)
        $phone = $this->store->whatsapp ?? '';
        $encoded = rawurlencode($message);
        $waUrl = 'https://wa.me/' . preg_replace('/[^0-9]/', '', $phone) . '?text=' . $encoded;

        return redirect()->away($waUrl);
    }
}

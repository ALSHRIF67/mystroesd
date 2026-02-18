@extends('layouts.app')

@section('title','My Orders')

@section('content')
    <div class="max-w-5xl mx-auto p-6">
        <h1 class="text-2xl font-bold mb-4">طلباتي</h1>

        <div class="bg-white p-4 rounded">
            <table class="w-full text-right">
                <thead>
                    <tr class="text-sm text-gray-600">
                        <th class="p-2">#</th>
                        <th class="p-2">المتجر</th>
                        <th class="p-2">المجموع</th>
                        <th class="p-2">الحالة</th>
                        <th class="p-2">الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($orders as $o)
                        <tr class="border-t">
                            <td class="p-2">{{ $o->id }}</td>
                            <td class="p-2">{{ $o->store?->name ?? $o->store_id }}</td>
                            <td class="p-2">{{ number_format($o->total,2) }}</td>
                            <td class="p-2">{{ $o->status }}</td>
                            <td class="p-2"><a href="{{ route('orders.show',$o->id) }}" class="px-2 py-1 bg-blue-600 text-white rounded">عرض</a></td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            <div class="mt-4">{{ $orders->links() }}</div>
        </div>
    </div>
@endsection

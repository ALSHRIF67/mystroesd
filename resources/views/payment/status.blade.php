@extends('layouts.app')

@section('title','Payment Status')

@section('content')
    <div class="max-w-3xl mx-auto p-6">
        <h1 class="text-2xl font-bold mb-4">حالة الدفع</h1>
        <div class="bg-white p-6 rounded">
            @if(session('success'))
                <div class="text-green-700">{{ session('success') }}</div>
            @elseif(session('error'))
                <div class="text-red-700">{{ session('error') }}</div>
            @else
                <div>حالة الدفع: {{ $status ?? 'غير معروف' }}</div>
            @endif
        </div>
    </div>
@endsection

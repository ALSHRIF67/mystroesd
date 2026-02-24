@props(['icon' => 'fa-star', 'title' => '', 'desc' => ''])

<div class="flex items-start gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
    <div class="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 text-lg">
        <i class="fas {{ $icon }}"></i>
    </div>
    <div>
        <div class="font-bold text-gray-900">{{ $title }}</div>
        <div class="text-gray-600 text-sm">{{ $desc }}</div>
    </div>
</div>

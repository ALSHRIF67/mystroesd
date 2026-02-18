@props(['user' => auth()->user()])
<div class="relative">
    <button class="flex items-center gap-2">
        <i class="fas fa-user-circle"></i>
        <span>{{ $user->name ?? 'Guest' }}</span>
    </button>
</div>

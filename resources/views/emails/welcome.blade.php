<!DOCTYPE html>
<html>
<head>
    <title>Welcome to {{ config('app.name') }}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .button { background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <h2>Hello {{ $user->name }}!</h2>
    <p>Thank you for registering with {{ config('app.name') }}.</p>
    <p>We are excited to have you on board.</p>
    <p><a href="{{ url('/dashboard') }}" class="button">Visit Dashboard</a></p>
    <p>If you have any questions, feel free to contact us.</p>
    <p>Best regards,<br>{{ config('app.name') }} Team</p>
</body>
</html>
<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\QueryException;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'phone' => ['required', 'regex:/^[0-9]{6,20}$/', Rule::unique('users', 'phone')],
            'country_code' => ['required', 'string', 'max:6'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
            'is_marketing_subscribed' => ['sometimes', 'boolean'],
            'terms_accepted' => ['accepted'],
        ]);

        try {
            $data = [
                // server-side: generate `name` from the provided `first_name` only
                'name' => trim($validated['first_name']),
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'phone' => $validated['phone'],
                'country_code' => $validated['country_code'],
                'is_marketing_subscribed' => $request->boolean('is_marketing_subscribed'),
                'terms_accepted' => true,
            ];

            // Use Eloquent create (prevent mass-assignment issues via fillable on model)
            $user = User::create($data);
        } catch (QueryException $e) {
            $errorInfo = $e->errorInfo ?? null;
            $driverCode = $errorInfo[1] ?? null;
            $driverMsg = $errorInfo[2] ?? $e->getMessage();

            if ($driverCode === 1062 || str_contains($driverMsg, 'Duplicate')) {
                if (str_contains($driverMsg, 'users_phone_unique') || str_contains($driverMsg, 'phone')) {
                    return back()->withInput()->withErrors(['phone' => 'رقم الهاتف مسجل بالفعل.']);
                }

                if (str_contains($driverMsg, 'users_email_unique') || str_contains($driverMsg, 'email')) {
                    return back()->withInput()->withErrors(['email' => 'البريد الإلكتروني مسجل بالفعل.']);
                }

                return back()->withInput()->withErrors(['email' => 'قيمة مكررة موجودة في قاعدة البيانات.']);
            }

            throw $e;
        }

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}

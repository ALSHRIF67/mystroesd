import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="تسجيل الدخول" />

            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold">تسجيل الدخول</h1>
                <p className="text-sm text-gray-500 mt-1">
                    مرحباً بعودتك 
                </p>
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600 text-center">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4 text-right" dir="rtl">
                {/* Email */}
                <div>
                    <InputLabel htmlFor="email" value="البريد الإلكتروني" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="email"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                {/* Password */}
                <div>
                    <InputLabel htmlFor="password" value="كلمة المرور" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Remember me */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="text-sm text-gray-600">
                            تذكرني
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm text-indigo-600 hover:underline"
                        >
                            نسيت كلمة المرور؟
                        </Link>
                    )}
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <PrimaryButton
                        className="w-full justify-center"
                        disabled={processing}
                    >
                        تسجيل الدخول
                    </PrimaryButton>

                    <p className="text-sm text-center text-gray-600">
                        ما عندك حساب؟
                        <Link
                            href={route('register')}
                            className="text-indigo-600 hover:underline mr-1"
                        >
                            تسجيل جديد
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}

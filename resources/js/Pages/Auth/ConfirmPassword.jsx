import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Confirm Password" />

            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
                    <h2 className="text-center text-3xl font-extrabold text-blue-800">
                        Confirm Your Password
                    </h2>

                    <p className="mt-2 text-center text-gray-700">
                        This is a secure area of the application. Please confirm your password before continuing.
                    </p>

                    <form onSubmit={submit} className="mt-6 space-y-6">
                        {/* Password Field */}
                        <div>
                            <InputLabel htmlFor="password" value="Password" className="text-gray-700" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                                isFocused={true}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Enter your password"
                            />
                            <InputError message={errors.password} className="mt-2 text-sm text-red-600" />
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-end">
                            <PrimaryButton
                                className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                disabled={processing}
                            >
                                Confirm
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </GuestLayout>
    );
}
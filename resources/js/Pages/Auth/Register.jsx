import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
  const [localErrors, setLocalErrors] = useState({});
  const { data, setData, post, processing, errors, reset } = useForm({
    first_name: '',
    email: '',
    phone: '',
    country_code: '+249',
    password: '',
    password_confirmation: '',
    terms_accepted: false,
    is_marketing_subscribed: false,
  });

  const submit = (e) => {
    e.preventDefault();
    setLocalErrors({});

    // Lightweight client-side detection of obvious SQL-like payloads (UX only).
    // Server-side validation is authoritative and required for security.
    const suspiciousSql = /(--|;|\/\*|\*\/|\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC|UNION)\b)/i;
    const toCheck = {
      first_name: data.first_name,
      email: data.email,
      phone: data.phone,
      password: data.password,
    };

    for (const [k, v] of Object.entries(toCheck)) {
      if (typeof v === 'string' && suspiciousSql.test(v)) {
        setLocalErrors({ [k]: 'قيمة غير صالحة' });
        return;
      }
    }

    // Trim / normalize common fields (client-side convenience)
    setData('email', String(data.email || '').trim());
    setData('phone', String(data.phone || '').trim());

    // Preserve existing backend-compatible `name` field (no backend edits requested)
    setData('name', `${data.first_name?.trim() || ''}${data.last_name ? ' ' + data.last_name.trim() : ''}`);

    post(route('register'), {
      onFinish: () => reset('password', 'password_confirmation'),
    });
  };

  return (
    <GuestLayout>
      <Head title="إنشاء حساب" />

      <form onSubmit={submit} autoComplete="off" noValidate className="space-y-4 text-right" dir="rtl">
        {/* hidden dummy inputs to discourage browser autofill (UX-only) */}
        <input type="text" name="__username_fake" autoComplete="username" tabIndex={-1} style={{ position: 'absolute', left: '-9999px', opacity: 0 }} />
        <input type="password" name="__password_fake" autoComplete="new-password" tabIndex={-1} style={{ position: 'absolute', left: '-9999px', opacity: 0 }} />

    {/* First Name */}
    <div>
        <InputLabel value="اسم محل التجاري " />
        <TextInput
            value={data.first_name}
placeholder="اسم محل  التجاري"         
   className="mt-1 block w-full"
            onChange={(e) => setData('first_name', e.target.value)}
            required
        />
        <InputError message={errors.first_name || localErrors.first_name} className="mt-2" />
    </div>

 

    {/* Email */}
    <div>
        <InputLabel value="البريد الإلكتروني" />
        <TextInput
            name="email"
            type="email"
            autoComplete="off"
            value={data.email}
            className="mt-1 block w-full"
            onChange={(e) => setData('email', e.target.value)}
            required
        />
        <InputError message={errors.email || localErrors.email} className="mt-2" />
    </div>

    {/* Phone */}
    <div className="flex gap-2">
        <select
          autoComplete="off"
            className="border rounded-md"
            value={data.country_code}
            onChange={(e) => setData('country_code', e.target.value)}
        >
            <option value="+249">🇸🇩 +249</option>
        </select>

    <TextInput
                        type="tel"
                        name="phone"
                        inputMode="tel"
                        maxLength={20}
                        autoComplete="tel-national"
                        placeholder="رقم واتس اب"
                        value={data.phone}
                        className="flex-1"
                        onChange={(e) => setData('phone', e.target.value)}
                        required
                    /> 
         
    </div>
    <InputError message={errors.phone || localErrors.phone} className="mt-2" />

    {/* Password */}
    <div>
        <InputLabel value="كلمة المرور" />
        <TextInput
            name="password"
            type="password"
            autoComplete="new-password"
            value={data.password}
            className="mt-1 block w-full"
            onChange={(e) => setData('password', e.target.value)}
            required
        />
        <p className="text-xs text-gray-500 mt-1">
            يجب أن تكون 6 أحرف على الأقل
        </p>
        <InputError message={errors.password || localErrors.password} className="mt-2" />
    </div>

    {/* Confirm Password */}
    <div>
        <InputLabel value="تأكيد كلمة المرور" />
        <TextInput
            name="password_confirmation"
            type="password"
            autoComplete="new-password"
            value={data.password_confirmation}
            className="mt-1 block w-full"
            onChange={(e) =>
                setData('password_confirmation', e.target.value)
            }
            required
        />
        <InputError message={errors.password_confirmation || localErrors.password_confirmation} className="mt-2" />
    </div>

    {/* Checkboxes */}
    <div className="space-y-2">
        <label className="flex items-center gap-2">
            <input
                type="checkbox"
                checked={data.terms_accepted}
                onChange={(e) =>
                    setData('terms_accepted', e.target.checked)
                }
            />
            <span>أوافق على الشروط والأحكام</span>
        </label>
        <InputError message={errors.terms_accepted || localErrors.terms_accepted} />

        <label className="flex items-center gap-2">
            <input
                type="checkbox"
                checked={data.is_marketing_subscribed}
                onChange={(e) =>
                    setData('is_marketing_subscribed', e.target.checked)
                }
            />
            <span>الاشتراك في الرسائل التسويقية</span>
        </label>
    </div>

    <PrimaryButton disabled={processing} className="w-full justify-center">
        إنشاء حساب
    </PrimaryButton>

            </form>
        </GuestLayout>
    );
}

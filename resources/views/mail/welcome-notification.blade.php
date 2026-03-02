<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>مرحباً بك في {{ config('app.name') }}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <style>
        body {
            margin:0;
            padding:0;
            background-color:#f4f4f4;
            font-family: Arial, sans-serif;
        }

        .container {
            width:600px;
            max-width:90%;
            background:#ffffff;
            margin:20px auto;
            padding:30px;
            border:1px solid #e5e5e5;
        }

        .button {
            background:#1e40af;
            color:#ffffff;
            padding:12px 25px;
            text-decoration:none;
            display:inline-block;
            font-size:15px;
        }

        @media only screen and (max-width: 600px) {
            .container {
                width:95% !important;
                padding:20px !important;
            }

            h2 {
                font-size:20px !important;
            }

            p {
                font-size:15px !important;
            }

            .button {
                display:block !important;
                width:100% !important;
                text-align:center !important;
            }
        }
    </style>
</head>

<body>

    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center">

                <div class="container">

                    <!-- Header -->
                    <h2 style="margin-top:0; color:#1e40af;">
                        مرحباً بك في {{ config('app.name') }}
                    </h2>

                    <!-- Message -->
                    <p style="line-height:1.8; color:#333;">
                        مرحباً {{ $user->name }}،
                    </p>

                    <p style="line-height:1.8; color:#555;">
                        نشكرك على التسجيل في {{ config('app.name') }}.
                        نحن سعداء بانضمامك إلينا ونتطلع لتقديم أفضل تجربة لك.
                    </p>

                    <p style="line-height:1.8; color:#555;">
                        يمكنك الآن الدخول إلى حسابك والبدء باستخدام خدماتنا.
                    </p>

                    <!-- Button -->
                    <div style="text-align:center; margin:30px 0;">
                        <a href="{{ url('/dashboard') }}" class="button">
                            الدخول إلى حسابي
                        </a>
                    </div>

                    <!-- Footer -->
                    <hr style="border:none; border-top:1px solid #eeeeee;">

                    <p style="font-size:13px; color:#999; text-align:center;">
                        © {{ date('Y') }} {{ config('app.name') }}  
                        <br>
                        جميع الحقوق محفوظة
                    </p>

                </div>

            </td>
        </tr>
    </table>

</body>
</html>
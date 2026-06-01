const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

const EMAIL = 'sublipop9920@outlook.com';
const PASSWORD = 'Ggnoteam2415';

const mailTransport = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  tls: {
    ciphers: 'SSLv3'
  },
  auth: {
    user: EMAIL,
    pass: PASSWORD,
  },
});

const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Poppins',Arial,sans-serif;">
  <div style="max-width:500px;margin:0 auto;background:#12121a;border-radius:20px;padding:40px 30px;border:1px solid rgba(224,64,251,0.3);margin-top:20px;">

    <div style="text-align:center;margin-bottom:30px;">
      <h1 style="color:#e040fb;font-size:32px;margin:0;font-weight:800;">Subli Pop</h1>
      <p style="color:rgba(255,255,255,0.6);margin:5px 0 0;font-size:14px;">Arte en Sublimacion Premium</p>
    </div>

    <h2 style="color:#ffffff;text-align:center;margin:0 0 10px;font-size:24px;">Hola!</h2>
    <p style="color:rgba(255,255,255,0.8);text-align:center;margin:0 0 25px;font-size:15px;line-height:1.6;">
      Gracias por unirte a <strong style="color:#e040fb;">Subli Pop</strong>.<br>Estamos encantados de tenerte con nosotros.
    </p>

    <p style="color:rgba(255,255,255,0.7);text-align:center;font-size:14px;line-height:1.6;margin:0 0 30px;">
      Para activar tu cuenta y comenzar a crear productos increibles, verifica tu correo electronico haciendo clic en el boton de abajo:
    </p>

    <div style="text-align:center;margin-bottom:30px;">
      <a href="{{LINK}}" style="display:inline-block;background:linear-gradient(135deg,#e040fb,#7c4dff);color:#ffffff;padding:16px 45px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;box-shadow:0 10px 30px rgba(224,64,251,0.4);">
        Verificar mi cuenta
      </a>
    </div>

    <p style="color:rgba(255,255,255,0.5);text-align:center;font-size:12px;margin:0;">
      Este enlace expira en 5 minutos.<br>
      Si no creaste esta cuenta, puedes ignorar este mensaje.
    </p>

    <div style="margin-top:40px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.1);text-align:center;">
      <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0;">
        © 2026 Subli Pop · sublipop.com
      </p>
    </div>

  </div>
</body>
</html>
`;

exports.sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
  if (!user.email) {
    console.log('User has no email, skipping');
    return null;
  }

  try {
    const link = await admin.auth().generateEmailVerificationLink(user.email, {
      url: 'https://sublipop123.github.io/SUBLIPOP/',
    });

    const personalizedHtml = htmlTemplate.replace('{{LINK}}', link);

    const mailOptions = {
      from: '"Subli Pop" <sublipop9920@outlook.com>',
      to: user.email,
      subject: 'Bienvenido a Subli Pop - Verifica tu cuenta',
      html: personalizedHtml,
    };

    await mailTransport.sendMail(mailOptions);
    console.log('Email sent to:', user.email);
    return null;
  } catch (error) {
    console.error('Error sending email:', error);
    return null;
  }
});
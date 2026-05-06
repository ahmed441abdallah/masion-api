import nodemailer from 'nodemailer';
export const sendEmail = async (opt) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use STARTTLS (upgrade connection to TLS after connecting)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  const { email } = opt;
  const emailTemplate = `
    <h1>Hi, ${opt.name} How Are You?</h1>
    <br />
    <h3>Reset Password Verification Code</h3>
    <p>Your reset password verification code is:
    <h1 style="font-size: 24px; font-weight: bold; color:rgb(89, 88, 90);">${opt.resetCode}</h1>
    </p>
    <p>Please use this code to reset your password.</p>
    <p>This code will expire in 10 minutes.</p>
    <p>If you did not request this code, please ignore this email.</p>
    <p>Thank you for using our service.</p>
  `;
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: opt.email,
    subject: 'Reset Password Verification Code',
    html: emailTemplate,
  };
  await transporter.sendMail(mailOptions);
};

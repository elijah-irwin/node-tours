const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create nodemailer transport.
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2) Define email options.
  const mailOptions = {
    from: 'Mak Irwin <mak@mak.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) Send the email.
  await transport.sendMail(mailOptions);
};

module.exports = sendEmail;

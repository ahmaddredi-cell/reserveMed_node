import nodemailer from 'nodemailer';

export async function sendEmail(to, subject, html) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: process.env.EMAILSENDER,
      pass: process.env.PASSWORDSENDER,
    },
  });

  const info = await transporter.sendMail({
    from: `"Fred Foo 👻" <${process.env.EMAILSENDER}>`, // sender address
    to, // list of receivers
    subject, // Subject line
    // plain text body
    html, // html body
  });
  return info;
}

const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  const { csv, date, heightOfCut, userName } = JSON.parse(event.body || '{}');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'dfreeborough@live.co.uk',
    subject: `Clipping Data Report - ${date}`,
    text: `Dear Manager,\n\nPlease find attached the Clipping Data report for ${date}. The Height of Cut is ${heightOfCut} mm. Submitted by ${userName}.\n\nBest regards,\nGanton GC Team`,
    attachments: [{ filename: 'clipping_data.csv', content: Buffer.from(csv, 'base64').toString('utf-8') }],
  };
  try {
    await transporter.sendMail(mailOptions);
    return { statusCode: 200, body: JSON.stringify({ message: 'Email sent successfully' }) };
  } catch (error) {
    console.error('Email sending error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to send email' }) };
  }
};
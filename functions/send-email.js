const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const { csv, date, heightOfCut, userName } = JSON.parse(event.body || '{}');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com', // Replace with your Gmail address
      pass: 'your-app-specific-password', // Replace with App Password
    },
  });

  const emailSubject = `Clipping Data Report - ${date}`;
  const emailBody = `Dear Manager,\n\nPlease find attached the Clipping Data report for ${date}. The Height of Cut is ${heightOfCut} mm. Submitted by ${userName}.\n\nBest regards,\nGanton GC Team`;
  const csvData = Buffer.from(csv, 'base64').toString('utf-8');

  const mailOptions = {
    from: 'your-email@gmail.com', // Replace with your Gmail address
    to: 'manager@example.com', // Replace with your manager's email
    subject: emailSubject,
    text: emailBody,
    attachments: [
      {
        filename: 'clipping_data.csv',
        content: csvData,
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent successfully' }),
    };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send email' }),
    };
  }
};
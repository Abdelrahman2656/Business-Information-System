import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.USER_SEND,
      pass: process.env.USER_PASS,
    }
  });

  const mailOptions = {
    from: {
      name: "Business Information System",
      address: process.env.USER_SEND,
    },
    to,
    subject,
    html,
    priority: "high",
    headers: {
      'X-Priority': '1',
      'Importance': 'High',
      'X-Mailer': 'Business Information System'
    }
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

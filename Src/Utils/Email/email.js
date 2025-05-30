import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.USER_SEND,
      pass: process.env.USER_PASS,
    },
    tls: {
      rejectUnauthorized: false,
      
    },
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
      'List-Unsubscribe': `<mailto:${process.env.USER_SEND}?subject=unsubscribe>`,
    },
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

import nodemailer from 'nodemailer'
export const sendEmail =async({to , subject , html ,attachments = [] })=>{
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    service:"gmail",
    auth:{
        user: process.env.USER_SEND,
        pass: process.env.USER_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
})

const mailOptions = {
    to,
    from: {
        name: "Business Information System 2025",
        address: process.env.HTI_SENDER
    },
    subject,
    html,
    attachments,
    headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'X-Mailer': 'Business Information System'
    }
}

try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
} catch (error) {
    console.error('Error sending email:', error);
    throw error;
}
}
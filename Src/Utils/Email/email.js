import nodemailer from 'nodemailer'

export const sendEmail = async ({ to, subject, html }) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.USER_SEND,
            pass: process.env.USER_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    })

    const mailOptions = {
        from: `"Business Information System" <${process.env.USER_SEND}>`,
        to,
        subject,
        html,
        headers: {
            'X-Priority': '1',
            'X-MSMail-Priority': 'High',
            'Importance': 'high',
            'X-Mailer': 'Business Information System',
            'List-Unsubscribe': `<mailto:${process.env.USER_SEND}?subject=unsubscribe>`,
            'Precedence': 'bulk'
        }
    }

    try {
        const info = await transporter.sendMail(mailOptions)
        console.log("Email sent successfully:", info.messageId)
        return info
    } catch (error) {
        console.error("Error sending email:", error)
        throw error
    }
}
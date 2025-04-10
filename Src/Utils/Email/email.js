import nodemailer from 'nodemailer'
export const sendEmail =async({to , subject , html ,attachments = [] })=>{
const transporter = nodemailer.createTransport({
    port:587 ,
    secure: false,
    service:"gmail",
    auth:{
        user:process.env.USER_SEND  , 
        pass:process.env.USER_PASS
    }
})
await transporter.sendMail({
    to,
    from:`"Business Information System " <${process.env.USER_SEND}>`,
    subject,
    html,
    attachments
})
}
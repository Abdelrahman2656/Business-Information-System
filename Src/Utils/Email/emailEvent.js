import { sendEmail } from "./email.js"
import { emailHtml } from "./email-Html.js"

// send email to know his id
export const generateID = async(loginIdentifier,customId , password )=>{
    await sendEmail({
        to:loginIdentifier,
        subject:"Your ID And Password",
        html:emailHtml(customId,password)

    })
}
import { AppError } from "../Utils/AppError.js"
import { messages } from "../Utils/constant/messages.js"

export const isAuthorization = (roles = [])=>{
    return (req,res,next)=>{
        if (!req.authUser) {
            return next(new AppError("User not authenticated", 401));
          }
        if(!roles.includes(req.authUser.role)){
            return next(new AppError(messages.user.notAuthorized,401))
        }
        next()
    }
}
import mongoose from "mongoose"

 const dbconnection = async()=>{
    return await mongoose.connect(process.env.DB_URL).then(() => {
        console.log(`db connected successfully ${process.env.DB_URL}`);
    }).catch((error) => {
       console.error("❌ Failed to connect to DB:", error);
    })
}
export default dbconnection
import mongoose from "mongoose"

 const dbconnection = async()=>{
    return await mongoose.connect(process.env.DB_URL).then(() => {
        console.log(`db connected successfully ${process.env.DB_URL}`);
    }).catch((err) => {
        console.log('field to connect to db');
    })
}
export default dbconnection
process.on('unhandledRejection',(err)=>{
    console.log('error',err);
    
})
import  bootstrap  from "./Src/bootstrap.js";
import express from 'express'
const app = express()
const port = process.env.PORT||3001



bootstrap(app, express)

app.get('/', (req, res) => res.send('Hello World In Student System '))
process.on('unhandledRejection',(err)=>{
    console.log('error',err);
    
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
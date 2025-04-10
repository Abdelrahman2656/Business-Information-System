
import  bootstrap  from "./Src/bootstrap.js";
import express from 'express'
export const app = express()




bootstrap(app,express)

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server running on port ${port}`));
app.get('/', (req, res) => res.send('Hello World In Student System '))
//dA2NSijj@M4WeuF
export default app
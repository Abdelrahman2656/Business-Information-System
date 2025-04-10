import pkg from 'bcrypt'
export  const comparePassword = async ({password ='',hashPassword=''})=>{
return pkg.compareSync(password,hashPassword)
}
import pkg from 'bcrypt'

export const hashPassword= ({password = '' , SALT_ROUND = process.env.SALT_ROUND})=>{
return pkg.hashSync(password,Number(SALT_ROUND))
}
import jwt from "jsonwebtoken";
// generate token
export const generateToken = ({
  payload,
  secretKey = process.env.SECRET_KEY,
  options
}) => {
  return jwt.sign( payload, secretKey, options );
};
//verify token
export const verifyToken = ({ token, secretKey = process.env.SECRET_KEY }) => {
  try {
    return jwt.verify(token, secretKey);
  } catch (error) {
    return { error: error.message };
  }
};

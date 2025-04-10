import bcrypt from 'bcryptjs';

export const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export const hashOtp = async (otp: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
};

export const verifyOtp = (plain: string, hashed: string) => {
  return bcrypt.compare(plain, hashed);
};
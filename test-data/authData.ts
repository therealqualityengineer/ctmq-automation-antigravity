import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const authData = {
  validUser: {
    email: process.env.Staffing_USERNAME || 'valid_user_antigravity@test.com',
    password: process.env.Staffing_PASSWORD || 'Password123!',
  },
  invalidUser: {
    email: 'invalid_user_antigravity@test.com',
    password: 'WrongPassword!',
  },
  messages: {
    warningNoMatch: 'Warning: No match for E-Mail Address and/or Password.',
  },
};

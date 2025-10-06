import 'dotenv/config';

const required = (key: string) => {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env var: ${key}`);
  return v;
};

export const ENV = {
  PORT: Number(process.env.PORT ?? 3000),
  APP_BASE_URL: required('APP_BASE_URL'),

  ML_CLIENT_ID: required('ML_CLIENT_ID'),
  ML_CLIENT_SECRET: required('ML_CLIENT_SECRET'),
  ML_REDIRECT_URI: required('ML_REDIRECT_URI'),

  DATABASE_URL: required('DATABASE_URL'),
  JWT_SECRET: process.env.JWT_SECRET || 'change-me',
};

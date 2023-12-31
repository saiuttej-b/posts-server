export const ENV = Object.freeze({
  TZ: 'TZ',
  PORT: 'PORT',
  PROJECT_ENV: 'PROJECT_ENV',

  MONGO_DB_HOST: 'MONGO_DB_HOST',
  MONGO_DB_USERNAME: 'MONGO_DB_USERNAME',
  MONGO_DB_PASSWORD: 'MONGO_DB_PASSWORD',
  MONGO_DB_DATABASE: 'MONGO_DB_DATABASE',

  AWS_S3_SECRET_ACCESS_KEY: 'AWS_S3_SECRET_ACCESS_KEY',
  AWS_S3_ACCESS_KEY_ID: 'AWS_S3_ACCESS_KEY_ID',
  AWS_S3_REGION: 'AWS_S3_REGION',
  AWS_S3_BUCKET_NAME: 'AWS_S3_BUCKET_NAME',
  AWS_S3_BUCKET_BASE_URL: 'AWS_S3_BUCKET_BASE_URL',
});

export const Environments = Object.freeze({
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
});

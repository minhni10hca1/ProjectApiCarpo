const devConfig = {
  MONGO_URL: 'mongodb://minhni:minhni123@45.119.81.181:27017/carpo_test', //sử dụng dev local ted-laptop
  // MONGO_URL: 'mongodb://minhni:minhni123@45.119.81.181:27017/carpo-dev',
  // 'url': 'mongodb://ted:784673@ds123456.mlab.com:49466/mongodbroles',
  JWT_SECRET: 'thisisasecret',
};

const testConfig = {
  MONGO_URL: 'mongodb://minhni:minhni123@45.119.81.181:27017/carpo',
  JWT_SECRET: 'thisisasecret123',
  // MONGO_URL: 'mongodb://minhni:minhni123@45.119.81.181:27017/carpo-test',
};

const prodConfig = {
  // MONGO_URL: 'mongodb://localhost:27017/carpo',
  // MONGO_URL: 'mongodb://localhost:27017/ted-prod',
  MONGO_URL: 'mongodb://minhni:minhni123@127.0.0.1:27017/carpo', //su dung khi release edit
  // MONGO_URL: 'mongodb://ted:784673@ds135537.mlab.com:35537/ted-prod',
  // MONGO_URL: 'mongodb://minhni:minhni123@45.119.81.181:27017/carpo', //su dung để dev
  JWT_SECRET: 'thisisasecret',
};

const defaultConfig = {
  PORT: process.env.PORT || 7979,
};

function envConfig(env) {
  switch (env) {
    case 'development':
      return devConfig;
    case 'test':
      return testConfig;
    default:
      return prodConfig;
  }
}

export default {
  ...defaultConfig,
  ...envConfig(process.env.NODE_ENV),
};

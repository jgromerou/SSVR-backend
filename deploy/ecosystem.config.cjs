const path = require('node:path');

module.exports = {
  apps: [
    {
      name: 'ssvr-backend',
      script: 'dist/index.js',
      cwd: path.join(__dirname, '..'),
      instances: 1,
      exec_mode: 'fork',
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};

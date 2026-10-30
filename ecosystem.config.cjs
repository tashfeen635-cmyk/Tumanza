module.exports = {
  apps: [
    {
      name: 'tumanza',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/var/www/Tumanza',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_file: '.env',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};

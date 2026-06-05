module.exports = {
  apps: [
    {
      name: "language-learning",
      cwd: "/Users/julkarnine/www/LanguageLearning",
      script: "node_modules/.bin/tsx",
      args: "server/index.ts",
      env: {
        NODE_ENV: "production",
        PORT: "5173"
      },
      watch: false,
      autorestart: true,
      max_memory_restart: "300M"
    }
  ]
};

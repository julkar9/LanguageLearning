module.exports = {
  apps: [
    {
      name: "language-learning-api",
      cwd: "/Users/julkarnine/www/LanguageLearning",
      script: "pnpm",
      args: "--filter @language-learning/api start",
      env: {
        NODE_ENV: "production",
        PORT: "5174",
        DATABASE_URL: "postgresql://language_learning:language_learning@localhost:5175/language_learning?schema=public"
      },
      watch: false,
      autorestart: true,
      max_memory_restart: "300M"
    },
    {
      name: "language-learning-web",
      cwd: "/Users/julkarnine/www/LanguageLearning",
      script: "pnpm",
      args: "--filter @language-learning/web start",
      env: {
        NODE_ENV: "production",
        PORT: "5173",
        NEXT_PUBLIC_API_URL: "http://localhost:5174"
      },
      watch: false,
      autorestart: true,
      max_memory_restart: "300M"
    }
  ]
};

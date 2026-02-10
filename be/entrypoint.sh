#!/bin/sh
set -e

echo "⏳ Waiting for database..."
for i in $(seq 1 30); do
  if nc -z mssql 1433 2>/dev/null; then
    echo "✅ Database is ready!"
    break
  fi
  echo "⏳ Waiting for database... ($i/30)"
  sleep 2
done

echo "🔄 Running Prisma migrations..."
if npx prisma migrate deploy; then
  echo "✅ Migrations applied successfully"
else
  echo "⚠️  Migration failed — starting app anyway (check logs!)"
fi

echo "🚀 Starting application..."
exec node dist/main

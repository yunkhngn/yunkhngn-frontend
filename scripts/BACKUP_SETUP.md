# Database Backup Setup Guide

## Bước 1: Pull code mới từ GitHub

Trên server production, chạy:

```bash
cd /apps/yunkhngn-website
git pull origin main
```

**Lưu ý:** Bạn cần merge PR từ dev → main trước khi pull!

## Bước 2: Tạo thư mục backups

```bash
mkdir -p /apps/yunkhngn-website/backups
```

## Bước 3: Restart Docker containers

```bash
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

## Bước 4: Test backup script

```bash
cd /apps/yunkhngn-website
./scripts/backup-db.sh
```

Kiểm tra xem file backup đã được tạo chưa:

```bash
ls -lh backups/
```

Bạn sẽ thấy file kiểu: `blogdb_20240204_003000.bak`

## Bước 5: Setup Cron Job (Backup tự động)

Mở crontab:

```bash
crontab -e
```

Thêm dòng này vào cuối file (backup mỗi ngày lúc 2 giờ sáng):

```bash
0 2 * * * cd /apps/yunkhngn-website && ./scripts/backup-db.sh >> /apps/yunkhngn-website/backups/backup.log 2>&1
```

Lưu và thoát.

### Các tùy chọn lịch backup khác:

```bash
# Mỗi 6 giờ
0 */6 * * * cd /apps/yunkhngn-website && ./scripts/backup-db.sh >> /apps/yunkhngn-website/backups/backup.log 2>&1

# Mỗi 12 giờ
0 */12 * * * cd /apps/yunkhngn-website && ./scripts/backup-db.sh >> /apps/yunkhngn-website/backups/backup.log 2>&1

# Mỗi tuần (Chủ nhật 3 giờ sáng)
0 3 * * 0 cd /apps/yunkhngn-website && ./scripts/backup-db.sh >> /apps/yunkhngn-website/backups/backup.log 2>&1
```

## Bước 6: Kiểm tra cron job đã chạy

Xem log:

```bash
cat /apps/yunkhngn-website/backups/backup.log
```

Liệt kê các cron job đang chạy:

```bash
crontab -l
```

## Restore Database từ Backup

Nếu cần restore database từ file backup:

```bash
docker exec yunkhngn-mssql /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P 'Khoadeptrai1204!' \
  -Q "RESTORE DATABASE [blogdb] FROM DISK = N'/var/opt/mssql/backups/blogdb_20240204_003000.bak' WITH REPLACE" \
  -C
```

**Thay `blogdb_20240204_003000.bak` bằng tên file backup bạn muốn restore.**

## Tải backup về máy local

Từ máy local, chạy:

```bash
scp -r user@your-server:/apps/yunkhngn-website/backups ./local-backups/
```

Hoặc dùng rsync:

```bash
rsync -avz user@your-server:/apps/yunkhngn-website/backups/ ./local-backups/
```

## Kiểm tra dung lượng backups

```bash
du -sh /apps/yunkhngn-website/backups
```

## Thay đổi retention (thời gian giữ backup)

Mặc định script giữ backup trong 7 ngày. Để thay đổi, sửa biến `RETENTION_DAYS` trong file `scripts/backup-db.sh`.

```bash
nano scripts/backup-db.sh
# Thay đổi dòng: RETENTION_DAYS=7
```

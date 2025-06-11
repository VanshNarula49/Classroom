# Nginx Proxy Manager Setup Guide

## Step 1: Deploy and Access NPM

1. Run deployment: `./deploy-npm.sh`
2. Open NPM admin: `http://your-server-ip:81`
3. Login with default credentials:
   - Email: `admin@example.com`
   - Password: `changeme`
4. **IMPORTANT**: Change your password immediately!

## Step 2: Create Main Proxy Host

1. Click **"Proxy Hosts"** in the sidebar
2. Click **"Add Proxy Host"** button
3. Fill in the **Details** tab:
   - **Domain Names**: `classroom.set4.me` (your actual domain)
   - **Scheme**: `http`
   - **Forward Hostname/IP**: `frontend`
   - **Forward Port**: `80`
   - ✅ **Cache Assets**: Enable
   - ✅ **Block Common Exploits**: Enable
   - ✅ **Websockets Support**: Enable

4. Go to **SSL** tab:
   - ✅ **SSL Certificate**: Request a new SSL Certificate
   - ✅ **Force SSL**: Enable
   - ✅ **HTTP/2 Support**: Enable
   - **Email**: Your email for Let's Encrypt
   - ✅ **I Agree to the Let's Encrypt Terms of Service**

5. Click **Save**

## Step 3: Add API Path (Custom Location)

1. **Edit** the proxy host you just created
2. Go to **Advanced** tab
3. In **Custom Locations** section, click **Add Location**:
   - **Location**: `/api/`
   - **Scheme**: `http`
   - **Forward Hostname/IP**: `api`
   - **Forward Port**: `3000`
   - **Advanced**: Add this in the text box:
     ```nginx
     proxy_pass http://api:3000/;
     proxy_set_header Host $host;
     proxy_set_header X-Real-IP $remote_addr;
     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     proxy_set_header X-Forwarded-Proto $scheme;
     ```

## Step 4: Add MinIO Storage Path

1. Still in **Advanced** tab, click **Add Location** again:
   - **Location**: `/minio/`
   - **Scheme**: `http`
   - **Forward Hostname/IP**: `minio`
   - **Forward Port**: `9000`
   - **Advanced**: Add this in the text box:
     ```nginx
     proxy_pass http://minio:9000/;
     proxy_set_header Host $host;
     proxy_set_header X-Real-IP $remote_addr;
     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     proxy_set_header X-Forwarded-Proto $scheme;
     proxy_set_header X-Amz-Content-Sha256 $http_x_amz_content_sha256;
     proxy_set_header X-Amz-Date $http_x_amz_date;
     proxy_set_header Authorization $http_authorization;
     ```

## Step 5: Add MinIO Console Path (Optional)

1. Add another **Custom Location**:
   - **Location**: `/minio-console/`
   - **Scheme**: `http`
   - **Forward Hostname/IP**: `minio`
   - **Forward Port**: `9090`
   - **Advanced**: Add this in the text box:
     ```nginx
     proxy_pass http://minio:9090/;
     proxy_set_header Host $host;
     proxy_set_header X-Real-IP $remote_addr;
     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     proxy_set_header X-Forwarded-Proto $scheme;
     proxy_http_version 1.1;
     proxy_set_header Upgrade $http_upgrade;
     proxy_set_header Connection "upgrade";
     ```

6. Click **Save**

## Final URLs

After setup, your application will be available at:

- 🌐 **Main App**: `https://classroom.set4.me/`
- 🔗 **API**: `https://classroom.set4.me/api/`
- 📁 **MinIO Storage**: `https://classroom.set4.me/minio/`
- ⚙️ **MinIO Console**: `https://classroom.set4.me/minio-console/`

## Troubleshooting

### If SSL fails:
- Make sure your domain points to your server IP
- Check that ports 80 and 443 are open
- Wait a few minutes for DNS propagation

### If services don't load:
- Check container status: `docker-compose -f docker/docker-compose.npm.yml ps`
- Check logs: `docker-compose -f docker/docker-compose.npm.yml logs [service-name]`

### Test individual services:
- Frontend: `http://your-server-ip` (through NPM)
- API direct: `http://your-server-ip:3000` (won't work, it's internal only)
- NPM admin: `http://your-server-ip:81`

## Screenshots Reference

The NPM interface looks like this:

```
┌─ Nginx Proxy Manager ─────────────────────────┐
│ Dashboard │ Proxy Hosts │ SSL Certificates │   │
├───────────────────────────────────────────────┤
│ Add Proxy Host                               │
│                                               │
│ Details │ SSL │ Advanced                      │
│                                               │
│ Domain Names: classroom.set4.me               │
│ Forward to: frontend:80                       │
│                                               │
│ Custom Locations:                             │
│ ┌─────────────────────────────────────────┐   │
│ │ /api/ → api:3000                        │   │
│ │ /minio/ → minio:9000                    │   │
│ │ /minio-console/ → minio:9090            │   │
│ └─────────────────────────────────────────┘   │
└───────────────────────────────────────────────┘
```

That's it! NPM will handle all the SSL certificates automatically and route everything correctly.

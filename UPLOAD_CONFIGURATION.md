# File Upload Configuration - Large Files Support (up to 50MB)

## Overview
Your Kibegi Frontend app is now configured to handle large file uploads up to **50MB** with optimized timeout settings and retry mechanisms.

## Configuration Details

### 1. Frontend Upload Limits

**File Size Validation** ([Upload.tsx](src/pages/Upload.tsx))
- Maximum file size: **50MB** (52,428,800 bytes)
- Client-side validation prevents uploads exceeding this limit
- User-friendly error messages for oversized files

**Timeout Settings:**
- **Desktop uploads** (via Axios): 10 minutes (600,000ms)
- **Mobile uploads** (via Fetch): 10 minutes (600,000ms)
- **General API requests**: 2 minutes (120,000ms)

### 2. Network Configuration

**API Client** ([api.ts](src/lib/api.ts))
```typescript
maxContentLength: Infinity  // No client-side content length limit
maxBodyLength: Infinity     // No client-side body length limit
timeout: 120000             // 2 minutes default (overridden for uploads)
```

**Upload Service** ([uploadService.ts](src/services/uploadService.ts))
- Desktop: Axios with 10-minute timeout and progress tracking
- Mobile: Native Fetch API with retry mechanism (3 retries)
- Automatic mobile detection for optimal upload method
- Progress callbacks for upload status

### 3. Netlify Configuration

**Important Notes:**
- Netlify acts as a **CDN/proxy** for your frontend
- File uploads go directly to your **backend API**, not through Netlify
- Netlify's 6MB serverless function limit does NOT apply to proxied API requests
- Your backend API must handle the actual file processing and storage

**Configuration** ([netlify.toml](netlify.toml))
```toml
[functions]
  external_node_modules = ["axios"]
  node_bundler = "esbuild"

[[headers]]
  for = "/api/v1/uploads/*"
  [headers.values]
    Access-Control-Allow-Methods = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    Access-Control-Max-Age = "86400"
```

## Supported File Types

### Documents
- PDF, DOC, DOCX, TXT, RTF, ODT

### Spreadsheets
- XLS, XLSX, CSV, ODS

### Presentations
- PPT, PPTX, ODP, KEY

### Images
- JPG, JPEG, PNG, GIF, BMP, SVG, WEBP, ICO

### Videos
- MP4, AVI, MOV, WMV, FLV, MKV, WEBM, M4V

### Audio
- MP3, WAV, OGG, FLAC, M4A, AAC, WMA

### Archives
- ZIP, RAR, TAR, GZ, 7Z, BZ2, XZ

## Upload Flow

### Desktop Upload (Axios)
1. User selects file (validated for size and type)
2. FormData created with file, class_id, and optional custom filename
3. Upload via Axios with progress tracking
4. 10-minute timeout allows for slow connections
5. Server processes and stores file

### Mobile Upload (Fetch)
1. User selects file (validated for size and type)
2. FormData created immediately to preserve file reference
3. Upload via native Fetch API (more reliable on mobile)
4. Retry mechanism: up to 3 retries with exponential backoff
5. 10-minute timeout per attempt
6. Automatic retry on network failures

## Backend Requirements

Your backend API must support:

### 1. File Size Limits
```python
# Django settings.py example
DATA_UPLOAD_MAX_MEMORY_SIZE = 52428800  # 50MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 52428800  # 50MB
```

### 2. Request Timeouts
- Set appropriate timeout for large file processing
- Consider using celery/background tasks for large files

### 3. CORS Configuration
```python
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "https://yourdomain.netlify.app",
    "https://yourdomain.com",
]
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
```

### 4. Multipart Form Data
- Accept `multipart/form-data` content type
- Parse file, class_obj, and optional file_name fields
- Validate file size on server-side as well

## Environment Variables

Set in Netlify Dashboard or `.env.local`:

```env
VITE_API_URL=https://your-backend-api.com
```

**Important:** The API URL must point to your backend server that handles file uploads, not Netlify.

## Testing Large Uploads

### Test Files
Create test files of various sizes:
```bash
# Create a 10MB test file
dd if=/dev/zero of=test-10mb.bin bs=1024 count=10240

# Create a 25MB test file
dd if=/dev/zero of=test-25mb.bin bs=1024 count=25600

# Create a 50MB test file
dd if=/dev/zero of=test-50mb.bin bs=1024 count=51200
```

### Testing Checklist
- [ ] Upload small file (< 1MB) - should complete quickly
- [ ] Upload medium file (10-25MB) - should show progress
- [ ] Upload large file (45-50MB) - should complete within timeout
- [ ] Test on slow connection (throttle network in DevTools)
- [ ] Test on mobile device with real network
- [ ] Test with different file types
- [ ] Test upload cancellation
- [ ] Test retry mechanism (simulate network failure)

## Troubleshooting

### Upload Fails or Times Out

**1. Check Backend Logs**
- Is the backend receiving the request?
- Are there any server-side errors?
- Check backend timeout settings

**2. Check Network**
```javascript
// Open browser console and check:
console.log(import.meta.env.VITE_API_URL);
// Should show your backend API URL
```

**3. Check File Size**
```javascript
// File size is logged in console
// Look for: "🔵 Upload - Starting upload: { fileSize: ... }"
```

**4. Backend Server Timeout**
- Ensure backend server timeout > 10 minutes
- For nginx: `proxy_read_timeout 600s;`
- For gunicorn: `--timeout 600`

### Upload Works on Desktop but not Mobile

**Mobile-Specific Issues:**
1. **File reference cleared**: Already handled with immediate FormData creation
2. **Network stability**: Retry mechanism handles transient failures
3. **Memory constraints**: 50MB limit should work on most devices
4. **Browser compatibility**: Using native Fetch for better mobile support

**Check Mobile Console:**
- Use remote debugging (Chrome DevTools for Android)
- Safari Web Inspector for iOS
- Look for error messages in console logs

### Progress Not Showing

Desktop uploads show progress via `onUploadProgress` callback. If progress is not visible:
1. Check if progress UI component is rendered
2. Verify upload service is using desktop path (Axios)
3. Check console for progress logs: "📤 Upload progress: X%"

## Performance Optimization

### For Users
1. **Compress files** before uploading when possible
2. **Use stable network** for large uploads
3. **Avoid switching networks** during upload (e.g., WiFi to mobile data)

### For Developers
1. **Chunk uploads**: For files > 50MB, consider implementing chunked uploads
2. **Background uploads**: Use Service Workers for upload resilience
3. **Upload queue**: Allow multiple files to queue for upload
4. **Resume capability**: Implement upload resumption for interrupted uploads

## Security Considerations

### File Validation
- **Client-side**: Type and size validation (user experience)
- **Server-side**: MUST validate type, size, and scan for malware
- Never trust client-side validation alone

### File Storage
- Store uploaded files outside web root
- Use unique filenames (UUID) to prevent overwrites
- Implement virus scanning for uploaded files
- Set appropriate file permissions

### Access Control
- Verify user is authenticated before upload
- Check user has permission to upload to specified class
- Implement rate limiting to prevent abuse

## Monitoring

### Key Metrics to Track
1. **Upload success rate**: % of successful uploads
2. **Average upload time**: By file size bracket
3. **Retry rate**: How often retries are needed
4. **Timeout rate**: How often uploads timeout
5. **Error types**: Common error messages

### Logging
All upload attempts are logged with:
- File name and size
- Selected class
- Device type (mobile/desktop)
- Upload method (Axios/Fetch)
- Success/failure status
- Error messages (if any)

Check browser console for detailed logs prefixed with:
- 🔵 Info/Debug
- 🟢 Success
- 🔴 Error
- 📤 Progress
- 🔄 Retry

## Future Enhancements

Consider implementing:
1. **Chunked uploads** for files > 50MB
2. **Upload resumption** after network interruption
3. **Background upload** via Service Worker
4. **Batch uploads** for multiple files
5. **Upload queue management**
6. **Drag-and-drop** upload interface
7. **Image preview** before upload
8. **Automatic compression** for images
9. **Upload analytics** dashboard

## Support

If uploads still fail after following this guide:
1. Check backend API logs
2. Verify backend file size limits
3. Test with curl to isolate frontend issues
4. Check network connectivity and stability
5. Review browser console for specific errors

---

**Last Updated:** January 8, 2026  
**Max File Size:** 50MB  
**Upload Timeout:** 10 minutes  
**Retry Attempts:** 3 (mobile only)

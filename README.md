# ImgShare

A modern web application for uploading, organizing, and sharing image sets with ease. Designed for simplicity, speed, and security, this project leverages cutting-edge serverless architecture and cloud-native technologies.

## Features

- **Organize & Share:** Easily upload and share sets of images.
- **Temporary Storage:** Automatically deletes sets after 14 days.
- **Private Sharing:** Share links and QR codes for secure access.
- **Responsive Design:** Optimized for both desktop and mobile devices.
- **Fast Performance:** Images delivered via Cloudflare R2 for lightning-fast loading.

---

## Architecture Overview

This project is built on a modern serverless stack, combining powerful tools and platforms:

### Frontend
- **Language:** TypeScript
- **Framework:** Next.js 
- **Styling:** Tailwind CSS 
- **Components:** shadcn/ui

### Backend
- **Cloudflare Workers:** Handles scheduled tasks (e.g., cleaning up expired image sets)
- **Neon Database:** PostgreSQL-based serverless database used for storing metadata about image sets and user details.
- **R2 Object Storage:** Cloudflare’s S3-compatible object storage for storing uploaded images efficiently.

---

## How It Works

1. **Image Upload:** Users upload image sets via the dashboard.
2. **Image Hosting:** Images are stored in R2 with presigned URLs for secure access.
3. **Metadata Management:** Metadata, including set IDs and timestamps, is stored in the Neon database.
4. **Set Expiry:** A Cloudflare Worker runs daily to identify and delete expired image sets and their associated metadata.
5. **User Access:** Users can share links or QR codes for accessing the sets. Sets expire automatically after 14 days for privacy and cleanup.

---

## Project Setup

### Prerequisites
1. Node.js and npm installed.
2. A Neon Database instance set up.
3. Cloudflare account with R2 bucket and Workers enabled.
4. Vercel account for frontend hosting.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo.git
   cd your-repo
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - **SESSION_SECRET**: Cryptographic hash for generating session secrets.
   - **R2_ACCESS_KEY** and **R2_SECRET_ACCESS_KEY**: Provided by Cloudflare for authentication.
   - **R2_BUCKET_NAME**: Name of your R2 bucket
   - **R2_API**: URL for the R2 bucket.
   - **DB_DATABASE_URL**: Neon Database Connection String.
   - **WORKER_ENDPOINT**: API endpoint for you Cloudflare worker.
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel.
2. Add environment variables in the Vercel dashboard.
3. Deploy

### Backend (Cloudflare Workers & R2)
1. Configure `wrangler.toml` for your Cloudflare account.
2. Bind the R2 bucket and environment variables in `wrangler.toml`.
3. Deploy Workers using Wrangler:
   ```bash
   npm run deploy
   ```

---

## Future Improvements
- Enable real-time image previews during uploads.
- Provide analytics on image views and downloads.

---

## License
MIT License. See [LICENSE](LICENSE) for details.


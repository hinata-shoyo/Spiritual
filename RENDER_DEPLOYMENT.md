# Deploying to Render

This guide will help you deploy your Guruji Website to Render.

## Prerequisites

1. **GitHub Repository**: Your code should be in a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)

## Step 1: Prepare Your Repository

1. **Commit and push all changes** to your GitHub repository:

   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Ensure your repository structure** looks like this:
   ```
   guruji-website/
   ├── frontend/
   ├── backend/
   ├── render.yaml
   ├── package.json
   └── README.md
   ```

## Step 2: Deploy on Render

### Option A: Using render.yaml (Recommended)

1. **Connect your GitHub repository**:

   - Go to [render.com](https://render.com) and sign in
   - Click "New +" → "Blueprint"
   - Connect your GitHub account
   - Select your `guruji-website` repository

2. **Render will automatically detect** the `render.yaml` file and configure your service

3. **Set environment variables**:

   - In your Render dashboard, go to your service
   - Click "Environment" tab
   - Add these environment variables:
     ```
     CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
     CLOUDINARY_API_KEY=your_cloudinary_api_key
     CLOUDINARY_API_SECRET=your_cloudinary_api_secret
     YOUTUBE_API_KEY=your_youtube_api_key
     ```

4. **Deploy**: Click "Create Blueprint Instance"

### Option B: Manual Setup

1. **Create a new Web Service**:

   - Go to [render.com](https://render.com) and sign in
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure the service**:

   - **Name**: `guruji-website`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free (or choose paid if needed)

3. **Set environment variables** (same as above)

4. **Deploy**: Click "Create Web Service"

## Step 3: Configure Environment Variables

In your Render service dashboard, add these environment variables:

| Key                     | Value                      | Description       |
| ----------------------- | -------------------------- | ----------------- |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | For photo gallery |
| `CLOUDINARY_API_KEY`    | Your Cloudinary API key    | For photo gallery |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret | For photo gallery |
| `YOUTUBE_API_KEY`       | Your YouTube Data API key  | For video content |

## Step 4: Test Your Deployment

1. **Wait for build to complete** (usually 2-5 minutes)
2. **Visit your deployed URL** (e.g., `https://guruji-website.onrender.com`)
3. **Test all features**:
   - Home page
   - Audio streaming
   - Video playback
   - Photo gallery
   - Books viewer
   - Events page

## Step 5: Custom Domain (Optional)

1. **Add custom domain** in Render dashboard
2. **Configure DNS** with your domain provider
3. **SSL certificate** is automatically provided by Render

## Troubleshooting

### Common Issues

1. **Build fails**:

   - Check that all dependencies are in `package.json`
   - Ensure Node.js version compatibility (>=18.0.0)

2. **Environment variables not working**:

   - Verify all variables are set in Render dashboard
   - Check variable names match exactly

3. **Static files not serving**:

   - Ensure `frontend/` folder structure is correct
   - Check file paths in `index.js`

4. **API endpoints not working**:
   - Verify CORS settings
   - Check API keys are valid

### Debug Commands

- **View logs**: Check Render dashboard → Logs tab
- **Restart service**: Use "Manual Deploy" button
- **Check environment**: Verify variables in Environment tab

## Performance Tips

1. **Enable auto-scaling** (paid plans)
2. **Use CDN** for static assets
3. **Optimize images** before uploading to Cloudinary
4. **Monitor performance** in Render dashboard

## Cost

- **Free tier**: $0/month (with limitations)
- **Paid plans**: Starting from $7/month
- **Bandwidth**: Free tier includes 750GB/month

## Support

- **Render Documentation**: [docs.render.com](https://docs.render.com)
- **Community**: [community.render.com](https://community.render.com)
- **Status Page**: [status.render.com](https://status.render.com)

---

Your website will be live at: `https://your-service-name.onrender.com`

Remember to update any hardcoded localhost URLs in your frontend code to use relative paths or environment variables for production!

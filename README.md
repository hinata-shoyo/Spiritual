# Guruji Website

A comprehensive spiritual website featuring audio content, videos, photo gallery, e-books, and events.

## 🚀 Quick Deploy

### Render (Recommended)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

1. Click the button above
2. Connect your GitHub repository
3. Set environment variables
4. Deploy!

See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for detailed instructions.

### Other Platforms

- **Heroku**: Use `Procfile` and deploy to Heroku
- **Vercel**: Use `vercel.json` for Vercel deployment
- **Railway**: Direct GitHub integration

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **APIs**:
  - YouTube Data API v3 (videos)
  - Internet Archive API (audios)
  - Cloudinary API (photos)
- **Deployment**: Render, Heroku, Vercel ready

## 📁 Project Structure

```
guruji-website/
├── frontend/           # Static HTML/CSS/JS files
│   ├── index.html     # Home page
│   ├── audios.html    # Audio streaming page
│   ├── vids.html      # Video gallery page
│   ├── gallery.html   # Photo gallery page
│   ├── books.html     # E-books viewer
│   ├── events.html    # Events listing page
│   └── style.css      # Global styles
├── backend/           # Node.js server
│   ├── index.js       # Main server file
│   ├── routes/        # API route handlers
│   │   ├── youtube.js # YouTube API integration
│   │   ├── photos.js  # Cloudinary integration
│   │   └── archive.js # Internet Archive integration
│   └── package.json   # Backend dependencies
├── render.yaml        # Render deployment config
├── Procfile          # Heroku deployment config
├── vercel.json       # Vercel deployment config
└── README.md         # This file
```

## 🔧 Prerequisites

- Node.js 18+
- npm or yarn
- API keys for:
  - YouTube Data API v3
  - Cloudinary
  - Internet Archive (no key required)

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# YouTube API
YOUTUBE_API_KEY=your_youtube_api_key_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=3000
NODE_ENV=development
```

## 🚀 Installation & Setup

1. **Clone the repository**:

   ```bash
   git clone <your-repo-url>
   cd guruji-website
   ```

2. **Install dependencies**:

   ```bash
   npm run install-deps
   ```

3. **Set up environment variables** (see above)

4. **Start development server**:

   ```bash
   npm run dev
   ```

5. **Access your site**:
   - Frontend: http://localhost:3000
   - API Health: http://localhost:3000/api/health

## 📱 Features

### 🎵 Audio Page

- Streams audio from Internet Archive collection
- Search and filter functionality
- Responsive grid layout
- Native HTML5 audio controls

### 🎥 Video Page

- YouTube playlist integration
- Responsive video grid
- In-page video embedding
- Pagination support

### 📷 Photo Gallery

- Cloudinary CDN integration
- Lightbox image viewer
- Responsive grid layout
- Lazy loading with "Load More"

### 📚 E-Books

- Google Drive integration
- In-page PDF viewer
- Responsive design
- Multiple book support

### 📅 Events

- Static event listings
- Responsive design
- Consistent styling

## 🔌 API Endpoints

| Endpoint              | Method | Description             |
| --------------------- | ------ | ----------------------- |
| `/api/health`         | GET    | Health check            |
| `/api/test`           | GET    | Test endpoint           |
| `/api/videos`         | GET    | YouTube videos          |
| `/api/photos`         | GET    | Cloudinary photos       |
| `/api/archive/audios` | GET    | Internet Archive audios |

## 🌐 Deployment

### Render (Recommended)

- Free tier available
- Automatic SSL
- Global CDN
- Easy GitHub integration

See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for complete instructions.

### Heroku

```bash
heroku create your-app-name
heroku config:set NODE_ENV=production
git push heroku main
```

### Vercel

```bash
npm i -g vercel
vercel
```

## 📱 Mobile Compatibility

All frontend pages are fully responsive with:

- Mobile-first CSS Grid layouts
- Touch-friendly interactions
- Optimized for all screen sizes
- Progressive enhancement

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**:

   ```bash
   # Windows PowerShell
   $p = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique; if ($p) { Stop-Process -Id $p -Force }

   # macOS/Linux
   lsof -ti:3000 | xargs kill -9
   ```

2. **API keys not working**:

   - Verify `.env` file is in `backend/` directory
   - Restart server after changing environment variables
   - Check API key permissions

3. **Static files not loading**:
   - Ensure server is running on correct port
   - Check file paths in `backend/index.js`

### Debug Mode

Enable debug logging:

```bash
NODE_ENV=development npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- **Issues**: Create a GitHub issue
- **Documentation**: Check this README and deployment guides
- **Community**: Join our community discussions

---

**Happy Coding! 🎉**

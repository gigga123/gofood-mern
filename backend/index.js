
const express = require('express')
const app = express()
const port = 5000
const axios = require('axios')

// Mock data (since DB auth may be failing)
const mockFoodData = [
    {
        "_id": "1",
        "CategoryName": "Pizza",
        "name": "Margherita Pizza",
        "img": "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=300&fit=crop",
        "options": [{"regular": 150, "medium": 200, "large": 300}],
        "description": "Classic margherita with fresh mozzarella and basil."
    },
    {
        "_id": "2",
        "CategoryName": "Pizza",
        "name": "Pepperoni Pizza",
        "img": "https://images.unsplash.com/photo-1628840042765-356cda07f7c5?w=400&h=300&fit=crop",
        "options": [{"regular": 170, "medium": 220, "large": 320}],
        "description": "Classic pepperoni pizza with mozzarella."
    }
];

const mockCategoryData = [
    {"_id": "c1", "CategoryName": "Pizza"},
    {"_id": "c2", "CategoryName": "Biryani/Rice"},
    {"_id": "c3", "CategoryName": "Starter"}
];

// Patch function: replace hotlink-blocked image URLs with unsplash alternatives
function replaceBlockedImages(data) {
  if (!Array.isArray(data)) return data;
  return data.map(item => {
    if (item.img && (item.img.includes('cookingchanneltv.com') || item.img.includes('simplyrecipes.com'))) {
      // Replace blocked URLs with working unsplash URLs based on category
      if (item.CategoryName === 'Pizza') {
        item.img = 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=300&fit=crop';
      } else if (item.CategoryName === 'Biryani/Rice') {
        item.img = 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop';
      } else {
        item.img = 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=300&fit=crop';
      }
    }
    return item;
  });
}

// Initialize the database and populate global variables.
// The DB module uses a callback: callback(err, data, catData).
// Don't assign the return value of require('./db') — call it with a callback.
// Set a timeout so we don't hang forever if DB is slow/unresponsive
let dbInitialized = false;
const dbTimeout = setTimeout(() => {
  if (!dbInitialized) {
    console.warn('DB init timeout - using mock data');
    global.foodData = mockFoodData;
    global.foodCategory = mockCategoryData;
    dbInitialized = true;
  }
}, 5000);

require('./db')(function (err, data, catData) {
  clearTimeout(dbTimeout);
  if (dbInitialized) return; // Already timed out
  dbInitialized = true;
  
  if (err) {
    console.error('Error initializing DB:', err.message);
    // Fallback to mock data if DB connection fails
    global.foodData = mockFoodData;
    global.foodCategory = mockCategoryData;
    console.log('Using mock data (DB connection failed)');
  } else if (!data || data.length === 0) {
    // If DB returns empty, use mock data
    global.foodData = mockFoodData;
    global.foodCategory = mockCategoryData;
    console.log('DB empty; using mock data');
  } else {
    // Replace blocked image URLs with working unsplash URLs
    global.foodData = replaceBlockedImages(data);
    global.foodCategory = catData;
    console.log('Global foodData and foodCategory initialized from DB (images patched)');
  }
});
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
app.use(express.json())

// Simple image proxy to bypass remote-host hotlinking restrictions.
// Usage: GET /image?url=<encoded image url>
app.get('/image', async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) return res.status(400).send('Missing url');
  try {
    const response = await axios.get(imageUrl, {
      responseType: 'stream',
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      validateStatus: () => true
    });
    if (response.status >= 200 && response.status < 300) {
      const contentType = response.headers['content-type'] || 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      response.data.pipe(res);
    } else {
      console.error('Image proxy received status', response.status, 'for', imageUrl);
      res.status(502).send('Remote host returned ' + response.status);
    }
  } catch (err) {
    console.error('Image proxy error for', imageUrl, err.message);
    res.status(502).send('Could not fetch image');
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/api/auth', require('./Routes/Auth'));

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`)
}).on('error', (err) => {
  console.error('Failed to start server:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please free up port ${port} or change the port number.`);
  }
});


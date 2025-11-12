# Food Delivery App - Quick Start Guide

## Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

## Running the Application

### Option 1: Run Both Servers in Separate PowerShell Terminals (Recommended)

#### Terminal 1 - Start Backend:
```powershell
cd "C:\Users\gemso\Downloads\FoodDeliveryApp-main\FoodDeliveryApp-main\backend"
node index.js
```
Expected output:
```
Example app listening on http://localhost:5000
connected to mongo
Global foodData and foodCategory initialized from DB (images patched)
```

#### Terminal 2 - Start Frontend:
```powershell
cd "C:\Users\gemso\Downloads\FoodDeliveryApp-main\FoodDeliveryApp-main"
npm start
```
The app will open automatically at http://localhost:3000 (or http://localhost:3001 if port 3000 is in use).

---

## How It Works

- **Backend** (Node.js + Express): 
  - Listens on `http://localhost:5000`
  - Serves food items from MongoDB Atlas
  - Automatically replaces blocked image URLs with free unsplash images
  - Endpoint: `POST /api/auth/foodData`

- **Frontend** (React):
  - Runs on `http://localhost:3000`
  - Fetches food items from the backend
  - Displays items with images, price options, and add-to-cart functionality

---

## Image Fix Details

**Problem**: Original image URLs from cooking websites were blocked by hotlinking restrictions (403 Forbidden).

**Solution**: 
- Backend now automatically replaces blocked URLs with free unsplash images
- Image URL replacement happens in `backend/index.js` (function `replaceBlockedImages`)
- No need for image proxy or manual intervention

**Supported Categories**:
- Pizza: Uses pizza images from unsplash
- Biryani/Rice: Uses biryani images from unsplash  
- Starter: Uses appetizer images from unsplash

---

## Troubleshooting

### Port Already in Use
If you get "Address already in use" error:
```powershell
# Kill any existing node processes
Stop-Process -Name node -Force
```

### Images Still Not Showing
1. Make sure backend is running (check Terminal 1)
2. Verify `http://localhost:5000/api/auth/foodData` returns food items
3. Check browser console (F12) for any JavaScript errors
4. Ensure frontend and backend are on correct ports

### MongoDB Connection Issues
- The backend will fallback to mock data if MongoDB connection fails
- Images will still display correctly (patched to unsplash URLs)

---

## Key Files Modified

- `backend/index.js` - Added image URL patching, mock data fallback
- `src/components/Card.js` - Removed proxy, uses direct image URLs
- `backend/update-image.js` - Sample data with unsplash URLs

---

Enjoy your Food Delivery App! 🍕

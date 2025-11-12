const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://plutocutunha_db_user:2eqwm5ddi063R2sO@intershipproooooooooooo.g7tyvla.mongodb.net/food-app?appName=intershipprooooooooooooooo';

async function run() {
  try {
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
    const db = mongoose.connection.db;
    const foodColl = db.collection('food_items');
    const ordersColl = db.collection('orders');

    const foods = await foodColl.find({}).toArray();
    const foodMapById = new Map();
    const foodMapByName = new Map();
    for (const f of foods) {
      if (f._id) foodMapById.set(String(f._id), f);
      if (f.name) foodMapByName.set(f.name.toLowerCase(), f);
    }

    const orders = await ordersColl.find({}).toArray();
    console.log('Found orders:', orders.length);
    let updatedCount = 0;

    for (const ord of orders) {
      if (!ord.order_data || !Array.isArray(ord.order_data)) continue;
      let changed = false;
      const newOrderData = ord.order_data.map(entry => {
        // entry is expected to be [itemsArray, date]
        if (!Array.isArray(entry) || entry.length === 0) return entry;
        const items = Array.isArray(entry[0]) ? entry[0] : entry;
        const newItems = items.map(it => {
          // it expected to be an object with id or name
          if (!it || typeof it !== 'object') return it;
          if (it.img) return it; // already has image
          let found = null;
          if (it.id && foodMapById.has(String(it.id))) found = foodMapById.get(String(it.id));
          else if (it.name && foodMapByName.has(String(it.name).toLowerCase())) found = foodMapByName.get(String(it.name).toLowerCase());
          if (found && found.img) {
            changed = true;
            return { ...it, img: found.img };
          }
          return it;
        });
        // preserve same structure: [itemsArray, date]
        if (Array.isArray(entry[0])) {
          return [newItems, entry[1]];
        } else {
          return newItems;
        }
      });

      if (changed) {
        await ordersColl.updateOne({ _id: ord._id }, { $set: { order_data: newOrderData } });
        updatedCount++;
        console.log('Updated order', String(ord._id));
      }
    }

    console.log('Backfill complete. Orders updated:', updatedCount);
  } catch (err) {
    console.error('Error in backfill:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

run();

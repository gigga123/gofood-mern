const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://plutocutunha_db_user:VYV1kK9zHksMgBtd@intershipproooooooooooo.g7tyvla.mongodb.net/food-app?appName=intershipprooooooooooooooo';

const sampleFoodItems = [
    {
        "CategoryName": "Pizza",
        "name": "Margherita Pizza",
        "img": "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=300&fit=crop",
        "options": [
            {
                "regular": 150,
                "medium": 200,
                "large": 300
            }
        ],
        "description": "Classic margherita with fresh mozzarella and basil."
    },
    {
        "CategoryName": "Pizza",
        "name": "Pepperoni Pizza",
        "img": "https://images.unsplash.com/photo-1628840042765-356cda07f7c5?w=400&h=300&fit=crop",
        "options": [
            {
                "regular": 170,
                "medium": 220,
                "large": 320
            }
        ],
        "description": "Classic pepperoni pizza with mozzarella."
    }
];

const sampleCategories = [
    {
        "CategoryName": "Pizza"
    },
    {
        "CategoryName": "Biryani/Rice"
    },
    {
        "CategoryName": "Starter"
    }
];

async function updateDatabase() {
    try {
        await mongoose.connect(mongoURI, { useNewUrlParser: true });
        console.log("Connected to MongoDB");

        // Clear and update food_items
        const foodCollection = mongoose.connection.db.collection("food_items");
        await foodCollection.deleteMany({});
        const foodResult = await foodCollection.insertMany(sampleFoodItems);
        console.log("Food items updated:", foodResult.insertedCount);

        // Clear and update Categories
        const categoryCollection = mongoose.connection.db.collection("Categories");
        await categoryCollection.deleteMany({});
        const catResult = await categoryCollection.insertMany(sampleCategories);
        console.log("Categories updated:", catResult.insertedCount);

        console.log("Database updated successfully");
    } catch (error) {
        console.error("Error updating database:", error);
    } finally {
        await mongoose.connection.close();
    }
}

updateDatabase();

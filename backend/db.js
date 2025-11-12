const mongoose = require('mongoose');

// 1. FIXED: Changed 'gofood' to 'food-app' to match your database
const mongoURI = 'mongodb+srv://plutocutunha_db_user:2eqwm5ddi063R2sO@intershipproooooooooooo.g7tyvla.mongodb.net/food-app?appName=intershipprooooooooooooooo';

module.exports = function (callback) {
    mongoose.connect(mongoURI, { useNewUrlParser: true }, async (err, result) => {
        if (err) console.log("---" + err)
        else {
            console.log("connected to mongo")
            const foodCollection = await mongoose.connection.db.collection("food_items");

            // 2. FIXED: Fetched 'Categories' (capital 'C') to match your screenshot
            foodCollection.find({}).toArray(async function (err, data) {
                const categoryCollection = await mongoose.connection.db.collection("Categories"); 

                // 3. FIXED: Fetched the data and passed 'catData' to the callback
                categoryCollection.find({}).toArray(async function (catErr, catData) {
                    callback(err || catErr, data, catData);
                })
            });
        }
    })
};
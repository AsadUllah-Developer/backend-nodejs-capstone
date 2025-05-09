const express = require('express');
const router = express.Router();
const connectToDatabase = require('../models/db');

// Search for second chance items
router.get('/', async (req, res, next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("secondChanceItems");

        // Initialize the query object
        let query = {};

        // Add the name filter
        if (req.query.name && req.query.name.trim() !== '') {
            query.name = { $regex: req.query.name, $options: "i" }; // case-insensitive
        }

        // Add other filters
        if (req.query.category) {
            query.category = req.query.category;
        }
        if (req.query.condition) {
            query.condition = req.query.condition;
        }
        if (req.query.age_years) {
            query.age_years = { $lte: parseInt(req.query.age_years) };
        }

        // Fetch the results and store them in `gifts`
        const gifts = await collection.find(query).toArray();

        // Send the result
        res.json(gifts); // Change `secondChanceItems` to `gifts`
    } catch (e) {
        next(e);
    }
});

module.exports = router;
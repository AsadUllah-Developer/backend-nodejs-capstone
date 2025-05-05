const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const connectToDatabase = require('../models/db');
const logger = require('../logger');

// Define the upload directory path
const directoryPath = 'public/images';

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, directoryPath); // Specify the upload directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage: storage });


// Get all secondChanceItems
router.get('/', async (req, res, next) => {
    logger.info('/ called');
    try {
        const db = await connectToDatabase();
        //Step 2: task 2 - insert code here
        //Step 2: task 3 - insert code here
        //Step 2: task 4 - insert code here

        const collection = db.collection("secondChanceItems");
        const secondChanceItems = await collection.find({}).toArray();
        res.json(secondChanceItems);
    } catch (e) {
        logger.console.error('oops something went wrong', e)
        next(e);
    }
});

// Add a new item
router.post('/', upload.single('file'), async (req, res, next) => {
    try {
        // Task 1: Get DB connection
        const db = await connectToDatabase();

        // Task 2: Get collection
        const collection = db.collection("secondChanceItems");

        // Task 3: Create new item from req.body
        let secondChanceItem = req.body;

        // Task 4: Get last item, increment id
        const lastItemQuery = await collection.find().sort({ 'id': -1 }).limit(1).toArray();
        if (lastItemQuery.length > 0) {
            secondChanceItem.id = (parseInt(lastItemQuery[0].id) + 1).toString();
        } else {
            // If no items yet, start with ID 1
            secondChanceItem.id = '1';
        }

        // Task 5: Set current date
        const date_added = Math.floor(new Date().getTime() / 1000);
        secondChanceItem.date_added = date_added;

        // Optional: Handle the uploaded file info
        if (req.file) {
            secondChanceItem.imagePath = path.join('/images', req.file.filename);
        }

        // Task 6: Add to DB
        const result = await collection.insertOne(secondChanceItem);

        // Respond with the new item
        res.status(201).json({
            message: 'Item successfully added',
            item: secondChanceItem,
            insertedId: result.insertedId
        });

    } catch (e) {
        next(e);
    }
});


// Get a single secondChanceItem by ID
router.get('/:id', async (req, res, next) => {
    try {
        // Task 1: Get DB connection
        const db = await connectToDatabase();

        // Task 2: Get collection
        const collection = db.collection("secondChanceItems");

        // Task 3: Get ID from URL params
        const id = req.params.id;

        // Find the item by ID
        const secondChanceItem = await collection.findOne({ id: id });

        // Task 4: Handle not found case
        if (!secondChanceItem) {
            return res.status(404).send("secondChanceItem not found");
        }

        // Return item as JSON
        res.json(secondChanceItem);

    } catch (e) {
        next(e);
    }
});


// Update and existing item
router.put('/:id', async(req, res,next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("secondChanceItems");
        const secondChanceItem = await collection.findOne({ id });

        if (!secondChanceItem) {
        logger.error('secondChanceItem not found');
        return res.status(404).json({ error: "secondChanceItem not found" });
        }
        secondChanceItem.category = req.body.category;
        secondChanceItem.condition = req.body.condition;
        secondChanceItem.age_days = req.body.age_days;
        secondChanceItem.description = req.body.description;
        secondChanceItem.age_years = Number((secondChanceItem.age_days/365).toFixed(1));
        secondChanceItem.updatedAt = new Date();

        const updatepreloveItem = await collection.findOneAndUpdate(
            { id },
            { $set: secondChanceItem },
            { returnDocument: 'after' }
        );
        if(updatepreloveItem) {
            res.json({"uploaded":"success"});
        } else {
            res.json({"uploaded":"failed"});
        }
    } catch (e) {
        next(e);
    }
});

// Delete an existing item
router.delete('/:id', async (req, res, next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("secondChanceItems");

        const id = req.params.id;  // ✅ You were missing this line!

        const secondChanceItem = await collection.findOne({ id });

        if (!secondChanceItem) {
            logger.error('secondChanceItem not found');
            return res.status(404).json({ error: "secondChanceItem not found" });
        }

        await collection.deleteOne({ id });
        res.json({ deleted: "success" });
    } catch (e) {
        next(e);
    }
});


module.exports = router;
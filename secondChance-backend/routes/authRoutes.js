const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const connectToDatabase = require('../models/db'); // make sure this path is correct
const logger = require('../logger');

const JWT_SECRET = process.env.JWT_SECRET || 'yourFallbackSecret';

router.post('/register', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("users");

        const existingEmail = await collection.findOne({ email: req.body.email });
        if (existingEmail) {
            logger.error('Email id already exists');
            return res.status(400).json({ error: 'Email id already exists' });
        }

        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);

        const newUser = await collection.insertOne({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hash,
            createdAt: new Date(),
        });

        const payload = {
            user: {
                id: newUser.insertedId,
            },
        };

        const authtoken = jwt.sign(payload, JWT_SECRET);
        logger.info('User registered successfully');

        res.json({ authtoken, email: req.body.email });

    } catch (e) {
        console.error(e);
        return res.status(500).send('Internal server error');
    }
});

// 👇 VERY IMPORTANT: export the router
module.exports = router;

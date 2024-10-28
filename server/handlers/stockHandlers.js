const express = require('express');
const Stock = require('../models/Stock');

const router = express.Router();

router.get('/', async (req, res) => {
    const { start, end, field } = req.query;

    try {
        const query = {};
        if (start && end) {
            query.Date = {
                $gte: start, // Use start string directly
                $lte: end // Use end string directly
            };
        }

        const stocks = await Stock.find(query).select(['Date', field]);
        res.status(200).json(stocks);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching stock entries', details: error.message });
    }
});

router.get('/multiple', async (req, res) => {
    const { start, end, fields } = req.query;

    try {
        const query = {};
        if (start && end) {
            query.Date = {
                $gte: start, // Use start string directly
                $lte: end // Use end string directly
            };
        }

        const selectedFields = fields ? fields.split(',').map(f => f.trim()) : [];

        const projection = selectedFields.length ? ['Date', ...selectedFields] : null;

        const stocks = await Stock.find(query).select(projection);
        res.status(200).json(stocks);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching stock entries', details: error.message });
    }
});


module.exports = router;

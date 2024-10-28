const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Stock = require('../models/Stock');
const connectDB = require('../db/db');
const mongoose = require('mongoose');

const parseCSV = async () => {
  await connectDB();

  const results = [];

  fs.createReadStream(path.join(__dirname, 'data.csv'))
    .pipe(csv())
    .on('data', (data) => {
      // Convert the date to 'YYYY-MM-DD' format
      const formattedDate = new Date(data.Date).toISOString().split('T')[0];

      results.push({
        Date: formattedDate, // Store only the date part
        Open: parseFloat(data.Open),
        High: parseFloat(data.High),
        Low: parseFloat(data.Low),
        Close: parseFloat(data.Close),
        AdjClose: parseFloat(data['Adj Close']),
        Volume: parseInt(data.Volume, 10),
      });
    })
    .on('end', async () => {
      try {
        await Stock.insertMany(results);
        console.log('Data inserted into MongoDB');
      } catch (error) {
        console.error('Error inserting data:', error);
      } finally {
        mongoose.connection.close();
      }
    });
};

parseCSV();

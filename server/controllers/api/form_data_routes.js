const express = require('express');
const router = express.Router();
const uuidv4 = require('uuid').v4;
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { config } = require('dotenv');

config({ path: './.env' });

// In-memory storage for the latest version number
// In a production environment, this should be stored in a database
let currentVersion = 0;

// Helper function to increment version
function incrementVersion() {
  currentVersion += 1;
  return currentVersion;
}

// GET /api/forms/DiabetesManagement
router.get('/DiabetesManagement', async (req, res) => {
  try {
    const result = await fetch('http://34.135.9.49:3000/api/minioG/getAll/stjda-signup-forms', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${req.cookies.jwt}`
      }
    });

    if (!result.ok) {
      throw new Error(`HTTP error! status: ${result.status}`);
    }

    const data = await result.json(); // Parse the response
    const newVersion = incrementVersion();
    res.json({
      data: data,
      version: newVersion
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});

// POST /api/forms/DiabetesManagement
router.post('/DiabetesManagement', async (req, res) => {
  const { data, version } = req.body;

//   if (version !== currentVersion) {
//     return res.status(409).json({ error: 'Conflict: Data is out of date. Please refresh and try again.' });
//   }

  if (!req.body) {
    return res.status(400).json({ error: 'Request body is missing' });
  }

  try {
    // Here you would update the data in your database
    // For this example, we're just incrementing the version
    const newVersion = incrementVersion();

    // Send the updated data to the API
    const updateResult = await fetch('http://34.135.9.49:3000/api/minioG/update/stjda-signup-forms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${req.cookies.jwt}`
      },
      body: JSON.stringify(data)
    });

    if (!updateResult.ok) {
      throw new Error(`HTTP error! status: ${updateResult.status}`);
    }

    res.json({
      success: true,
      version: newVersion
    });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ error: 'An error occurred while updating data' });
  }
});

// POST /api/forms/DiabetesManagement/bucketName
router.post('/DiabetesManagement/:bucket', async (req, res) => {
    try {
      if (!req.body) {
        return res.status(400).json({ error: 'Request body is missing' });
      }
      const { bucket } = req.params;
      const userData = req.body; // Assuming the client sends the user data in the request body
      const updateResult = await fetch(`http://34.135.9.49:3000/api/minioP/${bucket}`, {
          method: 'POST',
          headers: {
          'Content-Type': 'application/json',
          //   'Authorization': `Bearer ${req.cookies.jwt}`
          },
          body: JSON.stringify(userData)
      });
      if (!updateResult.status === 200) {
        throw new Error(`HTTP error! status: ${updateResult.status}`);
      }

      res.status(200).json({ 
        message: "Data successfully sent to MinIO",
        bucket: bucket,
        data: updateResult,
        key: updateResult?.key,
        syncTime: new Date().toISOString() 
      });
    } catch (error) {
      console.error("Error sending data to MinIO:", error);
      res.status(500).json({ error: "Error sending data to MinIO" });
    }
  });

module.exports = router;
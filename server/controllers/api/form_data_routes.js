/**
 * form_data_routes.js
 * 
 * This file contains route handlers for form data operations, interacting with a Minio object storage database via a proxy server.
 */
const express = require('express');
const router = express.Router();
const uuidv4 = require('uuid').v4;
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { config } = require('dotenv');

config({ path: './.env' });

/**
 * Computes a SHA-256 checksum for the given data.
 * 
 * @param {Object|string} originalData - The data to compute the checksum for.
 * @returns {string} The computed checksum as a hexadecimal string.
 */
const computeChecksum = (originalData) => {

    // Convert the original data to JSON if it's not already a string
    const originalDataJson = typeof originalData === 'string' 
        ? originalData 
        : JSON.stringify(originalData);

    // Compute checksum
    const checksum = crypto
        .createHash('sha256')
        .update(originalDataJson)
        .digest('hex');

    return checksum;
}

/**
 * POST /DiabetesManagement/intake
 * 
 * Creates a new entry in the 'stjda-signup-forms' bucket, using a computed checksum as the key.
 */
router.post('/DiabetesManagement/intake', async (req, res) => {
    try {
      if (!req.body) {
        return res.status(400).json({ error: 'Request body is missing' });
      }
      // save back into the same bucket
      const bucket = 'stjda-signup-forms';
      const { dataToSend, retry } = req.body;
      let userData = dataToSend;
      let data;

      console.log('Received retry: ', retry);
      console.log(userData)
      const restructuredData = [{
        selectedCamps: userData.selectedCamps || '',
        age: userData.age || '',
        email: userData.newAccountEmail || '',
        guardianName: userData.legalGuardian || '',
        consent: userData.consent || false,
        registrationFormData: {
          submissionDate: userData.submissionDate || new Date().toISOString(),
          firstName: (userData.name && userData.name.split(' ')[0]) || '',
          middleName: (userData.name && userData.name.split(' ').length > 2) ? userData.name.split(' ')[1] : '',
          lastName: (userData.name && userData.name.split(' ').pop()) || '',
          contactPhone: userData.contactPhone || '',
          sessions: Array.isArray(userData.sessions) ? userData.sessions : [],
          tShirtSize: userData.tShirtSize || '',
          birthDate: userData.dateOfBirth || '',
          gender: userData.gender || '',
          diagnosisDate: userData.diagnosisDate || '',
          allergies: userData.allergies || '',
          primaryCarePhysician: userData.primaryCarePhysician || '',
          officePhoneNumber: userData.officePhoneNumber || '',
          diabetesPhysician: userData.diabetesPhysician || '',
          insulinType: userData.insulinType || '',
          parent1FirstName: userData.parent1FirstName || '',
          parent1LastName: userData.parent1LastName || '',
          parent1Mobile: userData.parent1Mobile || '',
          parent1Email: userData.parent1Email || '',
          parent2FirstName: userData.parent2FirstName || '',
          parent2LastName: userData.parent2LastName || '',
          parent2Mobile: userData.parent2Mobile || '',
          specialInstructions: userData.specialInstructions || '',
          preferredRoommate: userData.preferredRoommate || '',
          preferredLanguage: userData.preferredLanguage || '',
          "medications.ibuprofen": userData["medications.ibuprofen"] ?? false,
          "medications.tylenol": userData["medications.tylenol"] ?? false,
          "medications.benadryl": userData["medications.benadryl"] ?? false,
          isMDI: userData.isMDI || false,
          pumpModelBrand: userData.pumpModelBrand || '',
          isCGM: userData.isCGM || false,
          cgmModelBrand: userData.cgmModelBrand || '',
          carbsBreakfast: userData.carbsBreakfast || '',
          carbsLunch: userData.carbsLunch || '',
          carbsDinner: userData.carbsDinner || '',
          mealtimeRestrictions: userData.mealtimeRestrictions || '',
          insulinToCarbRatio: userData.insulinToCarbRatio || '',
          correctionFactor: userData.correctionFactor || '',
          target: userData.target || '',
          mdiInsulinType: userData.mdiInsulinType || '',
          otherDiagnosis: userData.otherDiagnosis || '',
          otcMedications: userData.otcMedications || '',
          otherPrescriptions: userData.otherPrescriptions || '',
          insulinFor15gSnack: userData.insulinFor15gSnack || false,
          correctWith15gOrLess: userData.correctWith15gOrLess || false,
          hyperglycemiaSymptoms: userData.hyperglycemiaSymptoms || '',
          hyperglycemiaTreatment: userData.hyperglycemiaTreatment || '',
          hypoglycemiaSymptoms: userData.hypoglycemiaSymptoms || '',
          hypoglycemiaTreatment: userData.hypoglycemiaTreatment || '',
          diabetesManagementStruggles: userData.diabetesManagementStruggles || '',
          glucoseSensitiveFoods: userData.glucoseSensitiveFoods || '',
          rapidActingInsulinType: userData.rapidActingInsulinType || '',
          longActingInsulinType: userData.longActingInsulinType || '',
          isCompleted: true,
          role: userData.role || '',
          document: userData.document || null,
          signature: userData.signature || '',
        },
      }];

        console.log("computing a checksum on: ",userData)
        // Compute checksum using sha256
        const checksum = computeChecksum(restructuredData)
        
      // Check if the object already exists
      try {
        const response = await fetch(`http://34.135.9.49:3000/api/minioG/checkObjectKey/${bucket}/${checksum}`);
        const responseText = await response.text();
        console.log("Raw response:", responseText);
        data = JSON.parse(responseText);
        console.log("Parsed response:", data);
        if (data.exists && retry === 0) {
          // Object exists and this is not a retry, return an error
          return res.json({ 
            error: 'Duplicate entry, data already exists', 
            message: 'Data already exists.',
            status:409
          });
        }
      } catch (error) {
        console.error('Error checking object existence:', error);
      }

      // Use checksum as the key, save the data in the bucket
      const updateResult = await fetch(`http://34.135.9.49:3000/api/minioP/${bucket}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${req.cookies.jwt}`
        },
        body: JSON.stringify({
          key: checksum,
          data: restructuredData,
        })
      });
  
      if (updateResult.status !== 200) {
        throw new Error(`HTTP error! status: ${updateResult.status}`);
      }

      const resultData = await updateResult.json();
      
      processedData = {
        bucket,
        checksum,
        minioResponse: resultData,
        status: data.exists && retry === 1 ? 201 : 200 // handle the case when a retry occurs, prevent deleting your data!!! code 200 triggers delete client-side
      };

      
      res.json(processedData)
      
  
    } catch (error) {
      console.error("Error in initial data processing:", error);
      res.status(500).json({ error: "Error in initial data processing" });
    }
  });

/**
 * GET /DiabetesManagement
 * 
 * Retrieves all entries from the 'stjda-signup-forms' bucket.
 */
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

    res.status(200).json({
      data: data,
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});

/**
 * POST /DiabetesManagement/:bucket
 * 
 * Updates an entry in the specified bucket, using a computed checksum as the key.
 */
router.post('/DiabetesManagement/:bucket', async (req, res) => {
    try {
      if (!req.body) {
        return res.status(400).json({ error: 'Request body is missing' });
      }
  
      const { bucket } = req.params;
      const userData = req.body;
      
      const { originalKey: { Key: originalKeyKey }, ...restOfUserData } = userData;

      // Compute checksum
      const checksum = crypto
        .createHash('sha256')
        .update(JSON.stringify(restOfUserData))
        .digest('hex');
  
      // Use checksum as the key
      const updateResult = await fetch(`http://34.135.9.49:3000/api/minioP/${bucket}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${req.cookies.jwt}`
        },
        body: JSON.stringify({
          key: checksum,
          data: userData
        })
      });
  
      if (updateResult.status !== 200) {
        throw new Error(`HTTP error! status: ${updateResult.status}`);
      }
  
      const resultData = await updateResult.json();
      
      // alter the original data entry we changed, youll need to pass along the key and access that bucket


      res.status(200).json({ 
        message: "Data successfully sent to MinIO",
        bucket: bucket,
        key: checksum,
        syncTime: new Date().toISOString(),
        minioResponse: resultData
      });

    } catch (error) {
      console.error("Error sending data to MinIO:", error);
      res.status(500).json({ error: "Error sending data to MinIO" });
    }
  });

module.exports = router;
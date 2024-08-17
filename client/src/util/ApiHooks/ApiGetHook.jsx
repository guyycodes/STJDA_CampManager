import React, { useEffect, useState } from "react";
import axios from "axios";
import { CircularProgress, Box } from "@mui/material";

export const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const startTime = Date.now();
      try {
        const response = await axios.get(url);
        const parsedData = parseAndShapeData(response.data);
        setData(parsedData);
      } catch (error) {
        setError(error);
      } finally {
        const endTime = Date.now();
        const elapsed = endTime - startTime;
        const remainingTime = Math.max(1750 - elapsed, 0);
        
        setTimeout(() => {
          setLoading(false);
        }, remainingTime);
      }
    };

    setLoading(true);
    fetchData();
  }, [url]);

  const parseMetadataKey = (key) => {
    const parts = key.split(',').map(item => item.trim());
    const camps = [];
    let firstName = '', lastName = '', age = '', primaryCarePhysician = '', shirtSize = '', gender = '';
  
    // Collect camps
    while (parts.length > 0 && parts[0].includes('Camp')) {
      camps.push(parts.shift());
    }
  
    // Assign remaining parts
    if (parts.length >= 6) {
      [firstName, lastName, age, primaryCarePhysician, shirtSize, gender] = parts;
    }
  
    return { camps, firstName, lastName, age, primaryCarePhysician, shirtSize, gender };
  };

  const parseAndShapeData = (apiResponse) => {
    
    if (!apiResponse || !apiResponse.objects || !Array.isArray(apiResponse.objects)) {
      throw new Error("Invalid input data");
    }
  
    return apiResponse.objects.map(obj => {
      const { metadata, content } = obj;

      if (!metadata || !content) {
        throw new Error("Missing metadata or content in data object");
      }
  
      // Parse the content JSON safely
      let parsedContent;
      try {
        parsedContent = JSON.parse(content)[0];
        
      } catch (e) {
        console.error("Failed to parse content JSON:", e);
        parsedContent = {};
      }
    
      // Extract camps and other metadata from the Key
      // Parse metadata Key
      const { camps, firstName, lastName, age, primaryCarePhysician, shirtSize, gender } = parseMetadataKey(metadata.Key);
      
      // console.log("matadata ", camps, firstName, lastName, age, primaryCarePhysician, shirtSize, gender)
      // console.log(metadata.StorageClass)
      // console.log(metadata.LastModified)
      

      // Destructure registrationFormData with default values
      const {
        allergies ='',
        birthDate ='',
        diabetesPhysician ='',
        diagnosisDate ='',
        firstName: contentFirstName = '',
        middleName = '',
        lastName: contentLastName = '',
        gender: contentGender = '',
        insulinType = '',
        parent1Email='',
        parent1FirstName='',
        parent1LastName='',
        parent1Mobile = '',
        submissionDate = '',
        sessions = [],
        medications = {},
        primaryCarePhysician: contentPCP = '',
        officePhoneNumber = '',
        preferredRoommate = '',
        preferredLanguage = '',
        tShirtSize = '',
        parent2FirstName = '',
        parent2LastName = '',
        parent2Mobile = '',
        specialInstructions = '',
      } = parsedContent.registrationFormData || {};
  
      // Safely get age value
      const getAge = () => {
        if (parsedContent.age != null) {
          return parsedContent.age.toString();
        }
        if (age !== 'Unknown' && age !== '') {
          return age;
        }
        return '0';
      };

      return {
        metadata: {
          Key: metadata.Key,
          LastModified: metadata.LastModified,
          ETag: metadata.ETag,
          Size: metadata.Size,
          StorageClass: metadata.StorageClass
        },
        content: JSON.stringify([{
          selectedCamps: parsedContent.selectedCamps || '',
          email: parsedContent.email || '',
          guardianName: parsedContent.guardianName || '',
          consent: parsedContent.consent || false,
          registrationFormData: {
            submissionDate,
            firstName: contentFirstName || firstName,
            middleName,
            lastName: contentLastName || lastName,
            sessions,
            tShirtSize: tShirtSize || shirtSize,
            birthDate,
            gender: contentGender || gender,
            diagnosisDate,
            allergies,
            primaryCarePhysician: contentPCP || primaryCarePhysician,
            officePhoneNumber,
            diabetesPhysician,
            insulinType,
            parent1FirstName,
            parent1LastName,
            parent1Mobile,
            parent1Email,
            parent2FirstName,
            parent2LastName,
            parent2Mobile,
            specialInstructions,
            preferredRoommate,
            preferredLanguage,
            medications,
            // Additional fields needed by ConfirmationForm
            name: `${contentFirstName || firstName} ${contentLastName || lastName}`,
            age: parseInt(getAge(), 10),
            legalGuardian: parsedContent.guardianName || '',
            contactPhone: parent1Mobile,
            mdiInsulinType: insulinType
          },
          camps: parsedContent.selectedCamps ? parsedContent.selectedCamps.split(',').map(camp => camp.trim()) : [],
          age: parseInt(getAge(), 10),
        }])
      };
    });
  };

  const LoadingComponent = () => (
    <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <CircularProgress />
    </Box>
  );

  return { data, loading, error, LoadingComponent };
};
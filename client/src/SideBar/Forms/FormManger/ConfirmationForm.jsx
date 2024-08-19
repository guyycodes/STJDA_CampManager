import React, { useState, useEffect } from 'react';
import {
  TextField,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Grid,
  Typography,
  Paper,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useFetch, useSendToAPI } from '../../../util/ApiHooks';
import { DynamicForm } from './RenderChildComponents/RenderConfirmationForm';
import { parseApiData } from './FormHelpers/ParesApi'
import { EmailModal } from './Modals/ConfirmationModal';


const campOptions = ['Residential Camp', 'Robotics Camp', 'Science Camp', 'Nature Camp'];
const genderOptions = ['Male', 'Female', 'Other'];
const adultSizes = ['XS', 'S', 'M', 'L', 'XL'];
const youthSizes = ['Youth-XS', 'Youth-S', 'Youth-M', 'Youth-L', 'Youth-XL'];

export const ConfirmationForm = ({ activeForm }) => {

  // State to hold the filtered results
const [filteredResults, setFilteredResults] = useState([]);
const [isApplying, setIsApplying] = useState(false);
const [allData, setAllData] = useState({});
const [modalOpen, setModalOpen] = useState(false);
const [formSaveSucess ,setFormSaveSucess]=useState({success: null, message: ""})
const [accountCreatedSucess, setAccountCreatedSucess] = useState({success: null, message: ""})
  // call the backend server first, and it will grab the data from the database for the filtering
  const { data, loading, error, LoadingComponent } = useFetch('http://localhost:3000/api/forms/DiabetesManagement');
  const { data: componentData, 
          loading: componentLoading, 
          error: componentError 
        } = {
          data: data, 
          loading: LoadingComponent, 
          error: error,
        };
  // send post request Hook
  const {
    sendRequest: sendFormData,
    loading: sendFormLoading,
    error: sendFormError,
    response: formResponse,
    LoadComponent: FormLoadingComponent
  } = useSendToAPI('http://localhost:3000/api/forms/DiabetesManagement/completed-stjda-signup-forms', 'POST');

  const {
    sendRequest: createAccount,
    loading: createAccountLoading,
    error: createAccountError,
    response: accountResponse,
    LoadComponent: AccountLoadingComponent
  } = useSendToAPI('http://localhost:3000/api/signup/send-email', 'POST');
  
  // State to hold the Trie data structures for each filterable field
  // Tries are used for efficient prefix-based searching
  const [attributeMaps, setAttributeMaps] = useState({
    firstName: new Map(),
    lastName: new Map(),
    age: new Map(),
    primaryCarePhysician: new Map(),
    camps: new Map(),
    tShirtSize: new Map(),
    gender: new Map()
  });
  
  // In a real application, this would use a custom hook to fetch data
  // For now, we're using mock data
  const [filters, setFilters] = useState({
    camps: [],
    firstName: '',
    lastName: '',
    age: '',
    primaryCarePhysician: '',
    tShirtSize: [],
    gender: [],
    showAll: true,
  });
  // State to hold the form data for a new entry
  const [formData, setFormData] = useState({
    // anything in this state must also be in the ParseApi.js
    name: '',//
    age: '',//
    dateOfBirth: '',//
    isMDI: false,//
    pumpModelBrand: '',//
    isCGM: false,//
    cgmModelBrand: '',//
    legalGuardian: '',//
    contactPhone: '',//
    carbsBreakfast: '',//
    carbsLunch: '',//
    carbsDinner: '',//
    mealtimeRestrictions: '',//
    insulinToCarbRatio: '',//
    correctionFactor: '',//
    target: '',//
    mdiInsulinType: '',//
    allergies: '',//
    otherDiagnosis: '',//
    otcMedications: '',//
    otherPrescriptions: '',//
    insulinFor15gSnack: false,//
    correctWith15gOrLess: false,//
    hyperglycemiaSymptoms: '',//
    hyperglycemiaTreatment: '',//
    hypoglycemiaSymptoms: '',//
    hypoglycemiaTreatment: '',//
    diabetesManagementStruggles: '',//
    glucoseSensitiveFoods: '',//
    diabetesPhysician: '',//
    officePhoneNumber: '',//
    diagnosisDate: '',//
    gender: '',//
    rapidActingInsulinType: '', //
    longActingInsulinType: '',//
    parent1FirstName: '',//
    parent1LastName: '',//
    parent1Mobile: '',//
    parent2FirstName: '',//
    parent2LastName: '',//
    parent2Mobile: '',//
    preferredLanguage: '',//
    preferredRoommate: '',//
    sessions:[],
    specialInstructions: '',//
    primaryCarePhysician:'',//
    submissionDate: '',//
    tShirtSize: '',//
    selectedCamps: '',
    });
// Effect hook to initialize Tries when data is loaded
useEffect(() => {
    if (data) {
      console.log("Data: ", data)
      const newMaps = {
        firstName: new Map(),
        lastName: new Map(),
        age: new Map(),
        primaryCarePhysician: new Map(),
        camps: new Map(),
        tShirtSize: new Map(),
        gender: new Map()
      };
      console.log("Data change: ");
      data.forEach((entry, index) => {
        const content = JSON.parse(entry.content)[0];
        
        const addToMap = (mapName, map, key, index) => {
          if (key === undefined || key === null) {
            // console.log(`Warning: Undefined or null key encountered for ${mapName}`);
            // console.log(`Key: ${key}`);
            // console.log(`Key type: ${typeof key}`);
            return;
          }
          
          try {
            const lowerKey = String(key).toLowerCase();
            
            if (!map.has(lowerKey)) {
              map.set(lowerKey, new Set());
            }
            map.get(lowerKey).add(index);
          } catch (error) {
            console.error(`Error processing key for ${mapName}:`, error);
            console.log(`Problematic key:`, key);
            console.log(`Key type:`, typeof key);
          }
        };
  
        addToMap('firstName', newMaps.firstName, content.registrationFormData.firstName, index);
        addToMap('lastName', newMaps.lastName, content.registrationFormData.lastName, index);
        addToMap('age', newMaps.age, content.age.toString(), index);
        addToMap('primaryCarePhysician', newMaps.primaryCarePhysician, content.registrationFormData.primaryCarePhysician, index);
        content.camps.forEach(camp => addToMap('camps', newMaps.camps, camp, index));
        addToMap('tShirtSize', newMaps.tShirtSize, content.registrationFormData.tShirtSize, index);
        addToMap('gender', newMaps.gender, content.registrationFormData.gender, index);
      });
  
      setAttributeMaps(newMaps);
    }
  }, [data]);

  // Handle changes to form inputs
  const handleChange = (event, resultIndex = null) => {
    const { name, value, checked } = event.target;
    if (resultIndex !== null) {
      setFilteredResults(prevResults => {
        const newResults = [...prevResults];
        newResults[resultIndex].formData = {
          ...newResults[resultIndex].formData,
          [name]: event.target.type === 'checkbox' ? checked : value
        };
        return newResults;
      });
    } else {
      // Otherwise, we're updating the form for a new entry
      setFormData(prevData => ({
        ...prevData,
        [name]: event.target.type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleFinalSubmit = async (email, signatureDataURL, isCompleted) => {
    const dataToSend = { 
      ...formData, 
      newAccountEmail: email, 
      signature: signatureDataURL,
      isCompleted: isCompleted,
      role: 'camper'
    };
  
    try {
      // Save the completed form in object storage
      const saveFormResponse = await sendFormData(dataToSend);
  
      if (saveFormResponse.status === 200) {
        console.log('The data is saved:', saveFormResponse.data);
        setFormSaveSucess({ success: true, message: "Data successfully saved" });
  
        try {
          // Create the account using the new endpoint and PUT method
          const createAccountResponse = await createAccount(dataToSend);
          console.log('After account creation, response:', createAccountResponse);

          if (createAccountResponse.status === 200) {
            console.log('Setting account created success');
            setAccountCreatedSucess({ success: true, message: "New account workflow successfully instantiated" });
            // setModalOpen(false);
            // Handle successful account creation
          } else {
            console.log('Account creation failed');
            setAccountCreatedSucess({ success: false, message: "Failed to instantiated account workflow" });
          }
        } catch (error) {
          setAccountCreatedSucess({ success: false, message: "Failed to instantiated account workflow" });
          handleApiError(error, 'Account creation');
        }
      } else {
        console.log('Failed to send data to Minio');
        setFormSaveSucess({ success: false, message: "Failed to save data" });
      }
    } catch (error) {
      handleApiError(error, 'Data sending');

    }
    // setModalOpen(false);  // Always close the modal at the end
  };
  
  const handleApiError = (error, process) => {
    console.error(`Error in ${process}:`, error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
      errorMessage = error.response.data.message || errorMessage;
    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
      errorMessage = "No response received from server";
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
      errorMessage = error.message;
    }
  };
  
    // Handle form submission
  const handleSubmit = async (event, resultIndex = null) => {
    event.preventDefault();

    if (resultIndex !== null) {
      const updatedResult = filteredResults[resultIndex];
      console.log('updatedResult: ', updatedResult);
    //   const formData = filteredResults[resultIndex].formData;
      setAllData(prevData => ({
        ...prevData,
        [updatedResult.key]: {
            apiData: updatedResult.apiData, 
            formData: updatedResult.formData
        }
      }))
    } else {
        try {
          if(!modalOpen){
            setModalOpen(true);
          }else{
            setModalOpen(false)
          }
        } catch (err) {
          console.error('Error sending data:', err);
        }
      }
    };

 // Handle changes to filter inputs
 const handleFilterChange = (event) => {
    const { name, value, checked } = event.target;
    setFilters(prevFilters => {
      const newFilters = {
        ...prevFilters,
        [name]: Array.isArray(prevFilters[name])
          ? (checked ? [...prevFilters[name], value] : prevFilters[name].filter(item => item !== value))
          : value,
      }; 
      return newFilters;
    });
  };

// Handle changes to the "Show All" checkbox
  const handleShowAllChange = (event) => {
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters, showAll: event.target.checked };
      return newFilters;
    });
  };

const handleApplyFilters = () =>{
    setIsApplying(true);
    
    setTimeout(() => {
        applyFilters();
        setIsApplying(false);
    }, 1000);
}

// Apply filters to the data
const applyFilters = () => {
    const currentFilters = filters;
    if (data) {
      // console.log("Applying filters:", currentFilters);
      let matchingIndices = new Set(data.map((_, index) => index));
      // console.log("Initial matching indices:", matchingIndices);
  
      if (!currentFilters.showAll) {
        const applyFilter = (filterValue, mapName) => {
          if (filterValue) {
            const matches = attributeMaps[mapName].get(filterValue.toLowerCase()) || new Set();
            matchingIndices = new Set([...matchingIndices].filter(x => matches.has(x)));
          }
        };
  
        applyFilter(currentFilters.firstName, 'firstName');
        applyFilter(currentFilters.lastName, 'lastName');
        applyFilter(currentFilters.age, 'age');
        applyFilter(currentFilters.primaryCarePhysician, 'primaryCarePhysician');
  
        if (currentFilters.camps.length > 0) {
          const campMatches = new Set(currentFilters.camps.flatMap(camp => 
            [...(attributeMaps.camps.get(camp.toLowerCase()) || [])]
          ));
          matchingIndices = new Set([...matchingIndices].filter(x => campMatches.has(x)));
        }
  
        if (currentFilters.tShirtSize.length > 0) {
          const sizeMatches = new Set(currentFilters.tShirtSize.flatMap(size => 
            [...(attributeMaps.tShirtSize.get(size.toLowerCase()) || [])]
          ));
          matchingIndices = new Set([...matchingIndices].filter(x => sizeMatches.has(x)));
        }
  
        if (currentFilters.gender.length > 0) {
          const genderMatches = new Set(currentFilters.gender.flatMap(gender => 
            [...(attributeMaps.gender.get(gender.toLowerCase()) || [])]
          ));
          matchingIndices = new Set([...matchingIndices].filter(x => genderMatches.has(x)));
        }
      }
      // console.log("Final matching indices:", matchingIndices);
      // Convert matching indices back to full data objects
      const results = [...matchingIndices].map(index => {
        const entry = data[index];
        const content = JSON.parse(entry.content)[0];
        return {
          ...content,
          key: entry.metadata.Key,
          formData: parseApiData(content)
        };
      });
      // console.log("Final results:", results);
      // Sort results by last name and update state  
      const sortedResults = results.sort((a, b) => 
        a.registrationFormData.lastName.localeCompare(b.registrationFormData.lastName)
      );
      console.log("Sorted results:", sortedResults);
  
      setFilteredResults(sortedResults);
    }
  };


// Render the filter UI
  const renderFilters = () => (
    <Grid container spacing={2} style={{ marginBottom: '20px' }}>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              checked={filters.showAll}
              onChange={handleShowAllChange}
              name="showAll"
            />
          }
          label="Show All"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <FormControl component="fieldset">
          <Typography variant="subtitle1">Camps</Typography>
          <FormGroup>
            {campOptions.map((camp) => (
              <FormControlLabel
                key={camp}
                control={
                  <Checkbox
                    checked={filters.camps.includes(camp)}
                    onChange={handleFilterChange}
                    name="camps"
                    value={camp}
                    disabled={filters.showAll}
                  />
                }
                label={camp}
              />
            ))}
          </FormGroup>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <FormControl component="fieldset">
          <Typography variant="subtitle1">Gender</Typography>
          <FormGroup>
            {genderOptions.map((gender) => (
              <FormControlLabel
                key={gender}
                control={
                  <Checkbox
                    checked={filters.gender.includes(gender)}
                    onChange={handleFilterChange}
                    name="gender"
                    value={gender}
                    disabled={filters.showAll}
                  />
                }
                label={gender}
              />
            ))}
          </FormGroup>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <FormControl component="fieldset">
        <Typography variant="subtitle1">Shirt Size</Typography>
            <Box sx={{ display: 'flex' }}>
                <FormGroup sx={{ mr: 2 }}>
                {adultSizes.map((size) => (
                    <FormControlLabel
                    key={size}
                    control={
                        <Checkbox
                        checked={filters.tShirtSize.includes(size)}
                        onChange={handleFilterChange}
                        name="tShirtSize"
                        value={size}
                        disabled={filters.showAll}
                        />
                    }
                    label={size}
                    />
                ))}
                </FormGroup>
                <FormGroup>
                {youthSizes.map((size) => (
                    <FormControlLabel
                    key={size}
                    control={
                        <Checkbox
                        checked={filters.tShirtSize.includes(size)}
                        onChange={handleFilterChange}
                        name="tShirtSize"
                        value={size}
                        disabled={filters.showAll}
                        />
                    }
                    label={size}
                    />
                ))}
                </FormGroup>
            </Box>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          fullWidth
          label="First Name"
          name="firstName"
          value={filters.firstName}
          onChange={handleFilterChange}
          disabled={filters.showAll}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          fullWidth
          label="Last Name"
          name="lastName"
          value={filters.lastName}
          onChange={handleFilterChange}
          disabled={filters.showAll}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          fullWidth
          label="Age"
          name="age"
          value={filters.age}
          onChange={handleFilterChange}
          disabled={filters.showAll}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Box display="flex" alignItems="center">
          <Typography variant="body1" style={{ marginRight: '8px' }}>Dr.</Typography>
          <TextField
            fullWidth
            label="Physician"
            name="primaryCarePhysician"
            value={filters.primaryCarePhysician}
            onChange={handleFilterChange}
            disabled={filters.showAll}
            helperText="Format: 'DoctorsName'"
          />
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleApplyFilters}
          disabled={isApplying}
        >
          {isApplying ? <CircularProgress size={24} color="inherit" /> : 'Apply Filters'}
        </Button>
      </Grid>
      
      {isApplying && (
        <Grid item xs={12}>
          <Typography>Applying filters...</Typography>
        </Grid>
      )}
    </Grid>
  );

  if (loading) return LoadingComponent ? <LoadingComponent /> : <Box>Loading...</Box>;
  if (error) return <Box>Error: {error.message}</Box>;

  return (
    <>
    <Paper elevation={3} style={{ padding: '20px', margin: '20px' }}>
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
      <Typography variant="h4">
        Diabetes Management Form
      </Typography>
      <Button variant="outlined" onClick={() => activeForm("")}>
        Back
      </Button>
    </Box>
      {renderFilters()}
      {isApplying ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : filteredResults.length > 0 ? (
        filteredResults.map((result, index) => (
          <Accordion key={index}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>
                {`${result.registrationFormData.firstName} ${result.registrationFormData.lastName}, Age: ${result.age}`}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {/* {renderForm(result, index)} */}
              <DynamicForm handleChange={handleChange} handleSubmit={handleSubmit} apiData={result.formData} setFormData={setFormData} />
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Typography>No results found. Please adjust your filters.</Typography>
      )}
    </Paper>
    <EmailModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setFormSaveSucess({success: null, message: ""})
          setAccountCreatedSucess({success: null, message: ""})
        }}
        onSubmit={handleFinalSubmit}
        saveSuccess={formSaveSucess}
        accountCreatedSuccess={accountCreatedSucess}
      />
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
    </>
  );
};

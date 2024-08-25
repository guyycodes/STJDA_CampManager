import React, {useState} from "react";
import styled from "styled-components";
import { SignInForm, CreateAccountForm} from "./SignUp";
import { SignUpImage } from "../assets/SignInPageImage/index.js";
import { Modal, Box, Typography, Button, Checkbox, FormControlLabel, CircularProgress } from "@mui/material";
import { useNavigate } from 'react-router-dom'; 
import { isSHA256 } from '../util/DataIntegrity'

/**
 * SignInSection component handles user sign-in and account creation processes.
 * It manages the display of sign-in form, account creation form, and terms & conditions modal.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.checksum] - SHA256 checksum for account verification
 * @returns {React.Component} A component that renders sign-in and account creation forms
 */
export const SignInSection = ({ checksum }) => { // the checksum is passed all the way down to the form, then passed as formData.key

    const navigate = useNavigate();
    const [modalOpen, setModalOpen] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [createUser, setCreateUser] = useState(false);
    const [formsData, setFormsData] = useState()
    const [spinner, setSpinner] = useState()

    /**
     * Parses the URL from the server response and navigates to the corresponding route.
     * 
     * @param {string} d - Server response containing the URL
     */
    const parseURL = (d) =>{
      // Get the last part, which is the URL
      const url = d.split(' ').slice(-1)[0]; 
      // Parse the URL and get the pathname
      const pathname = new URL(url).pathname;
      navigate(pathname)
    }

    /**
     * Submits user data to the server for account creation or verification.
     * 
     * @param {Object} theFormData - User form data
     * @param {string} theFormData.role - User role (e.g., 'volunteer')
     * @param {string} [theFormData.key] - SHA256 checksum for account verification
     */
    const submitUser = async (theFormData) =>{
      if (termsAccepted && (theFormData.role === 'volunteer')) {
          try{
              // const response = await fetch('http://localhost:3000/api/signup/create', {
              //     method: 'POST', // Specify the method
              //     headers: {
              //         'Content-Type': 'application/json'
              //     },
              //     credentials: 'include',
              //     body: JSON.stringify(theFormData)
              // });
              console.log("the form data: ", theFormData)
              const data = await response.text();
              if(response.ok){
                parseURL(data);
              }else{
                parseURL(data);
              }
            }catch(err){
              console.log(err)
            }
      }else if(termsAccepted && (isSHA256(theFormData.key))){
        console.log("we have the checksum: ", isSHA256(theFormData.key), theFormData)
        // call apollo server and send the checksum
      }
      else{
        alert('Oops! 😅 Doesnt look like you accepted the terms: \n To create an account you must accept the terms')
      }
    }
    /**
     * Handles the acceptance of terms and conditions.
     * 
     * @param {Object} dataFromForm - User form data
     */
    const handleAcceptTerms = (dataFromForm) => {
      setFormsData(dataFromForm)
    };

    return (
      <StyledImage>
        <Box className="rectangle">
          <Box className='image'>
            <SignUpImage />
            
          </Box>
          <Box className='form'>
            {
            createUser || checksum ? 
            <CreateAccountForm 
              setTermsAccepted={setTermsAccepted} 
              handleAcceptTerms={handleAcceptTerms}
              openModal={setModalOpen} 
              createUser={setCreateUser} 
              checksum={checksum ? checksum : null}
            /> 
            :
            <SignInForm createUser={setCreateUser} />
            }
          </Box>

          <Modal
            open={modalOpen}
            disableEscapeKeyDown
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            >
            <Box sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)', 
                width: 400, 
                bgcolor: 'background.paper', 
                border: '2px solid #000', 
                boxShadow: 24, 
                p: 4 
              }}>

              <Typography id="modal-modal-title" variant="h6" component="h2">
               Terms & Conditions
              </Typography>
              {
                spinner ? <CircularProgress /> 
                  : 
                <Typography id="modal-modal-description" sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
               
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista probare, quae sunt a te dicta? Refert tamen, quo modo.'  
                  
                </Typography>
              }
              {
                spinner ? null
                : 
                <FormControlLabel
                control={<Checkbox checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />}
                label="I accept the terms and conditions"
                />
              }
              {
                spinner ? null 
                  :
                <Box mt={2} display="flex" justifyContent="space-between">
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={() => {
                        setSpinner(true);
                        setTimeout(() => {
                          setSpinner(false);
                        }, 3250); 

                        setSpinner(true);
                        setTimeout(() => {
                          submitUser(formsData);
                        }, 2000);  // 1500 milliseconds delay
                      }}>
                      OK
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={() => {setTermsAccepted(false); setModalOpen(false);}}>
                        Cancel
                    </Button>
                </Box>
              }
            </Box>
          </Modal>
        </Box>
      </StyledImage>
    );
  };

/**
 * Styled component for the sign-in section layout.
 * 
 * @component
 */
const StyledImage = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 100vw;

  & .rectangle {
    display: flex;
    width: 100vh;
    
  }

  & .image {
    flex: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
  }

  & .form {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    max-height: 75vh;
    // transform: translateX(10%);
    
  }

  @media (max-width: 768px) {
    & .rectangle {
      flex-direction: column;
      align-items: center;
    }

    & .form {
      margin: 20px;
      width: 90%;
      max-width: 75vw;
      transform: none;

    }
  }
`;

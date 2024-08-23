import React from 'react';
import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const MedCheckInForm = ({ activeForm }) => {


    return (
        <div>
            <Button 
                startIcon={<ArrowBackIcon />} 
                onClick={() => activeForm("")}
                variant="contained"
                color="primary"
                style={{ marginBottom: '20px' }}
            >
                Back
            </Button>
            <h1>MedCheckInForm</h1>
        </div>
    );
};
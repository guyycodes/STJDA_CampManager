import React from 'react';
import { Card, CardContent, Typography, Radio, RadioGroup, FormControlLabel, Button, Box } from '@mui/material';

export const StaffFormSelector = ({ selectedForm, onFormSelect, onClear }) => {
  const formType = 'staff';
  const isSelected = selectedForm.startsWith(`${formType}:`);

  const handleChange = (event) => {
    onFormSelect(formType, event.target.value);
  };

  return (
    <Card sx={{ maxWidth: 345, m: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          Staff Forms
        </Typography>
        <RadioGroup value={isSelected ? selectedForm.split(':')[1] : ''} onChange={handleChange}>
          <FormControlLabel value="unknown" control={<Radio />} label="N/A" />
        </RadioGroup>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button variant="outlined" onClick={onClear}>Clear</Button>
          <Button variant="contained" disabled={!isSelected}>Continue</Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export const CamperFormSelector = ({ selectedForm, onFormSelect, onClear }) => {
  const formType = 'camper';
  const isSelected = selectedForm.startsWith(`${formType}:`);

  const handleChange = (event) => {
    onFormSelect(formType, event.target.value);
  };

  return (
    <Card sx={{ maxWidth: 345, m: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          Camp Attendants
        </Typography>
        <RadioGroup value={isSelected ? selectedForm.split(':')[1] : ''} onChange={handleChange}>
          <FormControlLabel value="Intake" control={<Radio />} label="Intake Forms" />
          <FormControlLabel value="Wrap Up" control={<Radio />} label="Close-out" />
        </RadioGroup>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button variant="outlined" onClick={onClear}>Clear</Button>
          <Button variant="contained" disabled={!isSelected}>Continue</Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export const ParticipationFormSelector = ({ selectedForm, onFormSelect, onClear }) => {
  const formType = 'participation';
  const isSelected = selectedForm.startsWith(`${formType}:`);

  const handleChange = (event) => {
    onFormSelect(formType, event.target.value);
  };

  return (
    <Card sx={{ maxWidth: 345, m: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          Participant Forms
        </Typography>
        <RadioGroup value={isSelected ? selectedForm.split(':')[1] : ''} onChange={handleChange}>
          <FormControlLabel value="Accomodations" control={<Radio />} label="Accomodations" />
          <FormControlLabel value="Release" control={<Radio />} label="Medical Release" />
        </RadioGroup>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button variant="outlined" onClick={onClear}>Clear</Button>
          <Button variant="contained" disabled={!isSelected}>Continue</Button>
        </Box>
      </CardContent>
    </Card>
  );
};
import React, { useEffect, useState, useRef } from 'react';
import {
  TextField,
  Switch,
  FormControlLabel,
  Grid,
  Button,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  FormHelperText,
  IconButton
} from '@mui/material';
import { UploadFile, Clear } from '@mui/icons-material';
import { uploadFileHelper } from '../FormHelpers/UploadToServer';
import { formStructure } from '../../../../assets/Templates/ConfirmationForm';

export const DynamicForm = ({handleChange, handleSubmit, apiData, index=null, setFormData}) => {
  const [localFormData, setLocalFormData] = useState(apiData);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef({});

  useEffect(() => {
    setFormData(prevData => ({...prevData, ...localFormData}));
    console.log('localFormData:', localFormData);
  }, [localFormData, setFormData]);

  const handleLocalChange = (e, fieldName) => {
    const { value, type, checked } = e.target;
    let newValue;

    if (fieldName === 'selectedCamps') {
      newValue = Array.isArray(value) ? value.join(', ') : value;
    } else {
      newValue = type === 'checkbox' ? checked : value;
    }

    setLocalFormData(prevData => ({
      ...prevData,
      [fieldName]: newValue
    }));

    setErrors(prevErrors => ({
      ...prevErrors,
      [fieldName]: ''
    }));

    handleChange({ target: { name: fieldName, value: newValue } }, index);
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      // Store file metadata in localFormData
      const fileData = {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      };

      setLocalFormData(prevData => ({
        ...prevData,
        [fieldName]: fileData
      }));

      // If you need to send the file to the server immediately:
      // uploadFile(file, fieldName);

      // Notify parent component
      handleChange({ target: { name: fieldName, value: fileData } }, index);
    }
  };

  const handleFileClear = (fieldName) => {
    // Clear the file input
    if (fileInputRef.current[fieldName]) {
      fileInputRef.current[fieldName].value = '';
    }

    // Clear the file data from localFormData
    setLocalFormData(prevData => ({
      ...prevData,
      [fieldName]: null
    }));

    // Notify parent component
    handleChange({ target: { name: fieldName, value: null } }, index);
  };

  const formatSelectValue = (value) => {
    if (typeof value !== 'string') return '';
    return value.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  const getFieldValue = (fieldName, fieldType) => {
    let value;

    if (fieldName === 'dateOfBirth' && localFormData.dateOfBirth) {
      try {
        const date = new Date(localFormData.dateOfBirth);
        value = date.toISOString().split('T')[0]; // This will return 'YYYY-MM-DD'
      } catch (error) {
        console.error("Invalid date:", localFormData.dateOfBirth);
        value = '';
      }
    } else if(fieldName === 'Physician') {
      value = localFormData['primaryCarePhysician'] ?? '';
    } else if(fieldName === 'selectedCamps') {
      value = localFormData[fieldName] ? localFormData[fieldName].split(', ') : [];
    } else {
      value = localFormData[fieldName] ?? '';
    }

    if (fieldType === 'select' && fieldName !== 'selectedCamps') {
      return value ? formatSelectValue(value) : '';
    }

    return value;
  };

  const validateForm = () => {
    const newErrors = {};
    Object.entries(formStructure).forEach(([_, fields]) => {
      fields.forEach(field => {
        if (field.required && !getFieldValue(field.name, field.type)) {
          newErrors[field.name] = 'This field is required';
        }
      });
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const renderField = (field) => {
    const commonProps = {
      fullWidth: true,
      label: field.label,
      name: field.name,
      value: String(getFieldValue(field.name, field.type)),
      onChange: (e) => handleLocalChange(e, field.name),
      required: field.required,
      error: !!errors[field.name],
      helperText: errors[field.name] || field.helperText
    };

    switch (field.type) {
      case 'text':
      case 'textarea':
        return (
          <TextField
            {...commonProps}
            multiline={field.type === 'textarea'}
            rows={field.type === 'textarea' ? 3 : 1}
          />
        );
      case 'switch':
        return (
          <FormControl error={!!errors[field.name]}>
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(getFieldValue(field.name, field.type))}
                  onChange={(e) => handleLocalChange(e, field.name)}
                  name={field.name}
                  required={field.required}
                />
              }
              label={field.label}
            />
            {errors[field.name] && <FormHelperText>{errors[field.name]}</FormHelperText>}
          </FormControl>
        );
      case 'date':
        return (
          <TextField
            {...commonProps}
            type="date"
            InputLabelProps={{
              shrink: true,
            }}
          />
        );
      case 'select':
        if (field.name === 'selectedCamps') {
          return (
            <FormControl fullWidth error={!!errors[field.name]}>
              <InputLabel id={`${field.name}-label`}>{field.label}</InputLabel>
              <Select
                labelId={`${field.name}-label`}
                id={field.name}
                name={field.name}
                multiple
                value={getFieldValue(field.name, field.type)}
                onChange={(e) => handleLocalChange(e, field.name)}
                label={field.label}
                required={field.required}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {field.options.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              {errors[field.name] && <FormHelperText>{errors[field.name]}</FormHelperText>}
            </FormControl>
          );
        } else {
          return (
            <FormControl fullWidth error={!!errors[field.name]}>
              <InputLabel id={`${field.name}-label`}>{field.label}</InputLabel>
              <Select
                labelId={`${field.name}-label`}
                id={field.name}
                name={field.name}
                value={getFieldValue(field.name, field.type)}
                onChange={(e) => handleLocalChange(e, field.name)}
                label={field.label}
                required={field.required}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {field.options.map((option) => (
                  <MenuItem key={option} value={formatSelectValue(option)}>
                    {formatSelectValue(option)}
                  </MenuItem>
                ))}
              </Select>
              {errors[field.name] && <FormHelperText>{errors[field.name]}</FormHelperText>}
            </FormControl>
          );
        }
        case 'file':
          return (
            <Box>
            <input
              type="file"
              ref={el => fileInputRef.current[field.name] = el}
              style={{ display: 'none' }}
              onChange={(e) => handleFileChange(e, field.name)}
              required={field.required}
            />
            <Button
              variant="contained"
              onClick={() => fileInputRef.current[field.name].click()}
              startIcon={<UploadFile />}
            >
              {field.label}
            </Button>
            {localFormData[field.name] && (
              <Box mt={1} display="flex" alignItems="center">
                <Box flexGrow={1}>File selected: {localFormData[field.name].name}</Box>
                <IconButton onClick={() => handleFileClear(field.name)} size="small">
                  <Clear />
                </IconButton>
              </Box>
            )}
            {errors[field.name] && <FormHelperText error>{errors[field.name]}</FormHelperText>}
          </Box>
          );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      if (validateForm()) {
        handleSubmit(e, index);
      }
    }}>
      <Grid container spacing={3}>
        {Object.entries(formStructure).map(([section, fields]) => (
          <React.Fragment key={section}>
            <Grid item xs={12}>
              <Box sx={{ fontWeight: 'bold', mb: 2 }}>{section}</Box>
            </Grid>
            {fields.map((field) => (
              <Grid item xs={12} sm={6} key={field.name}>
                {renderField(field)}
              </Grid>
            ))}
          </React.Fragment>
        ))}
      </Grid>
      <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
        Submit
      </Button>
    </form>
  );
};
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, Typography, CircularProgress, Checkbox, FormControlLabel } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import ReplayIcon from '@mui/icons-material/Replay';

export const EmailModal = ({ open, onClose, onSubmit, saveSuccess = {}, accountCreatedSuccess = {} }) => {
  const [email, setEmail] = useState('');
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [hasError, setHasError] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (saveSuccess?.success !== null) {
      addMessage(saveSuccess.success, saveSuccess.message || (saveSuccess.success ? 'Form saved successfully!' : 'Failed to save form.'));
      setHasError(!saveSuccess.success);
    }
  }, [saveSuccess]);

  useEffect(() => {
    if (accountCreatedSuccess?.success !== null) {
      addMessage(accountCreatedSuccess.success, accountCreatedSuccess.message || (accountCreatedSuccess.success ? 'Account created successfully!' : 'Failed to create account.'));
      setHasError(!accountCreatedSuccess.success);
    }
  }, [accountCreatedSuccess]);

  const addMessage = (isSuccess, message) => {
    setMessages(prev => [...prev, { isSuccess, message }]);
    setIsProcessing(false);
  };

  const handleSubmit = () => {
    setIsProcessing(true);
    setMessages([]);
    setHasError(false);
    const signatureDataURL = canvasRef.current.toDataURL();
    onSubmit(email, signatureDataURL, isCompleted);
  };

  const handleRetry = () => {
    setMessages([]);
    handleSubmit();
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const renderMessages = () => {
    return messages.map((msg, index) => (
      <Box key={index} display="flex" alignItems="center" justifyContent="center" my={1}>
        {msg.isSuccess ? (
          <CheckCircleOutlineIcon style={{ color: 'green', marginRight: '8px' }} />
        ) : (
          <CancelIcon style={{ color: 'red', marginRight: '8px' }} />
        )}
        <Typography>{msg.message}</Typography>
      </Box>
    ));
  };

  const isAllSuccess = saveSuccess?.success && accountCreatedSuccess?.success;
  const showCloseButton = !isProcessing && isAllSuccess;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirm the Client's Email & Sign - Notify Client to Check their email to access their account</DialogTitle>
      <DialogContent>
        {renderMessages()}
        <TextField
          autoFocus
          margin="dense"
          id="email"
          label="Email Address For New Users Account"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isProcessing || isAllSuccess}
        />
        <Box mt={2} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
          {isAllSuccess ? (
            <Box width={500} height={200} display="flex" alignItems="center" justifyContent="center" border="1px solid #4CAF50" borderRadius={2}>
              <CheckCircleOutlineIcon style={{ color: '#4CAF50', fontSize: 100 }} />
            </Box>
          ) : (
            <>
              <canvas
                ref={canvasRef}
                width={500}
                height={200}
                style={{ border: '1px solid #000', cursor: isProcessing ? 'not-allowed' : 'crosshair' }}
                onMouseDown={!isProcessing ? startDrawing : undefined}
                onMouseMove={!isProcessing ? draw : undefined}
                onMouseUp={!isProcessing ? stopDrawing : undefined}
                onMouseOut={!isProcessing ? stopDrawing : undefined}
              />
              <Box mt={1} display="flex" justifyContent="space-between" width="100%">
                <Button onClick={clearSignature} disabled={isProcessing}>Clear Signature</Button>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isCompleted}
                      onChange={(e) => setIsCompleted(e.target.checked)}
                      disabled={isProcessing}
                    />
                  }
                  label="Complete"
                />
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        {isProcessing ? (
          <CircularProgress size={24} />
        ) : showCloseButton ? (
          <Button onClick={onClose}>Close</Button>
        ) : hasError ? (
          <>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={handleRetry} startIcon={<ReplayIcon />}>Retry</Button>
          </>
        ) : (
          <>
            <Button onClick={onClose} disabled={isProcessing}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isProcessing || !email.trim() || !canvasRef.current?.toDataURL() || !isCompleted}
            >
              Submit
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, Typography, CircularProgress, Checkbox, FormControlLabel } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import ReplayIcon from '@mui/icons-material/Replay';
import { read } from 'xlsx';

/**
 * @typedef {Object} SuccessObject
 * @property {boolean} success - Indicates if the operation was successful
 * @property {string} [message] - Optional message describing the result
 */

/**
 * EmailModal Component
 * 
 * @param {Object} props - The component props
 * @param {boolean} props.open - Controls whether the modal is open or closed
 * @param {Function} props.onClose - Function to call when the modal should be closed
 * @param {Function} props.onSubmit - Function to call when the form is submitted
 * @param {SuccessObject} [props.saveSuccess={}] - Object indicating the success status of saving the form
 * @param {SuccessObject} [props.accountCreatedSuccess={}] - Object indicating the success status of creating an account
 * @returns {React.ReactElement} The EmailModal component
 */
export const EmailModal = ({ open, onClose, onSubmit, saveSuccess = {}, accountCreatedSuccess = {} }) => {
  const [email, setEmail] = useState('');
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [hasError, setHasError] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

   /**
   * Effect to clear state when modal closes
   */
  useEffect(() => {
    if (!open) {
      setEmail('');
      setIsDrawing(false);
      setIsProcessing(false);
      setMessages([]);
      setHasError(false);
      setIsCompleted(false);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [open]);

    /**
   * Effect to handle save success
   */
  useEffect(() => {
    if (saveSuccess?.success !== null) {
      addMessage(saveSuccess.success, saveSuccess.message || (saveSuccess.success ? 'Form saved successfully!' : 'Failed to save form.'));
      setHasError(!saveSuccess.success);
    }
  }, [saveSuccess]);

    /**
   * Effect to handle account creation success
   */
  useEffect(() => {
    if (accountCreatedSuccess?.success !== null) {
      addMessage(accountCreatedSuccess.success, accountCreatedSuccess.message || (accountCreatedSuccess.success ? 'Account sequencing instantiated successfully!' : 'Failed to instantiated account sequence.'));
      setHasError(!accountCreatedSuccess.success);
    }
  }, [accountCreatedSuccess]);

    /**
   * Adds a message to the messages state
   * 
   * @param {boolean} isSuccess - Whether the message indicates a success or failure
   * @param {string} message - The message to display
   */
  const addMessage = (isSuccess, message) => {
    setMessages(prev => [...prev, { isSuccess, message }]);
    setIsProcessing(false);
  };

    /**
   * Handles form submission
   * 
   * @param {React.FormEvent<HTMLFormElement>} [event] - The form submit event
   * @param {boolean} [retry=false] - Whether this is a retry attempt
   */
  const handleSubmit = (event, retry=false) => {
    setIsProcessing(true);
    setMessages([]);
    setHasError(false);
    console.log(retry)
    // const signatureDataURL = canvasRef.current.toDataURL();
    onSubmit(email, retry);
  };

    /**
   * Handles retry action
   * 
   * @param {boolean} retry - Whether to retry the submission
   */
  const handleRetry = (retry) => {
    console.log("handleRetry called with retry:", retry);
    setMessages([]);
    handleSubmit(null, retry);// Passing null as the event since it's not needed
  };

    /**
   * Starts drawing on the canvas
   * 
   * @param {React.MouseEvent<HTMLCanvasElement>} e - The mouse event
   */
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

    /**
   * Continues drawing on the canvas
   * 
   * @param {React.MouseEvent<HTMLCanvasElement>} e - The mouse event
   */
  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

   /**
   * Stops drawing on the canvas
   */
  const stopDrawing = () => {
    setIsDrawing(false);
  };

   /**
   * Clears the signature from the canvas
   */
  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

   /**
   * Renders messages
   * 
   * @returns {React.ReactElement[]} An array of message elements
   */
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
      <DialogTitle>Confirm the Client's Email </DialogTitle>
      <DialogContent>
        {renderMessages()}
        <TextField
          autoFocus
          margin="dense"
          id="email"
          label="Email Address"
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
            <Button onClick={() => {handleRetry(true); console.log("Retry button clicked, setting retry to true"); }} startIcon={<ReplayIcon />}>Retry</Button>
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
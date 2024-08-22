import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { CircularProgress } from "@mui/material";

export const useSendToAPI = (url, method = 'POST') => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const sendRequest = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    const startTime = Date.now();

    try {
      const result = await axios({
        method,
        url,
        data,
      });
      if (result.status >= 200 && result.status < 300) {
        setResponse(result.data);
        return result.data; // Return the response data
      } else {
        throw new Error(`HTTP error! status: ${result.status}`);
      }
    } catch (err) {
      // Capture the error message from the server response
    if (err.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      setError(err.response.data.error || err.response.data.message || 'An error occurred');
    } else if (err.request) {
      // The request was made but no response was received
      setError('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      setError(err.message || 'An error occurred');
    }
    } finally {
      const endTime = Date.now();
      const elapsed = endTime - startTime;
      const remainingTime = Math.max(1750 - elapsed, 0);
      
      setTimeout(() => {
        setLoading(false);
      }, remainingTime);
    }
  }, [url, method]);


  const LoadComponent = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <CircularProgress />
    </div>
  );

  return { sendRequest, loading, error, response, LoadComponent };
};
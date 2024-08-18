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
      setResponse(result.data);
      return result; // Return the response data
    } catch (err) {
      setError(err);
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
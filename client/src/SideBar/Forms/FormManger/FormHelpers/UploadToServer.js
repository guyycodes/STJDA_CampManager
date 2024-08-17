  // Function to upload file to server (if needed)
  export const uploadFileHelper = async (file, fieldName) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/upload-endpoint', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        // Update localFormData with the server response (e.g., file URL)
        setLocalFormData(prevData => ({
          ...prevData,
          [fieldName]: result.fileUrl
        }));
      } else {
        console.error('File upload failed');
        // Handle error
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      // Handle error
    }
  };
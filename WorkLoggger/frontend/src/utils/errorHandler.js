
export const handleAxiosError = (error) => {
  if (error.response) {
    // Server responded with error
    return error.response.data.error || 'An error occurred';
  } else if (error.request) {
    // Request made but no response
    return 'No response from server';
  } else {
    // Error setting up request
    return error.message || 'An unexpected error occurred';
  }
};

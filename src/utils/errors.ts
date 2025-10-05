/**
 * Standardized error handler for API service calls
 * Handles errors from NestJS backend (InternalServerErrorException with message)
 */
export const handleServiceError = (
  error: unknown,
  defaultMessage: string
): Error => {
  // If it's already an Error instance, return it
  if (error instanceof Error) {
    return error;
  }

  // Handle Axios errors from API responses
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as {
      response?: {
        status: number;
        data?: { message?: string; statusCode?: number };
      };
    };

    const message = axiosError.response?.data?.message;

    // NestJS returns message in response.data.message
    if (message) {
      return new Error(message);
    }
  }

  // Fallback to default message
  return new Error(defaultMessage);
};

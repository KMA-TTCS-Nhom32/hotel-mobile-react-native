/**
 * Standardized error handler for API service calls
 * Handles errors from NestJS backend with improved message extraction
 */
export const handleServiceError = (
  error: unknown,
  defaultMessage: string
): Error => {
  // If it's already an Error instance, return it
  if (error instanceof Error && !(error as any).response) {
    return error;
  }

  // Handle Axios errors from API responses
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as {
      response?: {
        status: number;
        data?: any;
      };
      message?: string;
    };

    const response = axiosError.response;

    if (response) {
      const { status, data } = response;

      // Try to extract message from various formats
      let message: string | undefined;

      // Format 1: { message: "error text" }
      if (data?.message) {
        // Handle array of messages (validation errors)
        if (Array.isArray(data.message)) {
          message = data.message.join(', ');
        } else {
          message = data.message;
        }
      }

      // Format 2: { error: "error text" }
      if (!message && data?.error) {
        message = data.error;
      }

      // Format 3: { errors: [...] } (validation errors)
      if (!message && data?.errors && Array.isArray(data.errors)) {
        message = data.errors.map((e: any) => e.message || e).join(', ');
      }

      // Add status code context for common errors
      if (message) {
        switch (status) {
          case 409:
            // Conflict - usually means resource already exists
            return new Error(message || 'Tài khoản đã tồn tại');
          case 422:
            // Unprocessable Entity - validation error
            return new Error(message || 'Dữ liệu không hợp lệ');
          case 400:
            // Bad Request
            return new Error(message || 'Yêu cầu không hợp lệ');
          case 401:
            // Unauthorized
            return new Error(message || 'Vui lòng đăng nhập lại');
          case 403:
            // Forbidden
            return new Error(message || 'Bạn không có quyền thực hiện thao tác này');
          case 404:
            // Not Found
            return new Error(message || 'Không tìm thấy tài nguyên');
          case 500:
            // Internal Server Error
            return new Error(message || 'Lỗi máy chủ, vui lòng thử lại sau');
          default:
            return new Error(message);
        }
      }

      // If no message but we have status, provide generic message
      switch (status) {
        case 409:
          return new Error('Email hoặc số điện thoại đã được sử dụng');
        case 422:
          return new Error('Dữ liệu nhập vào không hợp lệ. Vui lòng kiểm tra lại');
        case 400:
          return new Error('Thông tin không hợp lệ');
        default:
          return new Error(`${defaultMessage} (Mã lỗi: ${status})`);
      }
    }
  }

  // Fallback to default message
  return new Error(defaultMessage);
};

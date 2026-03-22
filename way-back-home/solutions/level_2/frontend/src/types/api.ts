// API response and error types

export interface ApiError {
    message: string;
    code?: string;
    details?: any;
}

export interface ApiResponse<T = any> {
    data?: T;
    error?: ApiError;
    status: number;
}

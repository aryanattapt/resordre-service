export interface SuccessResponse<T = any> {
    code: 200 | 201 | 204;
    data?: T;
    message?: string;
}

// Client Error 400 - Bad Request
export interface BadRequestResponse {
    errors: string[];  // e.g. ['BadRequest', 'InvalidEmail']
    message: string;
    code: 400;
}

// Client Error 401 - Unauthorized
export interface UnauthorizedResponse {
    errors: string[];  // e.g. ['Unauthorized']
    message: string;
    code: 401;
}

// Client Error 403 - Forbidden
export interface ForbiddenResponse {
    errors: string[];  // e.g. ['Forbidden']
    message: string;
    code: 403;
}

// Client Error 404 - Not Found
export interface NotFoundResponse {
    errors: string[];  // e.g. ['NotFound', 'UserNotFound']
    message: string;
    code: 404;
}

// Client Error 405 - Method Not Allowed
export interface MethodNotAllowedResponse {
    message: string;
    code: 405;
}

// Client Error 422 - Unprocessable Entity
export interface UnprocessableEntityResponse {
    errors: string[];  // e.g. ['UnprocessableEntity', 'ValidationFailed']
    message: string;
    code: 422;
}

// Client Error 429 - Too Many Requests
export interface TooManyRequestsResponse {
    message: string;
    code: 429;
}

// Server Error 500 - Internal Server Error
export interface InternalServerErrorResponse {
    errors: string[];  // e.g. ['InternalServerError']
    message: string;
    code: 500;
}

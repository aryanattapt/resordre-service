export interface BaseResponse {
   code: number;
   message?: string;
}

export interface SuccessResponse<T = any> extends BaseResponse {
   code: 200 | 201 | 204;
   data?: T;
}

export interface ErrorResponse extends BaseResponse {
   errors: string[];
}

export interface BadRequestResponse extends ErrorResponse {
   code: 400;
}

export interface UnauthorizedResponse extends ErrorResponse {
   code: 401;
}

export interface ForbiddenResponse extends ErrorResponse {
   code: 403;
}

export interface NotFoundResponse extends ErrorResponse {
   code: 404;
}

export interface MethodNotAllowedResponse extends BaseResponse {
   code: 405;
}

export interface UnprocessableEntityResponse extends ErrorResponse {
   code: 422;
}

export interface TooManyRequestsResponse extends BaseResponse {
   code: 429;
}

export interface InternalServerErrorResponse extends ErrorResponse {
   code: 500;
}

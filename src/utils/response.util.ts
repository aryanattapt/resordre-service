import type { Response } from 'express';
import type {
    SuccessResponse,
    BadRequestResponse,
    UnauthorizedResponse,
    ForbiddenResponse,
    NotFoundResponse,
    UnprocessableEntityResponse,
    TooManyRequestsResponse,
    InternalServerErrorResponse,
    MethodNotAllowedResponse
} from '../types/response.type';

// Success Responses
export function sendSuccess<T>(res: Response, data?: T, message?: string, code: 200 | 201 | 204 = 200) {
    const response: SuccessResponse<T> = { code };
    if (data !== undefined) response.data = data;
    if (message) response.message = message;
    return res.status(code).json(response);
}

// Client Errors
export function sendBadRequest(res: Response, errors: string[], message = 'Your request is invalid. Please check and try again.') {
    const response: BadRequestResponse = { code: 400, errors, message };
    return res.status(400).json(response);
}

export function sendUnauthorized(res: Response, errors: string[], message = 'You are not authorized to access') {
    const response: UnauthorizedResponse = { code: 401, errors, message };
    return res.status(401).json(response);
}

export function sendForbidden(res: Response, errors: string[], message = 'Access to this resource is forbidden.') {
    const response: ForbiddenResponse = { code: 403, errors, message };
    return res.status(403).json(response);
}

export function sendNotFound(res: Response, errors: string[], message = 'The requested resource was not found.') {
    const response: NotFoundResponse = { code: 404, errors, message };
    return res.status(404).json(response);
}

export function sendMethodNotAllowed(res: Response, message = 'The HTTP method used is not allowed for this endpoint.') {
    const response: MethodNotAllowedResponse = { code: 405, message };
    return res.status(405).json(response);
}

export function sendUnprocessableEntity(res: Response, errors: string[], message = 'The data you provided is not valid.') {
    const response: UnprocessableEntityResponse = { code: 422, errors, message };
    return res.status(422).json(response);
}

export function sendTooManyRequests(res: Response, message = 'You have sent too many requests in a given amount of time. Please try again later.') {
    const response: TooManyRequestsResponse = { code: 429, message };
    return res.status(429).json(response);
}

// Server Error
export function sendInternalServerError(res: Response, errors: string[], message = 'An unexpected error occurred. Please try again later.') {
    const response: InternalServerErrorResponse = { code: 500, errors, message };
    return res.status(500).json(response);
}
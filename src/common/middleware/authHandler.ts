import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import { verifyToken } from "@/common/utils/jwt";

const BEARER_PREFIX = "Bearer ";

const sendUnauthorized = (res: Response, message: string) => {
	const serviceResponse = ServiceResponse.failure(message, null, StatusCodes.UNAUTHORIZED);
	return res.status(serviceResponse.statusCode).send(serviceResponse);
};

const sendForbidden = (res: Response, message: string) => {
	const serviceResponse = ServiceResponse.failure(message, null, StatusCodes.FORBIDDEN);
	return res.status(serviceResponse.statusCode).send(serviceResponse);
};

const extractBearerToken = (authHeader: string): string | null => {
	if (!authHeader.startsWith(BEARER_PREFIX)) {
		return null;
	}

	const token = authHeader.slice(BEARER_PREFIX.length).trim();
	return token.length > 0 ? token : null;
};

export const checkAuthentication = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		return sendUnauthorized(res, "Authorization header missing");
	}

	const token = extractBearerToken(authHeader);

	if (!token) {
		return sendUnauthorized(res, "Invalid or missing Bearer token");
	}

	const decoded = verifyToken(token);

	if (!decoded) {
		return sendUnauthorized(res, "Invalid or expired token");
	}

	req.user = decoded;
	next();
};

export const checkAuthorization = (req: Request, res: Response, next: NextFunction) => {
	if (!req.user) {
		return sendUnauthorized(res, "Authentication required");
	}

	if (req.user.role !== "ADMIN") {
		return sendForbidden(res, "You do not have permission to access this resource");
	}

	next();
};

import type { JwtPayload } from "@/common/utils/jwt";

declare global {
	namespace Express {
		interface Request {
			user?: JwtPayload;
		}
	}
}

import { Session, SessionData } from "express-session";

declare module "express-session" {
    interface SessionData {
        userId?: number;
        name?: string;
    }
}

// interface UserData {
	// req: Request & {
		// session: Session &
			// Partial<SessionData> & {
				// userId?: number;
				// name?: string;
				// email?: string;
			// };
	// };
	// res: Response;
// };
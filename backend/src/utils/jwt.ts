import jwt from "jsonwebtoken";
import { UserRole } from "@nexora/contracts";

export interface JwtTokenPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  departmentId?: string;
}

const JWT_SECRET =
  process.env.JWT_SECRET || "development_secret_change_in_production_min_32_chars";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

export function signToken(payload: JwtTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: (JWT_EXPIRES_IN as any) || "8h",
    algorithm: "HS256",
  });
}

export function verifyToken(token: string): JwtTokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtTokenPayload;
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      const err: any = new Error("Authentication token has expired.");
      err.code = "TOKEN_EXPIRED";
      err.status = 401;
      throw err;
    }
    const err: any = new Error("Authentication token is invalid.");
    err.code = "INVALID_TOKEN";
    err.status = 401;
    throw err;
  }
}

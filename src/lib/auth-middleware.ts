// /lib/auth-middleware.ts
import { jwtVerify, SignJWT } from "jose";
import { getUserById } from "@/db/utils/users";

export interface AuthUser {
  userId: string;
  email: string;
  roles: string[];
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

// JWT payload interface for type safety
interface JWTPayload {
  userId: string;
  email: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

// Helper function to create JWT secret key
const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET || "your-secret-key-make-this-longer-for-production";
  return new TextEncoder().encode(secret);
};

export async function authenticateToken(request: Request): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    const { payload } = await jwtVerify(token, getJWTSecret());

    const jwtPayload = payload as unknown as JWTPayload;

    // Verify user still exists
    const user = await getUserById(jwtPayload.userId);
    if (!user) {
      return null;
    }

    return {
      userId: jwtPayload.userId,
      email: jwtPayload.email,
      roles: jwtPayload.roles
    };
  } catch (error) {
    console.error("Token authentication error:", error);
    return null;
  }
}

export function requireAuth() {
  return async (request: Request) => {
    const user = await authenticateToken(request);
    if (!user) {
      throw new Error("Authentication required");
    }
    return user;
  };
}

export function requireRole(requiredRole: string) {
  return async (request: Request) => {
    const user = await authenticateToken(request);
    if (!user) {
      throw new Error("Authentication required");
    }
    
    if (!user.roles.includes(requiredRole)) {
      throw new Error("Insufficient permissions");
    }
    
    return user;
  };
}

export function requirePermission(requiredPermission: string) {
  return async (request: Request) => {
    const user = await authenticateToken(request);
    if (!user) {
      throw new Error("Authentication required");
    }
    
    // Get full user data with permissions
    const fullUser = await getUserById(user.userId);
    if (!fullUser) {
      throw new Error("User not found");
    }
    
    const hasRequiredPermission = fullUser.permissions.some(
      p => p.name === requiredPermission
    );
    
    if (!hasRequiredPermission) {
      throw new Error("Insufficient permissions");
    }
    
    return user;
  };
}

// Helper function to create a new JWT token
export async function createJWTToken(userId: string, email: string, roles: string[]): Promise<string> {
  return await new SignJWT({ 
    userId, 
    email,
    roles
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getJWTSecret());
}


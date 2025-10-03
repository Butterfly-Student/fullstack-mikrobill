// /api/auth/refresh.ts - Token refresh endpoint
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { getUserById } from "@/db/utils/users";
import { jwtVerify, decodeJwt } from "jose";
import { createJWTToken } from "@/lib/auth-middleware";

// Helper function to create JWT secret key
const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET || "your-secret-key-make-this-longer-for-production";
  return new TextEncoder().encode(secret);
};

// JWT payload interface for type safety
interface JWTPayload {
  userId: string;
  email: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

export const ServerRoute = createServerFileRoute("/api/auth/refresh").methods({
  POST: async ({ request }) => {
    try {
      const authHeader = request.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return json({ error: "No token provided" }, { status: 401 });
      }

      const token = authHeader.substring(7);
      
      try {
        // Try to verify the token (this will throw if expired)
        const { payload } = await jwtVerify(token, getJWTSecret());
        const jwtPayload = payload as unknown as JWTPayload;

        // Get fresh user data
        const user = await getUserById(jwtPayload.userId);
        if (!user) {
          return json({ error: "User not found" }, { status: 404 });
        }

        // Generate new token
        const newToken = await createJWTToken(
          user.id, 
          user.email, 
          user.roles.map(role => role.name)
        );

        return json({
          message: "Token refreshed successfully",
          token: newToken
        });

      } catch (jwtError) {
        // If token is expired, allow refresh within 7 days
        if (jwtError instanceof Error) {
          console.error("Error verifying token:", jwtError.message);
        }
        try {
          const decodedPayload = decodeJwt(token) as JWTPayload;
          
          if (!decodedPayload || !decodedPayload.exp) {
            return json({ error: "Invalid token" }, { status: 401 });
          }

          const now = Date.now() / 1000;
          const expired = decodedPayload.exp;
          const sevenDaysInSeconds = 7 * 24 * 60 * 60;

          // Allow refresh if token expired less than 7 days ago
          if (now - expired > sevenDaysInSeconds) {
            return json({ error: "Token too old to refresh" }, { status: 401 });
          }

          // Get fresh user data
          const user = await getUserById(decodedPayload.userId);
          if (!user) {
            return json({ error: "User not found" }, { status: 404 });
          }

          // Generate new token
          const newToken = await createJWTToken(
            user.id, 
            user.email, 
            user.roles.map(role => role.name)
          );

          return json({
            message: "Token refreshed successfully",
            token: newToken
          });
          
        } catch (decodeError) {
          console.error("Error decoding token:", decodeError);
          return json({ error: "Invalid token format" }, { status: 401 });
        }
      }

    } catch (error) {
      console.error("Error refreshing token:", error);
      return json({ error: "Failed to refresh token" }, { status: 500 });
    }
  },
});


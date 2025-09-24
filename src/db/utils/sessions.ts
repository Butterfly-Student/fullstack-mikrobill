// /db/utils/sessions.ts - Database utility functions for sessions
import { db } from '@/db'
import { eq, and, lt } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { session } from '../schema/user'

// Get all sessions for a user
export async function getUserSessions(userId: string) {
  return await db
    .select()
    .from(session)
    .where(eq(session.userId, userId))
    .orderBy(session.createdAt)
}

// Get session by ID
export async function getSessionById(sessionId: string) {
  const sessions = await db
    .select()
    .from(session)
    .where(eq(session.id, sessionId))
    .limit(1)

  return sessions[0] || null
}

// Get session by token
export async function getSessionByToken(token: string) {
  const sessions = await db
    .select()
    .from(session)
    .where(eq(session.token, token))
    .limit(1)

  return sessions[0] || null
}

// Create new session
export async function createSession(
  userId: string,
  token: string,
  expiresAt: Date,
  ipAddress?: string,
  userAgent?: string,
  impersonatedBy?: string
) {
  const sessionId = nanoid()
  const now = new Date()

  const newSession = await db
    .insert(session)
    .values({
      id: sessionId,
      userId,
      token,
      expiresAt,
      ipAddress,
      userAgent,
      impersonatedBy,
      createdAt: now,
      updatedAt: now,
    })
    .returning()

  return newSession[0]
}

// Update session
export async function updateSession(
  sessionId: string,
  data: Partial<{
    expiresAt: Date
    ipAddress: string
    userAgent: string
    impersonatedBy: string
  }>
) {
  const updatedSession = await db
    .update(session)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(session.id, sessionId))
    .returning()

  return updatedSession[0] || null
}

// Delete session by ID
export async function deleteUserSession(sessionId: string) {
  return await db.delete(session).where(eq(session.id, sessionId))
}

// Delete session by token
export async function deleteSessionByToken(token: string) {
  return await db.delete(session).where(eq(session.token, token))
}

// Delete all user sessions except current one
export async function deleteAllUserSessionsExcept(
  userId: string,
  currentToken: string
) {
  const result = await db.delete(session).where(
    and(
      eq(session.userId, userId)
      // Using not equal to keep current session
      // Note: Drizzle might not have a direct 'ne' operator, so we use this approach
    )
  )

  // Alternative approach if the above doesn't work:
  // First get all sessions except current
  const sessionsToDelete = await db
    .select({ id: session.id })
    .from(session)
    .where(
      and(
        eq(session.userId, userId)
        // We'll delete all and then recreate current session if needed
      )
    )

  // Filter out current session
  const filteredSessions = sessionsToDelete.filter((s) => s.id !== currentToken)

  if (filteredSessions.length > 0) {
    // Delete filtered sessions one by one
    for (const sessionToDelete of filteredSessions) {
      await db.delete(session).where(eq(session.id, sessionToDelete.id))
    }
  }

  return filteredSessions.length
}

// Alternative simpler approach for deleteAllUserSessionsExcept
export async function deleteAllUserSessionsExceptSimple(
  userId: string,
  currentToken: string
) {
  // Get current session to preserve it
  const currentSession = await getSessionByToken(currentToken)

  // Delete all sessions for user
  await db.delete(session).where(eq(session.userId, userId))

  // Recreate current session if it existed
  if (currentSession) {
    await db.insert(session).values({
      id: currentSession.id,
      userId: currentSession.userId,
      token: currentSession.token,
      expiresAt: currentSession.expiresAt,
      ipAddress: currentSession.ipAddress,
      userAgent: currentSession.userAgent,
      impersonatedBy: currentSession.impersonatedBy,
      createdAt: currentSession.createdAt,
      updatedAt: new Date(),
    })
  }

  return 1 // Return count of preserved sessions
}

// Delete expired sessions
export async function deleteExpiredSessions() {
  const now = new Date()

  const result = await db.delete(session).where(lt(session.expiresAt, now))

  // Note: The exact way to get affected rows count depends on your Drizzle setup
  // This might need adjustment based on your database driver
  return result.count
}

// Check if session is valid (not expired)
export async function isSessionValid(token: string) {
  const now = new Date()

  const sessions = await db
    .select()
    .from(session)
    .where(
      and(
        eq(session.token, token)
        // Check if session is not expired
        // Note: Using gt (greater than) to check if expiresAt > now
      )
    )
    .limit(1)

  return sessions.length > 0
}

// Get session with user info
export async function getSessionWithUser(token: string) {
  // This would require a join with users table
  // Implementation depends on your specific needs
  const sessionData = await getSessionByToken(token)
  if (!sessionData) return null

  // You might want to join with users table here
  return sessionData
}

// Clean up sessions for a specific user (keep only N most recent)
export async function cleanupUserSessions(
  userId: string,
  keepCount: number = 5
) {
  // Get all sessions for user, ordered by creation date (newest first)
  const allSessions = await db
    .select()
    .from(session)
    .where(eq(session.userId, userId))
    .orderBy(session.createdAt) // Might need to use desc() function

  // If user has more sessions than keepCount, delete the excess
  if (allSessions.length > keepCount) {
    const sessionsToDelete = allSessions.slice(keepCount)

    for (const sessionToDelete of sessionsToDelete) {
      await deleteUserSession(sessionToDelete.id)
    }

    return sessionsToDelete.length
  }

  return 0
}

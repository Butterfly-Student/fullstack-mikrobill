import { relations } from 'drizzle-orm';
import { pgTable, serial, varchar, text, timestamp, integer, index, boolean, uuid } from 'drizzle-orm/pg-core';


// Users table
export const users = pgTable(
  'users',
  {
    id: varchar('id', { length: 50 }).primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    emailVerified: boolean('email_verified')
      .$defaultFn(() => false)
      .notNull(),
    image: text('image'),
    // Additional fields for extended user info
    username: varchar('username', { length: 255 }).unique(),
    first_name: varchar('first_name', { length: 50 }),
    last_name: varchar('last_name', { length: 50 }),
    phone: varchar('phone', { length: 20 }),
    role: text('role').default('user'), // admin, operator, user
    is_active: boolean('is_active').default(true),
    last_login: timestamp('last_login'),
    createdAt: timestamp('created_at')
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp('updated_at')
      .$defaultFn(() => new Date())
      .notNull(),
    banned: boolean('banned').default(false),
    banReason: text('ban_reason'),
    banExpires: timestamp('ban_expires'),
  },
  (table) => [
    index('users_email_idx').on(table.email),
    index('users_username_idx').on(table.username),
    index('users_role_idx').on(table.role),
    index('users_banned_idx').on(table.banned),
  ]
)

// Roles table
export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Resources table
export const resources = pgTable('resources', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Actions table
export const actions = pgTable('actions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Permissions table (now references resources and actions)
export const permissions = pgTable('permissions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: text('description'),
  resourceId: integer('resource_id')
    .references(() => resources.id, { onDelete: 'cascade' })
    .notNull(),
  actionId: integer('action_id')
    .references(() => actions.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// User roles junction table
export const userRoles = pgTable(
  'user_roles',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    roleId: integer('role_id')
      .references(() => roles.id, { onDelete: 'cascade' })
      .notNull(),
    assigned_by: text('assigned_by').references(() => users.id),
    assignedAt: timestamp('assigned_at').defaultNow().notNull(),
  },
  (table) => [
    index('users_roles_users_id_idx').on(table.userId),
    index('users_roles_role_id_idx').on(table.roleId),
  ]
)

// Role permissions junction table
export const rolePermissions = pgTable(
  'role_permissions',
  {
    id: serial('id').primaryKey(),
    roleId: integer('role_id')
      .references(() => roles.id, { onDelete: 'cascade' })
      .notNull(),
    permissionId: integer('permission_id')
      .references(() => permissions.id, { onDelete: 'cascade' })
      .notNull(),
    grantedAt: timestamp('granted_at').defaultNow().notNull(),
  },
  (table) => [
    index('role_permissions_role_id_idx').on(table.roleId),
    index('role_permissions_permission_id_idx').on(table.permissionId),
  ]
)

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    impersonatedBy: text('impersonated_by').references(() => users.id),
  },
  (table) => [index('session_impersonatedBy_idx').on(table.impersonatedBy)]
)

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()),
})

// Routers table
export const routers = pgTable(
  'routers',
  {
    id: serial('id').primaryKey(),
    uuid: uuid('uuid').defaultRandom().notNull().unique(),
    name: varchar('name', { length: 100 }).notNull(),
    hostname: varchar('hostname', { length: 45 }).notNull(),
    username: varchar('username', { length: 50 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    keepalive: boolean('keepalive').default(true),
    timeout: integer('timeout').default(300000),
    port: integer('port').default(8728),
    location: varchar('location', { length: 100 }),
    description: text('description'),
    is_active: boolean('is_active').default(true),
    last_seen: timestamp('last_seen'),
    status: varchar('status', { length: 20 }).default('offline'), // online, offline, error
    version: varchar('version', { length: 50 }),
    uptime: varchar('uptime', { length: 50 }),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    index('routers_ip_idx').on(table.hostname),
    index('routers_status_idx').on(table.status),
    index('routers_active_idx').on(table.is_active),
  ]
)

// User Relations
export const userRelations = relations(users, ({ many }) => ({
  userRoles: many(userRoles),
  sessions: many(session),
  accounts: many(account),
}))

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
  rolePermissions: many(rolePermissions),
}))

export const resourcesRelations = relations(resources, ({ many }) => ({
  permissions: many(permissions),
}))

export const actionsRelations = relations(actions, ({ many }) => ({
  permissions: many(permissions),
}))

export const permissionsRelations = relations(permissions, ({ many, one }) => ({
  rolePermissions: many(rolePermissions),
  resource: one(resources, {
    fields: [permissions.resourceId],
    references: [resources.id],
  }),
  action: one(actions, {
    fields: [permissions.actionId],
    references: [actions.id],
  }),
}))

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}))

export const rolePermissionsRelations = relations(
  rolePermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id],
    }),
    permission: one(permissions, {
      fields: [rolePermissions.permissionId],
      references: [permissions.id],
    }),
  })
)

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(users, {
    fields: [session.userId],
    references: [users.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(users, {
    fields: [account.userId],
    references: [users.id],
  }),
}))

// Types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Role = typeof roles.$inferSelect
export type NewRole = typeof roles.$inferInsert
export type Resource = typeof resources.$inferSelect
export type NewResource = typeof resources.$inferInsert
export type Action = typeof actions.$inferSelect
export type NewAction = typeof actions.$inferInsert
export type Permission = typeof permissions.$inferSelect
export type NewPermission = typeof permissions.$inferInsert
export type UserRole = typeof userRoles.$inferSelect
export type NewUserRole = typeof userRoles.$inferInsert
export type RolePermission = typeof rolePermissions.$inferSelect
export type NewRolePermission = typeof rolePermissions.$inferInsert
export type Session = typeof session.$inferSelect
export type NewSession = typeof session.$inferInsert
export type Account = typeof account.$inferSelect
export type NewAccount = typeof account.$inferInsert
export type Verification = typeof verification.$inferSelect
export type NewVerification = typeof verification.$inferInsert
export type Router = typeof routers.$inferSelect
export type NewRouter = typeof routers.$inferInsert
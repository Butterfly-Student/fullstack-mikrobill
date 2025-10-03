import { db } from '@/db/index';
import { routers, type NewRouter } from '@/db/schema/user';
import { json } from '@tanstack/react-start';
import { createServerFileRoute } from '@tanstack/react-start/server';
import { eq } from 'drizzle-orm';
import { createDirectClient } from '@/lib/mikrotik/client';


interface CreateRouterRequest {
  name: string
  hostname: string
  username: string
  password: string
  location?: string
  description?: string
  is_active?: boolean
  port?: number
  timeout?: number
  keepalive?: boolean
}

export const ServerRoute = createServerFileRoute(
  '/api/mikrotik/router/'
).methods({
  // GET /api/mikrotik/router - Get all routers with pagination and filters
  GET: async ({ request }) => {
    console.info('Fetching routers... @', request.url)
    

    try {

      const routersList = await db
        .select({
          id: routers.id,
          uuid: routers.uuid,
          name: routers.name,
          hostname: routers.hostname,
          username: routers.username,
          password: routers.password,
          location: routers.location,
          description: routers.description,
          is_active: routers.is_active,
          status: routers.status,
          last_seen: routers.last_seen,
          version: routers.version,
          uptime: routers.uptime,
          port: routers.port,
          timeout: routers.timeout,
          keepalive: routers.keepalive,
          created_at: routers.created_at,
          updated_at: routers.updated_at,
        })
        .from(routers)


      return json({
        data: routersList,
        message: 'Routers retrieved successfully',
      })
    } catch (error: any) {
      console.error('Error fetching routers:', error)
      return json(
        {
          error: 'Failed to retrieve routers',
          message: error.message || 'Unknown error occurred',
        },
        { status: 500 }
      )
    }
  },

  // POST /api/mikrotik/router - Create new router
  POST: async ({ request }) => {
    console.info('Creating router... @', request.url)

    try {
      const body: CreateRouterRequest = await request.json()

      // Validate required fields
      if (!body.name || !body.hostname || !body.username || !body.password) {
        return json(
          {
            error: 'Missing required fields',
            message: 'Name, hostname, username, and password are required',
          },
          { status: 400 }
        )
      }

      // Check if router with same hostname already exists
      const existingRouter = await db
        .select()
        .from(routers)
        .where(eq(routers.hostname, body.hostname))
        .limit(1)

      if (existingRouter.length > 0) {
        return json(
          {
            error: 'Router already exists',
            message: 'A router with this hostname already exists',
          },
          { status: 409 }
        )
      }

      // Prepare data for creation
      const routerData: NewRouter = {
        name: body.name,
        hostname: body.hostname,
        username: body.username,
        password: body.password,
        location: body.location || null,
        description: body.description || null,
        is_active: body.is_active ?? true,
        port: body.port ?? 8728,
        timeout: body.timeout ?? 300000,
        keepalive: body.keepalive ?? true,
        status: 'offline',
        created_at: new Date(),
        updated_at: new Date(),
      }

      const [newRouter] = await db
        .insert(routers)
        .values(routerData)
        .returning()

      return json(
        {
          data: {
            id: newRouter.id,
            uuid: newRouter.uuid,
            name: newRouter.name,
            hostname: newRouter.hostname,
            location: newRouter.location,
            description: newRouter.description,
            is_active: newRouter.is_active,
            status: newRouter.status,
            port: newRouter.port,
            timeout: newRouter.timeout,
            keepalive: newRouter.keepalive,
            created_at: newRouter.created_at,
            updated_at: newRouter.updated_at,
          },
          message: 'Router created successfully',
        },
        { status: 201 }
      )
    } catch (error: any) {
      console.error('Error creating router:', error)
      return json(
        {
          error: 'Failed to create router',
          message: error.message || 'Unknown error occurred',
        },
        { status: 500 }
      )
    }
  },
})
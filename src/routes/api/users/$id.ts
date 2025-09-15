import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { getUserById } from "@/db/utils/users";

export const ServerRoute = createServerFileRoute("/api/users/$id").methods({
	GET: async ({ request, params }) => {
		console.info(`Fetching user by id=${params.id}... @`, request.url);

		try {
			const user = await getUserById(params.id); // params.id is already string, no conversion needed

			if (!user) {
				return json({ error: "User not found" }, { status: 404 });
			}

			// Return comprehensive user data
			const formattedUser = {
				id: user.id,
				name: user.name,
				email: user.email,
				username: user.username,
				emailVerified: user.emailVerified,
				isActive: user.is_active,
				role: user.role,
				image: user.image,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
				roles: user.roles.map((role) => ({
					id: role.id,
					name: role.name,
					description: role.description,
					createdAt: role.createdAt,
				})),
				permissions: user.permissions.map((permission) => ({
					id: permission.id,
					name: permission.name,
					description: permission.description,
					resource: {
						id: permission.resource.id,
						name: permission.resource.name,
					},
					action: {
						id: permission.action.id,
						name: permission.action.name,
					},
					createdAt: permission.createdAt,
				})),
			}

			return json(formattedUser);
		} catch (error) {
			console.error("Error fetching user:", error);
			return json({ error: "Internal server error" }, { status: 500 });
		}
	},
});

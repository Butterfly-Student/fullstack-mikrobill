import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { getAllUsers } from "@/db/utils/users";

export const ServerRoute = createServerFileRoute("/api/users/").methods({
	GET: async ({ request }) => {
		console.info("Fetching users... @", request.url);

		try {
			const users = await getAllUsers();

			// Map to return only necessary fields and format the response
			const formattedUsers = users.map((user) => ({
				id: user.id,
				name: user.name,
				email: user.email,
				username: user.username,
				emailVerified: user.emailVerified,
				isActive: user.is_active,
				role: user.role,
				password: user.password,
				createdAt: user.createdAt,
				roles: user.userRoles.map((ur) => ({
					id: ur.role.id,
					name: ur.role.name,
					description: ur.role.description,
					assignedAt: ur.assignedAt,
				})),
			}))

			return json(formattedUsers);
		} catch (error) {
			console.error("Error fetching users:", error);
			return json({ error: "Failed to fetch users" }, { status: 500 });
		}
	},
});

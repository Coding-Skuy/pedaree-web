import { redirect } from "@sveltejs/kit";
import { hapusSesi } from "$lib/server/sesi";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = ({ cookies }) => {
  hapusSesi(cookies);
  redirect(303, "/masuk");
};

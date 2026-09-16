import { createFileRoute, redirect } from "@tanstack/react-router";
import { api } from "@/lib/api"; // Sesuaikan path dengan lokasi api kamu
export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    // Redirect ke projects jika sudah login, atau login page
    try {
      await api.getMe();
      throw redirect({ to: "/app/projects" });
    } catch {
      throw redirect({ to: "/login" });
    }
  },
});

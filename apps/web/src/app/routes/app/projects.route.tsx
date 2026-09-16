import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/app/projects")({
  component: ProjectsPage,
});

interface Project {
  id: string;
  name: string;
  description: string;
}

function ProjectsPage() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      // Mock API
      return [
        { id: "1", name: "Project Alpha", description: "Main project" },
        { id: "2", name: "Project Beta", description: "Side project" },
      ] as Project[];
    },
  });

  if (isLoading)
    return <div className="flex justify-center p-8">Loading...</div>;

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <button className="mt-4 sm:mt-0 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
          + New Project
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects?.map((project) => (
          <Link
            key={project.id}
            to="/app/chat/$projectId"
            params={{ projectId: project.id }}
            className="block p-6 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900">
              {project.name}
            </h3>
            <p className="text-sm text-gray-500 mt-2">{project.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

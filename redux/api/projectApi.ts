import { baseApi } from "@/redux/api/baseApi";

const projectApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createProject: build.mutation({
      query: (projectData) => ({
        url: "/projects/create",
        method: "POST",
        data: projectData,
      }),
      invalidatesTags: ["team", "member", "project"],
    }),

    getProjects: build.query({
      query: ({ page = 1, limit = 10, searchTerm = "" }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          searchTerm: searchTerm,
        });

        return {
          url: `/projects?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["team", "member", "project"],
    }),

    updateProject: build.mutation({
      query: ({ projectId, ...data }) => ({
        url: `/projects/${projectId}`,
        method: "PATCH",
        data: data,
      }),
      invalidatesTags: ["team", "member", "project"],
    }),

    deleteProject: build.mutation({
      query: (projectId) => ({
        url: `/projects/${projectId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["team", "member", "project"],
    }),
  }),
});

export const { useCreateProjectMutation, useGetProjectsQuery, useUpdateProjectMutation, useDeleteProjectMutation } = projectApi;

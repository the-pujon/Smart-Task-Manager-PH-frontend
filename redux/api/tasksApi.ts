import { reassignTask } from "@/lib/store";
import { baseApi } from "@/redux/api/baseApi";

const tasksApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createTask: build.mutation({
      query: ({autoReassignEnabled, ...taskData }) => ({
        url: `/tasks/create?autoReassign=${autoReassignEnabled}`,
        method: "POST",
        data: taskData,
      }),
      invalidatesTags: ["team", "member", "project"],
    }),

    getTasks: build.query({
      query: ({ page = 1, limit = 10, searchTerm = "" }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          searchTerm: searchTerm,
        });

        return {
          url: `/tasks?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["team", "member", "project"],
    }),

    updateTask: build.mutation({
      query: ({ taskId, ...data }) => ({
        url: `/tasks/${taskId}`,
        method: "PATCH",
        data: data,
      }),
      invalidatesTags: ["team", "member", "project"],
    }),

    deleteTask: build.mutation({
      query: (taskId) => ({
        url: `/tasks/${taskId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["team", "member", "project"],
    }),


    reassignTask: build.mutation({
      query: (teamId ) => ({
        url: `/tasks/reassign`,
        method: "POST",
        data: teamId ,
      }),
      invalidatesTags: ["team", "member", "project"],
    }),

  }),
});

export const { useCreateTaskMutation, useGetTasksQuery, useUpdateTaskMutation, useDeleteTaskMutation, useReassignTaskMutation } = tasksApi;

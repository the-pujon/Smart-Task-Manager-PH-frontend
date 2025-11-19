import { baseApi } from "@/redux/api/baseApi";

const activityLogApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Get all activity logs with optional filters
    getActivityLogs: build.query({
      query: ({ page = 1, limit = 10, searchTerm = "" }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          searchTerm: searchTerm,
        });

        return {
          url: `/activity-logs?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["activityLog"],
    }),

    // Get activity logs for a specific project
    getProjectActivityLogs: build.query({
      query: ({ projectId, page = 1, limit = 10 }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        return {
          url: `/activity-logs/project/${projectId}?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["activityLog"],
    }),

    // Get activity logs for a specific task
    getTaskActivityLogs: build.query({
      query: ({ taskId, page = 1, limit = 10 }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        return {
          url: `/activity-logs/task/${taskId}?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["activityLog"],
    }),
  }),
});

export const {
  useGetActivityLogsQuery,
  useGetProjectActivityLogsQuery,
  useGetTaskActivityLogsQuery,
} = activityLogApi;

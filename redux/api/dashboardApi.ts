import { reassignTask } from "@/lib/store";
import { baseApi } from "@/redux/api/baseApi";

const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    getDashboard: build.query({
      query: ({ page = 1, limit = 10, searchTerm = "" }) => {

        return {
          url: `/dashboard`,
          method: "GET",
        };
      },
      providesTags: ["team", "member", "project", "activityLog", "user", "task"],
    }),

 
  }),
});

export const {
  useGetDashboardQuery,
} = dashboardApi;
import { baseApi } from "@/redux/api/baseApi";

const teamApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createTeam: build.mutation({
      query: (teamData) => ({
        url: "/teams/create",
        method: "POST",
        data: teamData,
      }),
      invalidatesTags: ["team", "member"],
    }),

    getTeams: build.query({
      query: ({ page = 1, limit = 10, searchTerm = "" }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          searchTerm: searchTerm,
        });

        return {
          url: `/teams?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["team", "member"],
    }),

    updateTeam: build.mutation({
      query: ({ teamId, ...data }) => ({
        url: `/teams/${teamId}`,
        method: "PATCH",
        data: data,
      }),
      invalidatesTags: ["team", "member"],
    }),

    deleteTeam: build.mutation({
      query: ({teamId}) => ({
        url: `/teams/${teamId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["team", "member"],
    }),
  }),
});

export const {
  useCreateTeamMutation,
  useGetTeamsQuery,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
} = teamApi;

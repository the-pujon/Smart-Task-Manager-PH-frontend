import { baseApi } from "@/redux/api/baseApi";

const membersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createMember: build.mutation({
      query: (memberData) => ({
        url: "/members/create",
        method: "POST",
        data: memberData,
      }),
      invalidatesTags: ["member", "team"],
    }),

    getMembers: build.query({
      query: ({ page = 1, limit = 10, searchTerm = "" }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          searchTerm: searchTerm,
        });

        return {
          url: `/members?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["member", "team"],
    }),

    updateMember: build.mutation({
      query: ({ memberId, ...data }) => {
        console.log("Updating member:", `/members/${memberId}`);
        return {
        url: `/members/${memberId}`,
        method: "PATCH",
        data: data,
      }
      },
      invalidatesTags: ["member", "team"],
    }),

    deleteMember: build.mutation({
      query: ({memberId}) => ({
        url: `/members/${memberId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["member", "team"],
    }),
  }),
});

export const {
  useCreateMemberMutation,
  useGetMembersQuery,
  useUpdateMemberMutation,
  useDeleteMemberMutation,
} = membersApi;

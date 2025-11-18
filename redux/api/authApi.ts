import { baseApi } from "@/redux/api/baseApi";
import { verify } from "crypto";
import { refresh } from "next/cache";

const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    userSignUp: build.mutation({
      query: (signUpData) => ({
        url: "/auth/signup",
        method: "POST",
        data: signUpData,
      }),
      invalidatesTags: ["user"],
    }),
    userLogin: build.mutation({
      query: (loginData) => ({
        url: "/auth/login",
        method: "POST",
        data: loginData,
      }),
      invalidatesTags: ["user"],
    }),

    userLogout: build.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["user"],
    }),

    getUsers: build.query({
      query: ({ page = 1, limit = 10, searchTerm = "" }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          searchTerm: searchTerm,
        });

        return {
          url: `/auth/users?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["user"],
    }),

    changeRole: build.mutation({
      query: (data) => {
        // console.log(data)
        return {
          url: `/auth/change-role`,
          method: "PATCH",
          data: data,
        };
      },
      invalidatesTags: ["user"],
    }),

    deleteUser: build.mutation({
      query: (id) => ({
        url: `/auth/delete-user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["user"],
    }),

    changePassword: build.mutation({
      query: (data) => ({
        url: `/auth/change-password`,
        method: "PATCH",
        data: data,
      }),
      invalidatesTags: ["user"],
    }),

    userPasswordChange: build.mutation({
      query: (data) => ({
        url: `/auth/user-change-password`,
        method: "PATCH",
        data: data,
      }),
      invalidatesTags: ["user"],
    }),

    verifyEmail: build.mutation({
      query: (data) => ({
        url: `/auth/verify-email`,
        method: "POST",
        data: data,
      }),
      invalidatesTags: ["user"],
    }),

    resendVerificationEmail: build.mutation({
      query: (data) => ({
        url: `/auth/resend-Verify-Email-Code`,
        method: "POST",
        data: data,
      }),
      invalidatesTags: ["user"],
    }),

    refreshToken: build.mutation({
      query: () => ({
        url: `/auth/refresh-token`,
        method: "POST",
      }),
      invalidatesTags: ["user"],
    }),
  }),
});

export const {
  useUserLoginMutation,
  useUserLogoutMutation,
  useGetUsersQuery,
  useChangeRoleMutation,
  useDeleteUserMutation,
  useChangePasswordMutation,
  useUserPasswordChangeMutation,
  useUserSignUpMutation,
  useVerifyEmailMutation,
  useResendVerificationEmailMutation,
  useRefreshTokenMutation,
} = authApi;

// const getCookie = (name: string) => {
//     const value = `; ${document.cookie}`;
//     const parts = value.split(`; ${name}=`);
//     if (parts.length === 2) return parts.pop()?.split(";").shift();
// };

// const storage = {
//     getToken: () => {
//         const token = getCookie("token");
//         return token || null;
//     },
//     setToken: (token: string) => {
//         document.cookie = `token=${token}; path=/; secure; SameSite=Strict`;
//     },
//     clearToken: () => {
//         document.cookie =
//             "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
//     },
// };

// export default storage;

// export const extractHRRoles = (
//     roles: { appCode: string; role: string }[],
// ): string[] => {
//     return roles.filter((r) => r.appCode === "HR").map((r) => r.role);
// };

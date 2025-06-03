export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  localStorage.removeItem("isAuthenticated");
  window.location.href = "/";
};
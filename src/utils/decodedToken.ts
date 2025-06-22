import { jwtDecode } from "jwt-decode";

export function getInfoFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded || null;
  } catch (e) {
    return null;
  }
}
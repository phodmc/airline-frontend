import { jwtDecode } from "jwt-decode";
import { ref } from "vue";
import api from "./api";

const isLoggedIn = ref(false);
const isAdmin = ref(false);

const checkAdmin = async () => {
  const res = await api.get("/users/me");
  const currentUser = res.data;
  isAdmin.value = currentUser.IsAdmin;
};

const checkLogin = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    isLoggedIn.value = false;
    return;
  }

  // check for validity of token
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      console.warn("Token expired! Logging out...");
      logout();
    } else {
      isLoggedIn.value = true;
    }
  } catch (error) {
    isLoggedIn.value = false;
    localStorage.removeItem("token");
  }
};

export { checkLogin, isLoggedIn, isAdmin, checkAdmin };

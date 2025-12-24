import { jwtDecode } from "jwt-decode";
import { ref } from "vue";
import { useRouter } from "vue-router";

const isLoggedIn = ref(false);
const router = useRouter();

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

const logout = () => {
  localStorage.removeItem("token");
  isLoggedIn.value = false;
  router.push("/login");
};

export { checkLogin, logout, isLoggedIn };

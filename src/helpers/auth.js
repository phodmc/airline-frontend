import { jwtDecode } from "jwt-decode";
import { ref } from "vue";

const isLoggedIn = ref(false);

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

export { checkLogin, isLoggedIn };

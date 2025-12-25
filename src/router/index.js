import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import AdminView from "@/views/AdminView.vue";
import BookingView from "@/views/BookingView.vue";
import SuccessView from "@/views/SuccessView.vue";

const routes = [
  { path: "/", component: HomeView },
  { path: "/login", component: LoginView },
  { path: "/success/:pnr", component: SuccessView },
  { path: "/admin", component: AdminView, meta: { requiresAuth: true } },
  { path: "/book/:id", component: BookingView, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// makes sure valid token is provided when accessing secured/authenticated routes
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("token");

  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login");
  } else {
    next();
  }
});

export default router;

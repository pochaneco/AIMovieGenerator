import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", component: () => import("@/Pages/Home/Home.vue") },
  {
    path: "/settings",
    component: () => import("@/Pages/Settings/SettingsPage.vue"),
  },
  {
    path: "/generate",
    component: () => import("@/Pages/Generate/GeneratePage.vue"),
  },
  {
    path: "/project",
    name: "ProjectIndex",
    component: () => import("@/Pages/Project/Index.vue"),
  },
  {
    path: "/project/edit",
    name: "ProjectEdit",
    component: () => import("@/Pages/Project/Edit.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

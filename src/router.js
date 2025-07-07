import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", component: () => import("@/Pages/Home/Index.vue") },
  {
    path: "/settings",
    component: () => import("@/Pages/Settings/Index.vue"),
  },
  {
    path: "/generate",
    component: () => import("@/Pages/Script/Index.vue"),
  },
  {
    path: "/script/:id",
    name: "ScriptShow",
    component: () => import("@/Pages/Script/Show.vue"),
  },
  {
    path: "/script/:id/edit",
    name: "ScriptEdit",
    component: () => import("@/Pages/Script/Edit.vue"),
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

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
    path: "/project/new",
    name: "ProjectNew",
    component: () => import("@/Pages/Project/New.vue"),
  },
  {
    path: "/project/edit",
    name: "ProjectEdit",
    component: () => import("@/Pages/Project/Edit.vue"),
  },
  {
    path: "/project/:id/character/new",
    name: "CharacterNew",
    component: () => import("@/Pages/Project/CharacterNew.vue"),
  },
  {
    path: "/project/:id/character/:characterIndex/edit",
    name: "CharacterEdit",
    component: () => import("@/Pages/Project/CharacterEdit.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

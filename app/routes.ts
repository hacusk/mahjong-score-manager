import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route(
    process.env.NODE_ENV === "production" ? "mahjong-score-manager" : "/",
    "routes/home.tsx",
  ),
] satisfies RouteConfig;

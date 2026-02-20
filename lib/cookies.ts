import { type ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const ACCESS_TOKEN_COOKIE: ResponseCookie = {
  name: "access_token",
  value: "",
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  path: "/",
  maxAge: 900, // 15 min
};

export const REFRESH_TOKEN_COOKIE: ResponseCookie = {
  name: "refresh_token",
  value: "",
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  path: "/",
  maxAge: 604800, // 7 days
};

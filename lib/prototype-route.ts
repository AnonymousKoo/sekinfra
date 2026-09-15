export function isPrototypeRouteBlocked(vercelEnvironment = process.env.VERCEL_ENV) {
  return vercelEnvironment === "production";
}

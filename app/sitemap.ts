import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap { const base="https://www.sekinfra.com"; return ["/","/outcomes","/how-it-works","/about","/start"].map(path=>({url:`${base}${path}`,lastModified:new Date(),changeFrequency:"monthly",priority:path==="/"?1:.7})); }

import type{ReactNode}from"react";import{ContextFocus}from"@/components/context-focus";import{SiteFooter}from"@/components/site-footer";import{SiteHeader}from"@/components/site-header";
export function SiteShell({children}:{children:ReactNode}){return <><SiteHeader/><ContextFocus/><main className="flex-1">{children}</main><SiteFooter/></>}

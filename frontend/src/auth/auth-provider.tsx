import React from "react"
import { Auth0Provider } from "@auth0/auth0-react"

export const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN || ""
export const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID || ""
export const AUTH0_ENABLED = !!AUTH0_DOMAIN && !!AUTH0_CLIENT_ID

export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (!AUTH0_ENABLED) {
    return <>{children}</>
  }

  return (
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin + "/camera",
      }}
    >
      {children}
    </Auth0Provider>
  )
}

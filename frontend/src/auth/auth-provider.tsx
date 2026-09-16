import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react'

const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN
const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID

export const AUTH0_ENABLED = !!AUTH0_DOMAIN && !!AUTH0_CLIENT_ID

export const AuthProvider: React.FC<{children:React.ReactNode}> = ({children}) => {
  if (!AUTH0_ENABLED) return <>{children}</>

  const navigate = useNavigate()

  const onRedirectCallback = (appState:any) => {
    navigate((appState && appState.returnTo) || '/camera')
  }

  return (
    <Auth0Provider
      domain={AUTH0_DOMAIN as string}
      clientId={AUTH0_CLIENT_ID as string}
      authorizationParams={{redirect_uri: window.location.origin + '/camera'}}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  )
}

export default AuthProvider

import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID;
export const AUTH0_ENABLED = !!AUTH0_DOMAIN && !!AUTH0_CLIENT_ID;
export const AuthProvider = ({ children }) => {
    if (!AUTH0_ENABLED)
        return _jsx(_Fragment, { children: children });
    const navigate = useNavigate();
    const onRedirectCallback = (appState) => {
        navigate((appState && appState.returnTo) || '/camera');
    };
    return (_jsx(Auth0Provider, { domain: AUTH0_DOMAIN, clientId: AUTH0_CLIENT_ID, authorizationParams: { redirect_uri: window.location.origin + '/camera' }, onRedirectCallback: onRedirectCallback, children: children }));
};
export default AuthProvider;

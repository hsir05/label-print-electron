import * as React from "react";
import { createRoot } from 'react-dom/client';
import {
    createHashRouter,
    RouterProvider,
} from "react-router-dom";
import App from "./app";
import Main from "./pages/main";
import History from "./pages/history";
import Db from './pages/db'
import Record from './pages/record'
import Print from "./pages/print";
import Login from './pages/login'
import './index.less';

import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function AuthGuard({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const token = sessionStorage.getItem('token');

    const isLoggedIn = token ? true : false;

    useEffect(() => {
        if (!isLoggedIn && location.pathname !== '/login') {
            navigate('/login', {
                state: { from: location },
                replace: true
            });
        }
    }, [location, navigate, isLoggedIn]);

    return isLoggedIn ? children : null;
}

const container = document.getElementById('root');
const root = createRoot(container!);
const router = createHashRouter([
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/",
        // element: (
        //   <AuthGuard>
        //     <App />
        //   </AuthGuard>
        // ),
        element: (
            <App />
        ),

        children: [
            {
                path: "main",
                element: <Main />,
            },
            {
                path: "history",
                element: <History />,
            },
            {
                path: "db",
                element: <Db />,
            },
            {
                path: "record",
                element: <Record />,
            },
            {
                path: "print",
                element: <Print />,
            },
        ],
    },
]);

root.render(<RouterProvider router={router} />);
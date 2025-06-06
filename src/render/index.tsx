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
import Login from './pages/login'
import './index.less';


const container = document.getElementById('root');
const root = createRoot(container!);
const router = createHashRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <App />,
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
    ],
  },
]);

root.render(<RouterProvider router={router} />);
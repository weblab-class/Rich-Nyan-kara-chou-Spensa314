import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import NotFound from "./components/pages/NotFound";
import Login from "./components/pages/Login";
import Home from "./components/pages/Home";
import MultiPlayer_Start from "./components/pages/MultiPlayer_Start";
import SinglePlayer_Start from "./components/pages/SinglePlayer_Start";
import Leaderboard from "./components/pages/Leaderboard";
import MultiPlayer_Game from "./components/pages/MultiPlayer_Game";
import SinglePlayer_Game from "./components/pages/SinglePlayer_Game";
import SinglePlayer_Score_Summary from "./components/pages/SinglePlayer_Score_Summary";

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import { GoogleOAuthProvider } from "@react-oauth/google";

//TODO: REPLACE WITH YOUR OWN CLIENT_ID
const GOOGLE_CLIENT_ID = "556427429721-c6jrkk95p10b0491p13668k1agvv66oe.apps.googleusercontent.com";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route errorElement={<NotFound />} element={<App />}>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/room/:roomCode" element={<MultiPlayer_Start />} />
      <Route path="/solo" element={<SinglePlayer_Start />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/room/solo" element={<SinglePlayer_Start />} />
      <Route path="/game/:roomCode" element={<MultiPlayer_Game />} />
      <Route path="/game/solo" element={<SinglePlayer_Game />} />
      <Route path="/soloscore" element={<SinglePlayer_Score_Summary />} />
    </Route>
  )
);

// renders React Component "Root" into the DOM element with ID "root"
ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <RouterProvider router={router} />
  </GoogleOAuthProvider>
);

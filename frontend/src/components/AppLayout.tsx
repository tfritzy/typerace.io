import { Suspense } from "react";
import { Outlet, useMatch } from "react-router-dom";
import { Header } from "./Header";
import { XpAwardFeed } from "./XpAwardFeed";

export function AppLayout() {
  const isProfilePage = useMatch("/profile/:playerId");

  return (
    <div className="h-full flex flex-col">
      <Header hideAvatar={Boolean(isProfilePage)} />
      <XpAwardFeed />
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </div>
  );
}

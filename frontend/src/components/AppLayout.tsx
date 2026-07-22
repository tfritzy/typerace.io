import { Suspense } from "react";
import { Outlet, useMatch } from "react-router-dom";
import { Header } from "./Header";

export function AppLayout() {
  const isProfilePage = useMatch("/profile/:playerId");

  return (
    <div className="h-full flex flex-col">
      <Header hideAvatar={Boolean(isProfilePage)} />
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </div>
  );
}

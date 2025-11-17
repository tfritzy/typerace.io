import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const LobbyPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/game");
  }, [navigate]);

  return null;
};

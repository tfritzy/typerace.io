import { useEffect, useMemo, useState } from "react";
import { LogOut } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { EditNameModal } from "../components/EditNameModal";
import { ProfileActivity } from "../components/profile/ProfileActivity";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { ProfilePersonalRecords } from "../components/profile/ProfilePersonalRecords";
import { useDatabase } from "../contexts/SpacetimeContext";
import { useAuth } from "../firebase/AuthContext";
import { useProfileData } from "../hooks/useProfileData";
import { getDefaultSiteTitle, getLangHome } from "../utils/modes";
import { buildLanguagePersonalRecords } from "../utils/profileStats";

export function ProfilePage() {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const { conn } = useDatabase();
  const { signOut } = useAuth();
  const { player, gameRecords, personalRecords } = useProfileData(
    conn,
    playerId,
  );
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);

  const languageRecords = useMemo(
    () => buildLanguagePersonalRecords(personalRecords, gameRecords),
    [personalRecords, gameRecords],
  );
  const isOwnProfile = Boolean(
    conn?.identity && player && conn.identity.isEqual(player.identity),
  );

  useEffect(() => {
    if (player) document.title = `${player.name} - TypeRace.io`;
    return () => {
      document.title = getDefaultSiteTitle();
    };
  }, [player?.name]);

  useEffect(() => {
    if (player?.isAnonymous) navigate(getLangHome());
  }, [navigate, player?.isAnonymous]);

  const saveName = (name: string) => {
    if (!conn) return;
    conn.reducers.setPlayerName({ name });
    setIsEditNameModalOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate(getLangHome());
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!player) return <div className="min-h-0 flex-1" />;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-16 pt-5 sm:pt-8">
        <div className="content-container">
          <ProfileHeader
            player={player}
            canEdit={isOwnProfile}
            onEdit={() => setIsEditNameModalOpen(true)}
          />

          <div className="mt-4">
            <ProfilePersonalRecords groups={languageRecords} />
          </div>

          <ProfileActivity
            key={player.playerId}
            gameRecords={gameRecords}
          />

          {isOwnProfile && (
            <div className="mt-8 flex justify-center px-1">
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-sm text-muted-foreground transition-colors hover:text-destructive"
              >
                <LogOut aria-hidden size={15} strokeWidth={1.75} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </main>

      {isEditNameModalOpen && isOwnProfile && (
        <EditNameModal
          currentName={player.name}
          onSave={saveName}
          onClose={() => setIsEditNameModalOpen(false)}
        />
      )}
    </div>
  );
}

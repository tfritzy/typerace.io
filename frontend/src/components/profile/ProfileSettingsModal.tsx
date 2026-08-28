import { Image } from "lucide-react";
import { usePlayerSettings } from "../../hooks/usePlayerSettings";
import { getTranslations } from "../../utils/translations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Switch } from "../ui/switch";

interface ProfileSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileSettingsModal({
  open,
  onClose,
}: ProfileSettingsModalProps) {
  const t = getTranslations();
  const {
    useAuthenticationAvatar,
    setUseAuthenticationAvatar,
  } = usePlayerSettings();

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader className="mb-6">
          <DialogTitle>{t.profileSettings}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <Image
              aria-hidden
              className="mt-0.5 shrink-0 text-muted-foreground"
              size={18}
              strokeWidth={1.75}
            />
            <div>
              <div className="text-sm font-medium text-foreground">
                {t.useAuthenticationAvatar}
              </div>
              <p className="m-0 mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {t.authenticationAvatarDescription}
              </p>
            </div>
          </div>

          <Switch
            checked={useAuthenticationAvatar}
            onCheckedChange={setUseAuthenticationAvatar}
            aria-label={t.useAuthenticationAvatar}
            className="shrink-0"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

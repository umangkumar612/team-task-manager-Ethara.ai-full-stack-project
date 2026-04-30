import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveCallerUserProfile } from "../hooks/use-backend";

export default function ProfileSetupModal() {
  const [displayName, setDisplayName] = useState("");
  const { mutate: saveProfile, isPending } = useSaveCallerUserProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (!trimmed) return;
    saveProfile(
      { displayName: trimmed },
      {
        onSuccess: () =>
          toast.success("Profile saved! Welcome to Team Task Manager."),
        onError: () => toast.error("Failed to save profile. Please try again."),
      },
    );
  };

  return (
    <Dialog open>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        data-ocid="profile_setup.dialog"
      >
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-primary/10 p-3">
              <UserCircle className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center font-display text-xl">
            Set up your profile
          </DialogTitle>
          <DialogDescription className="text-center">
            Enter your display name to get started. This is how your teammates
            will see you.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              placeholder="e.g. Alex Johnson"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoFocus
              maxLength={50}
              data-ocid="profile_setup.input"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={!displayName.trim() || isPending}
            data-ocid="profile_setup.submit_button"
          >
            {isPending ? "Saving..." : "Continue to Dashboard"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

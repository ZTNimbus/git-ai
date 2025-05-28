"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import useProject from "~/hooks/use-project";

function InviteButton() {
  const { projectId } = useProject();
  const [open, setOpen] = useState(false);

  if (!projectId) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Members</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-500">
            Share this link with your members to invite them
          </p>

          <Input
            readOnly
            className="mt-4"
            value={`${window.location.origin}/join/${projectId}`}
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/join/${projectId}`,
              );

              toast.success("Copied to clipboard");
            }}
          />
        </DialogContent>
      </Dialog>

      <Button
        size="sm"
        variant="outline"
        className="cursor-pointer"
        onClick={() => setOpen(true)}
      >
        Invite Members
      </Button>
    </>
  );
}

export default InviteButton;

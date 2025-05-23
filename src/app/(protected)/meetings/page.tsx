"use client";

import useProject from "~/hooks/use-project";
import { api } from "~/trpc/react";
import MeetingCard from "../dashboard/meeting-card";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Trash } from "lucide-react";
import { toast } from "sonner";
import useRefetch from "~/hooks/use-refetch";

function Meetings() {
  const { projectId } = useProject();
  const refetch = useRefetch();
  const deleteMeeting = api.project.deleteMeeting.useMutation();
  const { data: meetings, isLoading } = api.project.getMeetings.useQuery(
    {
      projectId,
    },
    { refetchInterval: 4000 },
  );
  return (
    <>
      <MeetingCard />
      <div className="h-6"></div>

      <h1 className="text-xl font-semibold">Meetings</h1>
      {meetings && meetings.length === 0 && <div>No meetings found</div>}
      {isLoading && <div>Loading...</div>}

      <ul className="divide-y divide-gray-200">
        {meetings?.map((meeting) => (
          <li
            key={meeting.id}
            className="flex items-center justify-between gap-x-6 py-5"
          >
            <div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`meetings/${meeting.id}`}
                    className="text-sm font-semibold"
                  >
                    {meeting.name}
                  </Link>

                  {meeting.status === "PROCESSING" && (
                    <Badge className="bg-yellow-500 text-white">
                      Processing
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-x-2 text-xs text-gray-500">
                <p className="whitespace-nowrap">
                  {meeting.createdAt.toString()}
                </p>

                <p className="truncate">{meeting.issues.length} issues</p>
              </div>
            </div>

            <div className="flex flex-none items-center gap-x-4">
              <Link href={`meetings/${meeting.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={deleteMeeting.isPending}
                  className="cursor-pointer"
                >
                  View meeting
                </Button>
              </Link>
              <Button
                disabled={deleteMeeting.isPending}
                size="sm"
                className="cursor-pointer hover:opacity-80"
                variant="destructive"
                onClick={() =>
                  deleteMeeting.mutate(
                    {
                      meetingId: meeting.id,
                    },
                    {
                      onSuccess: () => {
                        toast.success("Successfully deleted meeting");
                        refetch();
                      },
                    },
                  )
                }
              >
                <Trash />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

export default Meetings;

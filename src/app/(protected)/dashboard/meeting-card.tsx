"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Presentation, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import useProject from "~/hooks/use-project";
import { uploadFile } from "~/lib/firebase";
import { api } from "~/trpc/react";

function MeetingCard() {
  const [progress, setProgress] = useState(0);
  const { project } = useProject();
  const router = useRouter();
  const processMeeting = useMutation({
    mutationFn: async (data: {
      meetingUrl: string;
      meetingId: string;
      projectId: string;
    }) => {
      const { meetingId, meetingUrl, projectId } = data;

      const response = await axios.post("/api/process-meeting", {
        meetingUrl,
        meetingId,
        projectId,
      });

      return response.data;
    },
  });
  const [isUploading, setIsUploading] = useState(false);
  const uploadMeeting = api.project.uploadMeeting.useMutation();
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a"],
    },
    multiple: false,
    maxSize: 50_000_000,
    onDrop: async (acceptedFiles) => {
      console.log(acceptedFiles);
      setIsUploading(true);
      const file = acceptedFiles[0];
      if (!file) return;

      const downloadUrl = (await uploadFile(
        file as File,
        setProgress,
      )) as string;

      uploadMeeting.mutate(
        {
          projectId: project.id,
          meetingUrl: downloadUrl,
          name: file.name,
        },
        {
          onSuccess: (meeting) => {
            toast.success("Successfully uploaded meeting");
            router.push("/meetings");
            processMeeting.mutateAsync({
              meetingUrl: downloadUrl,
              meetingId: meeting.id,
              projectId: project.id,
            });
          },

          onError: () => toast.error("Meeting upload failed"),
        },
      );
      setIsUploading(false);
    },
  });

  return (
    <Card
      className="col-span-2 flex flex-col items-center justify-center"
      {...getRootProps()}
    >
      {!isUploading && (
        <>
          <Presentation className="text-primary mt-1 size-8 animate-bounce" />

          <h3 className="text-sm font-semibold text-gray-900">
            Create a new meeting
          </h3>

          <p className="text-center text-sm text-gray-500">
            Analyse your meeting with GitAI.
            <br />
            Powered by AI.
          </p>

          <div className="">
            <Button disabled={isUploading} className="cursor-pointer">
              <Upload className="mr-1.5 -ml-0.5 size-5" aria-hidden={true} />
              Upload Meeting
              <input className="hidden" {...getInputProps()} />
            </Button>
          </div>
        </>
      )}

      {isUploading && (
        <div className="flex flex-col items-center">
          <CircularProgressbar
            styles={buildStyles({
              pathColor: "#000",
              textColor: "#000",
              trailColor: "#000",
            })}
            value={progress}
            text={`${progress}%`}
            className="size-20"
          />

          <p className="text-sm text-gray-500">Uploading your meeting...</p>
        </div>
      )}
    </Card>
  );
}

export default MeetingCard;

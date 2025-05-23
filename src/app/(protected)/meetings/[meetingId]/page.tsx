import IssuesList from "./issues-list";

type Props = {
  params: Promise<{ meetingId: string }>;
};

async function MeetingDetails({ params }: Props) {
  const { meetingId } = await params;
  return <IssuesList meetingId={meetingId} />;
}

export default MeetingDetails;

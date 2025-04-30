import InterviewSchedulePage from "../interview-schedule-page"

export default function Page({ params }: { params: { id: string } }) {
  return <InterviewSchedulePage params={params} />
}

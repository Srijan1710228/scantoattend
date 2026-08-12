import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AttendanceRedirectPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token;
  if (token && typeof token === "string") {
    redirect(`/attendance-form?token=${encodeURIComponent(token)}`);
  } else {
    redirect("/attendance-form");
  }
}

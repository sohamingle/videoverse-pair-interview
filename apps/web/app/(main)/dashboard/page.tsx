import DemosDisplay from "@/components/dashboard/demos-display";
import { getSession } from "@/utils/auth";
import { redirect } from "next/navigation";

const DashboardPage = async () => {
  const session = await getSession();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <div>
      Dashboard Page
      <DemosDisplay />
    </div>
  );
};

export default DashboardPage;

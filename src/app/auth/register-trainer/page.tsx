import { prisma } from "@/lib/prisma";
import RegisterTrainerForm from "./RegisterTrainerForm";

export default async function RegisterTrainerPage() {
  const sports = await prisma.sport.findMany({
    orderBy: { name: "asc" },
  });

  return <RegisterTrainerForm sports={sports} />;
}

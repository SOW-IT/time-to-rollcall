import PrivateLayout from "@/components/PrivateLayout";
import PrivateLayoutGroup from "@/components/PrivateLayoutGroup";

export default function PagesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { groupId: string };
}) {
  return (
    <PrivateLayout>
      <PrivateLayoutGroup params={params}>{children}</PrivateLayoutGroup>
    </PrivateLayout>
  );
}

import UserHeader from "@/components/UserHeader";

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <UserHeader />
      <div className="pt-16 min-h-screen">{children}</div>
    </>
  );
}

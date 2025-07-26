export default function MediaPickerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Don't override root layout - just return children
  return <>{children}</>;
}
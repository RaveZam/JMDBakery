export function ChartMessage({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

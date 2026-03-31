const CardSkeleton = () => (
  <div className="rounded-2xl border border-border/50 bg-card p-4 animate-pulse">
    <div className="aspect-[4/3] bg-muted rounded-xl mb-4" />
    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
    <div className="h-3 bg-muted rounded w-1/2" />
  </div>
);

export default CardSkeleton;
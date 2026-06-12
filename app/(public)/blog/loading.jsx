export default function BlogListLoading() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-7xl">
      <div className="space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="flex flex-col gap-4">
            <div className="aspect-video rounded-3xl bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
              <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col gap-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="aspect-[4/3] w-64 rounded-3xl bg-muted animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
                  <div className="h-5 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

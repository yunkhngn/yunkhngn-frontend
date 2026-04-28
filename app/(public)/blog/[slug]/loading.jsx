export default function BlogPostLoading() {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center gap-4 max-w-3xl">
      <div
        className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin"
        aria-hidden
      />
      <p className="text-sm text-muted-foreground">Đang tải bài viết…</p>
    </div>
  );
}

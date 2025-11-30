import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

export function BlogCard({ blog }) {
    return (
        <Link href={`/blog/${blog.slug}`}>
            <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 cursor-pointer group">
                <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted relative">
                    {blog.thumbnail ? (
                        <img
                            src={blog.thumbnail}
                            alt={blog.title}
                            className="object-cover w-full h-full transition-transform group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            No Thumbnail
                        </div>
                    )}
                </div>
                <CardHeader>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {blog.tags && JSON.parse(blog.tags).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                        {blog.title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm line-clamp-3">
                        {/* Simple excerpt generation if not provided */}
                        {blog.excerpt || 'Click to read more...'}
                    </p>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    {blog.createdAt && format(new Date(blog.createdAt), 'MMM dd, yyyy')}
                </CardFooter>
            </Card>
        </Link>
    );
}

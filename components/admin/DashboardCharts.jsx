
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, AreaChart, Area, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { PieChart as PieChartIcon, TrendingUp, BarChart3 } from "lucide-react";

export default function DashboardCharts({ stats, theme, activityData }) {
    const isDark = theme === 'dark';

    const contentData = [
        { name: 'Blogs', value: stats.blogs, color: isDark ? '#f5f5f5' : '#171717' },
        { name: 'Projects', value: stats.projects, color: isDark ? '#d4d4d4' : '#525252' },
        { name: 'Photos', value: stats.gallery, color: isDark ? '#a3a3a3' : '#737373' }
    ];

    const blogStatusData = [
        { name: 'Published', value: stats.blogsPublished, color: isDark ? '#f5f5f5' : '#171717' },
        { name: 'Draft', value: stats.blogsDraft, color: isDark ? '#d4d4d4af' : '#525252' }
    ];

    return (
        <Card className="h-full flex flex-col border-none shadow-none bg-transparent p-0 gap-0">
            <CardHeader className="flex-none px-4 pt-0 pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Activity & Metrics
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
                <Tabs defaultValue="timeline" className="h-full flex flex-col">
                    <TabsList className="flex-none grid w-full grid-cols-3 bg-muted/50">
                        <TabsTrigger value="timeline" className="text-xs">Timeline</TabsTrigger>
                        <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
                        <TabsTrigger value="status" className="text-xs">Status</TabsTrigger>
                    </TabsList>

                    <div className="flex-1 min-h-0 mt-4 bg-card border rounded-xl p-4">
                        <TabsContent value="timeline" className="h-full mt-0 focus-visible:ring-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={activityData}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={isDark ? "#f5f5f5" : "#171717"} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={isDark ? "#f5f5f5" : "#171717"} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#404040" : "#e5e5e5"} vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke={isDark ? "#a3a3a3" : "#737373"}
                                        style={{ fontSize: '10px' }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke={isDark ? "#a3a3a3" : "#737373"}
                                        style={{ fontSize: '10px' }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: isDark ? '#171717' : '#ffffff',
                                            border: `1px solid ${isDark ? '#404040' : '#e5e5e5'}`,
                                            borderRadius: '8px',
                                            fontSize: '12px'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        stroke={isDark ? "#f5f5f5" : "#171717"}
                                        fillOpacity={1}
                                        fill="url(#colorTotal)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </TabsContent>

                        <TabsContent value="content" className="h-full mt-0 focus-visible:ring-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={contentData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius="80%"
                                        innerRadius="60%"
                                        fill="#8884d8"
                                        dataKey="value"
                                        paddingAngle={5}
                                    >
                                        {contentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </TabsContent>

                        <TabsContent value="status" className="h-full mt-0 focus-visible:ring-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={blogStatusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius="80%"
                                        innerRadius="60%"
                                        fill="#8884d8"
                                        dataKey="value"
                                        paddingAngle={5}
                                    >
                                        {blogStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </TabsContent>
                    </div>
                </Tabs>
            </CardContent>
        </Card>
    );
}

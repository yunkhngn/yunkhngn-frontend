
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, AreaChart, Area, LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PieChart as PieChartIcon, TrendingUp, BarChart3, Activity } from "lucide-react";
import { format } from "date-fns";

export default function DashboardCharts({ stats, theme, analyticsData, analyticsPeriod, activityData }) {
    const isDark = theme === 'dark';

    const contentData = [
        { name: 'Blogs', value: stats.blogs, color: isDark ? '#f5f5f5' : '#171717' },      // light: gray-100, dark: gray-900
        { name: 'Projects', value: stats.projects, color: isDark ? '#d4d4d4' : '#525252' }, // light: gray-300, dark: gray-600
        { name: 'Photos', value: stats.gallery, color: isDark ? '#a3a3a3' : '#737373' }     // light: gray-400, dark: gray-500
    ];

    const blogStatusData = [
        { name: 'Published', value: stats.blogsPublished, color: isDark ? '#f5f5f5' : '#171717' }, // light: gray-100, dark: gray-900
        { name: 'Draft', value: stats.blogsDraft, color: isDark ? '#d4d4d4af' : '#525252' }          // light: gray-300, dark: gray-600
    ];

    return (
        <div className="space-y-8">
            {/* Analytics Section */}
            {analyticsData && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Web Analytics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="p-4 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">Total Requests</p>
                                <p className="text-2xl font-bold">{analyticsData.totals.requests.toLocaleString()}</p>
                            </div>
                            <div className="p-4 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">Data Transfer</p>
                                <p className="text-2xl font-bold">{(analyticsData.totals.bytes / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <div className="p-4 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">Page Views</p>
                                <p className="text-2xl font-bold">{analyticsData.totals.pageViews.toLocaleString()}</p>
                            </div>
                            <div className="p-4 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">Threats Blocked</p>
                                <p className="text-2xl font-bold">{analyticsData.totals.threats.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={analyticsData.chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#404040" : "#e5e5e5"} />
                                    <XAxis
                                        dataKey="time"
                                        tickFormatter={(time) => format(new Date(time), analyticsPeriod === '24h' ? 'HH:mm' : 'MMM dd')}
                                        stroke={isDark ? "#a3a3a3" : "#737373"}
                                        style={{ fontSize: '12px' }}
                                    />
                                    <YAxis
                                        stroke={isDark ? "#a3a3a3" : "#737373"}
                                        style={{ fontSize: '12px' }}
                                    />
                                    <Tooltip
                                        labelFormatter={(label) => format(new Date(label), 'MMM dd, HH:mm')}
                                        contentStyle={{
                                            backgroundColor: isDark ? '#171717' : '#ffffff',
                                            border: `1px solid ${isDark ? '#404040' : '#e5e5e5'}`,
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="requests" stroke="#8884d8" name="Requests" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="pageViews" stroke="#82ca9d" name="Page Views" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {/* Content Distribution Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChartIcon className="h-5 w-5" />
                            Content Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={contentData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {contentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Blog Status Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Blog Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={blogStatusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {blogStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Timeline Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Activity Timeline (Last 7 Days)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activityData}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={isDark ? "#f5f5f5" : "#171717"} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={isDark ? "#f5f5f5" : "#171717"} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#404040" : "#e5e5e5"} />
                                <XAxis
                                    dataKey="date"
                                    stroke={isDark ? "#a3a3a3" : "#737373"}
                                    style={{ fontSize: '12px' }}
                                />
                                <YAxis
                                    stroke={isDark ? "#a3a3a3" : "#737373"}
                                    style={{ fontSize: '12px' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? '#171717' : '#ffffff',
                                        border: `1px solid ${isDark ? '#404040' : '#e5e5e5'}`,
                                        borderRadius: '8px'
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
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

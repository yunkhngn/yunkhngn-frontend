import AdminLayout from "@/components/template/Admin/Layout";

export default function Dashboard() {
  return (
    <AdminLayout title="Dashboard">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Blogs</h3>
          </div>
          <div className="text-2xl font-bold">0</div>
        </div>
        <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Projects</h3>
          </div>
          <div className="text-2xl font-bold">0</div>
        </div>
        <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Gallery Images</h3>
          </div>
          <div className="text-2xl font-bold">0</div>
        </div>
      </div>
    </AdminLayout>
  );
}
// yunkhngn-fe/app/(tools)/tools/page.jsx
import ToolsClient from './ToolsClient';

export const metadata = {
  title: 'Tools | yunkhngn.dev',
  description: 'Những công cụ nhỏ cho cuộc sống hàng ngày.',
};

export default function ToolsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1">Tools</h1>
        <p className="text-sm text-muted-foreground">
          Những công cụ nhỏ cho cuộc sống hàng ngày.
        </p>
      </div>
      <ToolsClient />
    </div>
  );
}

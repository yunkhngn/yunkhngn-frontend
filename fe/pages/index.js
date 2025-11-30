import { DefaultFooter, DefaultNavbar } from "@/components/template";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-sans">
      <DefaultNavbar />
      <main className="flex-1 flex flex-col items-center justify-center p-8 sm:p-20">
      </main>
      <DefaultFooter />
    </div>
  );
}

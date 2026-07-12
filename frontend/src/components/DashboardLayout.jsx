import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50/60">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 w-full max-w-8xl">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}

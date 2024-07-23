import { Sidebar } from "@/components/sidebar/index";

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <div className="flex max-w-4xl min-h-[calc(100%-11rem)] sm:min-h-[calc(100%-14rem)] mx-auto overflow-auto">
      <Sidebar />
      {children}
    </div>
  );
}

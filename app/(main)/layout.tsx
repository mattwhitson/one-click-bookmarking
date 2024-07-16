import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar/index";

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <div className="flex max-w-4xl min-h-[calc(100%-5rem)] mx-auto">
      <Sidebar />
      {children}
    </div>
  );
}

import { ToasterProvider } from "../../../providers/toast-provider";
import Navbar from "./Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToasterProvider />
      <Navbar />
      <main className="m-auto max-w-7xl p-4">{children}</main>
    </>
  );
}

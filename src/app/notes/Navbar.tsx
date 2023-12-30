import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  return (
    <div className="p-4 shadow">
      <div className="m-auto  flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <Link href="/notes" className="flex items-center gap-1">
          <Image src="/logo.png" alt="Note Chat logo" width={40} height={40} />
          <span className="font-bold">ChatNote</span>
        </Link>
        <span>El 2</span>
      </div>
    </div>
  );
};

export default Navbar;

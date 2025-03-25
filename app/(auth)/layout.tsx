import { Logo } from "@/components/universal/logo";
import Link from "next/link";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full h-fit items-start justify-start flex flex-col">
      <header className="w-full h-14 items-center justify-between flex px-5 md:px-7 py-3">
        <Link href="/" className="h-full">
          <Logo variant={"black"} />
        </Link>
      </header>
      {children}
    </div>
  );
};

export default AuthLayout;

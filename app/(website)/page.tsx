import { createClient } from "@/utils/supabase/server";
import { HeroSuppliers } from "./_components/hero-suppliers";
import { cookies } from "next/headers";
import { Section2 } from "./_components/section2";
import { FullpageScroll } from "@/components/universal/smooth-scroll-wrapper";
import { Section3 } from "./_components/section3";
import { Section4 } from "./_components/section4";
import { Section5 } from "./_components/section5";
import { Section6 } from "./_components/section6";
import { Section7 } from "./_components/section7";
import { Section8 } from "./_components/section8";
import { HeaderWebsite } from "@/components/universal/website/header-website";
import FooterWebsite from "@/components/universal/website/footer";

const MarketingPage = async () => {
  const supabase = createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: userBusiness, error } = await supabase
    .from("provider_business_users")
    .select("*, business:provider_business(*)")
    .eq("user_id", user?.id);

  return (
    <main className="w-full h-fit items-start justify-start flex flex-col">
      <HeaderWebsite userBusinesses={userBusiness} user={user} />
      <HeroSuppliers user={user} userBusiness={userBusiness} />
      <Section2 user={user} />
      <FullpageScroll>
        <Section3 user={user} />
        <Section4 user={user} />
        <Section5 user={user} />
        <Section6 user={user} />
        <Section7 user={user} />
      </FullpageScroll>
      <Section8 user={user} />
      <FooterWebsite />
    </main>
  );
};

export default MarketingPage;

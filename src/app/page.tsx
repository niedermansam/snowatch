
import { type NextPage } from "next";
// import { signIn, signOut, useSession } from "next-auth/react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SnoWatch | Find Your Next Powder Day",
  description:  "SnoWatch is here to help backcountry skiers and riders find the best snow conditions for their next adventure.",
};

const Home: NextPage = () => {

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <h1 className="text-7xl font-extrabold text-white">Welcome to SnoWatch</h1>
      </main>
    </>
  );
};

export default Home;

/* const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();



  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
 */
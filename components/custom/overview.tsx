import { motion } from "framer-motion";
import Link from "next/link";

import { MessageIcon, LogoGoogle } from "./icons";
import { AuroraText } from "@/components/ui/aurora-text";
import { Github } from "lucide-react";

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-[500px] mt-20 mx-4 md:mx-0"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="border-none bg-muted/50 rounded-2xl p-6 flex flex-col gap-4 text-zinc-500 text-sm dark:text-zinc-400 dark:border-zinc-700">
        <p className="flex flex-row justify-center gap-4 items-center text-zinc-900 dark:text-zinc-50">
          <LogoGoogle />
          <span>+</span>
          <MessageIcon />
        </p>
        <p className="text-accent-foreground">
          <div className="flex justify-center items-center">
            <div className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r bg-clip-text">
              <AuroraText>Hello !</AuroraText>
              <br />
            </div>
          </div>
          Welcome to{" "}
          <code className="rounded-sm bg-muted-foreground/15 px-1.5 py-0.5">
            FuturEd Ai
          </code>{" "}
          .Your one stop academic supporter.
          <br />
          <div className="text-center">
            Developed with{" "}
            <code className="rounded-sm bg-muted-foreground/15 px-1.5 py-0.5">
              ♡
            </code>{" "}
            by FuturEd Devs.
          </div>
        </p>
        <p className="text-accent-foreground text-center flex items-center justify-center gap-1">
          You can leave a star atleast🥺!{" "}
          <Link
            className="text-blue-500 dark:text-blue-400 flex items-center gap-1"
            href="https://github.com/Preet121106/FuturEd-Ai.git"
            target="_blank"
          >
            <Github size={16} />GitHub
          </Link>
          .
        </p>
      </div>
    </motion.div>
  );
};

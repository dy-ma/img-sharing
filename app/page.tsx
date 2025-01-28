import { Button } from "@/components/ui/button";
import { Code, LogIn, Table } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-6xl">ImgShare</h1>
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li><span className="font-semibold">Organize & Share</span>: Upload and share image sets effortlessly.</li>
          <li><span className="font-semibold">Quick Access</span>: Fast, reliable access from any device.</li>
          <li><span className="font-semibold">Private</span>: Auto-delete sets after 14 days.</li>
          <li><span className="font-semibold">Easy Sharing</span>: Share links or QR codes in seconds.</li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Button asChild>
            <Link href="/dashboard">
              <Table className="h-5 w-5" />
              Go to Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link
              href="/login"
            >
              <LogIn className="h-5 w-5" />
              Log in
            </Link>
          </Button>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://github.com/dy-ma/img-sharing"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Code className="w-4 h-4" />
          See source on Github
        </a>
      </footer>
    </div>
  );
}

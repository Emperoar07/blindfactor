import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center h-full flex-1 justify-center bg-[#fdf8f2]">
      <div className="text-center px-6 py-16">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#c45c2e] mb-3">404</p>
        <h1 className="text-5xl font-bold text-[#1a1208] mb-3" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
          Page not found
        </h1>
        <p className="text-sm text-[#6b5b4e] mb-8 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className="bf-btn-primary px-8 py-3 text-sm">
          Go home
        </Link>
      </div>
    </div>
  );
}

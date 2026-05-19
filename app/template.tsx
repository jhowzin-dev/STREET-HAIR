"use client";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-transition-subtle">
      {children}
    </div>
  );
}

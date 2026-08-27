export function TrustedSection() {
  return (
    <section className="border-y bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Built for developers who work with real codebases
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm font-medium text-muted-foreground/70">
          <span>GitHub</span>
          <span>Spring Boot</span>
          <span>React</span>
          <span>Next.js</span>
          <span>Python</span>
          <span>TypeScript</span>
          <span>PostgreSQL</span>
        </div>
      </div>
    </section>
  );
}
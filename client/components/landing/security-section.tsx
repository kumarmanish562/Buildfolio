"use client";

import { ShieldCheck, LockKeyhole, UserCheck, ServerCog } from "lucide-react";

const items = [
  {
    icon: UserCheck,
    title: "GitHub OAuth",
    description:
      "Authenticate through GitHub instead of managing another password.",
  },
  {
    icon: LockKeyhole,
    title: "Protected workspace",
    description:
      "Repository and chat operations are scoped to the authenticated user.",
  },
  {
    icon: ServerCog,
    title: "Backend authorization",
    description:
      "API access is protected at the application layer rather than relying only on the UI.",
  },
];

export function SecuritySection() {
  return (
    <section id="security" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border bg-card p-8 shadow-xl sm:p-12 lg:p-16">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="size-6" />
              </div>

              <h2 className="mt-6 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Your code stays inside your workspace.
              </h2>

              <p className="mt-4 leading-7 text-muted-foreground">
                BuildFolio is designed around authenticated access and
                repository-level isolation.
              </p>
            </div>

            <div className="grid gap-4">
              {items.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex gap-4 rounded-2xl border border-dashed p-5"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                      <Icon className="size-5 text-primary" />
                    </div>

                    <div>
                      <h3 className="font-semibold">{item.title}</h3>

                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
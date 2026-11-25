"use client";

import React, { useState, useEffect } from "react";
import {
  Network,
  Server,
  Database,
  Globe,
  Radio,
  ExternalLink,
  Shield,
  Zap,
} from "lucide-react";
import { MicroserviceTopologyResponse, ServiceNode, api } from "@/lib/api";

interface MicroservicesTopologyProps {
  username: string;
  initialData?: MicroserviceTopologyResponse;
}

export function MicroservicesTopology({ username, initialData }: MicroservicesTopologyProps) {
  const [data, setData] = useState<MicroserviceTopologyResponse | null>(initialData ?? null);
  const [loading, setLoading] = useState(!initialData);
  const [activeNode, setActiveNode] = useState<ServiceNode | null>(null);

  useEffect(() => {
    if (!initialData) {
      api
        .getMicroserviceTopology(username)
        .then(setData)
        .catch((err) => console.error("Failed to load topology", err))
        .finally(() => setLoading(false));
    }
  }, [username, initialData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Network className="h-8 w-8 animate-pulse text-primary mb-3" />
        <p className="text-sm font-medium">Assembling cross-repository system topology...</p>
      </div>
    );
  }

  if (!data || data.services.length === 0) {
    return null;
  }

  const clients = data.services.filter((s) => s.role === "CLIENT_WEB");
  const gateways = data.services.filter((s) => s.role === "GATEWAY");
  const coreServices = data.services.filter((s) => s.role === "CORE_SERVICE");
  const dataStores = data.services.filter((s) => s.role === "DATA_STORE");

  const getNodeIcon = (role: string) => {
    switch (role) {
      case "CLIENT_WEB":
        return <Globe className="h-4 w-4 text-sky-500" />;
      case "GATEWAY":
        return <Shield className="h-4 w-4 text-emerald-500" />;
      case "DATA_STORE":
        return <Database className="h-4 w-4 text-amber-500" />;
      default:
        return <Server className="h-4 w-4 text-indigo-500" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "CLIENT_WEB":
        return "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30";
      case "GATEWAY":
        return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "DATA_STORE":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
      default:
        return "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30";
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card/90 to-card/50 p-6 md:p-8 shadow-xl backdrop-blur-sm transition-all">
      {/* Background glow */}
      <div className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30 mb-2">
            <Network className="h-3.5 w-3.5" />
            <span>Distributed System Architecture</span>
          </div>
          <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">
            Multi-Repository Microservice Topology
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            End-to-end service relationship map linking client frontends, security gateways, domain services, and vector data stores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-xl border bg-muted/40 px-3 py-1.5 text-xs font-bold">
            <Zap className="h-3.5 w-3.5 text-emerald-500" />
            {data.totalServices} Network Nodes
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-xl border bg-muted/40 px-3 py-1.5 text-xs font-bold">
            <Radio className="h-3.5 w-3.5 text-primary animate-pulse" />
            {data.connections.length} Protocol Links
          </span>
        </div>
      </div>

      {/* Visual Tiers Pipeline */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
        {/* Tier 1: Client Frontends */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Globe className="h-3.5 w-3.5 text-sky-500" />
            <span>1. Client Apps</span>
          </div>
          <div className="space-y-3">
            {clients.map((node) => (
              <div
                key={node.id}
                onClick={() => setActiveNode(node)}
                className={`group cursor-pointer rounded-xl border p-3.5 transition-all ${
                  activeNode?.id === node.id
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-border/70 bg-card/60 hover:border-border hover:bg-card"
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    {getNodeIcon(node.role)}
                    <span className="text-xs font-bold text-foreground">{node.name}</span>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground line-clamp-2">
                  {node.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {node.protocols.map((proto, pIdx) => (
                    <span
                      key={pIdx}
                      className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[9px] font-mono text-sky-600 dark:text-sky-400"
                    >
                      {proto}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier 2: Edge Gateways */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-emerald-500" />
            <span>2. Edge & Gateway</span>
          </div>
          <div className="space-y-3">
            {gateways.map((node) => (
              <div
                key={node.id}
                onClick={() => setActiveNode(node)}
                className={`group cursor-pointer rounded-xl border p-3.5 transition-all ${
                  activeNode?.id === node.id
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-border/70 bg-card/60 hover:border-border hover:bg-card"
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    {getNodeIcon(node.role)}
                    <span className="text-xs font-bold text-foreground">{node.name}</span>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground line-clamp-2">
                  {node.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {node.protocols.map((proto, pIdx) => (
                    <span
                      key={pIdx}
                      className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-mono text-emerald-600 dark:text-emerald-400"
                    >
                      {proto}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier 3: Core Domain Services */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Server className="h-3.5 w-3.5 text-indigo-500" />
            <span>3. Domain Services ({coreServices.length})</span>
          </div>
          <div className="space-y-3">
            {coreServices.map((node) => (
              <div
                key={node.id}
                onClick={() => setActiveNode(node)}
                className={`group cursor-pointer rounded-xl border p-3.5 transition-all ${
                  activeNode?.id === node.id
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-border/70 bg-card/60 hover:border-border hover:bg-card"
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    {getNodeIcon(node.role)}
                    <span className="text-xs font-bold text-foreground line-clamp-1">{node.name}</span>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground line-clamp-2">
                  {node.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {node.protocols.map((proto, pIdx) => (
                    <span
                      key={pIdx}
                      className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[9px] font-mono text-indigo-600 dark:text-indigo-400"
                    >
                      {proto}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier 4: Storage & Vectors */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Database className="h-3.5 w-3.5 text-amber-500" />
            <span>4. Storage & Vectors</span>
          </div>
          <div className="space-y-3">
            {dataStores.map((node) => (
              <div
                key={node.id}
                onClick={() => setActiveNode(node)}
                className={`group cursor-pointer rounded-xl border p-3.5 transition-all ${
                  activeNode?.id === node.id
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-border/70 bg-card/60 hover:border-border hover:bg-card"
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    {getNodeIcon(node.role)}
                    <span className="text-xs font-bold text-foreground">{node.name}</span>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground line-clamp-2">
                  {node.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {node.protocols.map((proto, pIdx) => (
                    <span
                      key={pIdx}
                      className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-mono text-amber-600 dark:text-amber-400"
                    >
                      {proto}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Node Inspector Drawer */}
      {activeNode && (
        <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${getRoleBadge(activeNode.role)}`}>
                {activeNode.role}
              </span>
              <h4 className="text-sm font-bold text-foreground">{activeNode.name}</h4>
              <span className="text-xs text-muted-foreground font-mono">({activeNode.language})</span>
            </div>

            {activeNode.repositoryUrl && (
              <a
                href={activeNode.repositoryUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-semibold"
              >
                <span>View Repository</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{activeNode.description}</p>
        </div>
      )}
    </div>
  );
}

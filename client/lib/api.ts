export type IndexStatus =
  | "PENDING"
  | "INDEXING"
  | "READY"
  | "FAILED";

export type User = {
  id: string;
  githubId: number;
  githubUsername: string;
  displayName: string;
  avatarUrl: string | null;
};

export type Repository = {
  id: string;
  githubRepoId: number;
  owner: string;
  name: string;
  fullName: string;
  isPrivate: boolean;
  defaultBranch: string;
  language: string | null;
  htmlUrl: string | null;
  description: string | null;
  indexStatus: IndexStatus;
  indexedAt: string | null;
  chunkCount: number;
  filesTotal: number;
  filesProcessed: number;
  errorMessage: string | null;
};

export type IndexStatusResponse = {
  repositoryId?: string;
  indexStatus: IndexStatus;
  filesTotal: number;
  filesProcessed: number;
  chunkCount: number;
  indexedAt: string | null;
  errorMessage: string | null;
};

export type ChatSession = {
  id: string;
  repositoryId: string;
  title: string;
  createdAt: string;
};

export type MessageRole = "USER" | "ASSISTANT";

export type Citation = {
  filePath: string;
  startLine: number | null;
  endLine: number | null;
  language: string | null;
};

export type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
  citations: Citation[];
  createdAt: string;
};

export type HealthResponse = {
  status: string;
  timestamp?: string;
};

export type TechStackCategory = {
  category: string;
  items: string[];
};

export type Portfolio = {
  id: string;
  repositoryId: string;
  repositoryName: string;
  repositoryFullName: string;
  repositoryHtmlUrl: string;
  title: string;
  summary: string;
  techStack: string; // JSON array string of TechStackCategory
  architectureOverview: string;
  mermaidDiagram: string | null;
  keyFeatures: string; // JSON array string of strings
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PublicProfile = {
  githubUsername: string;
  displayName: string;
  avatarUrl: string | null;
  githubUrl: string;
  memberSince: string;
  publicProjectCount: number;
  averageSecurityScore: number | null;
  aggregatedTechStack: string[];
  portfolios: Portfolio[];
};

export type CreatePullRequestResponse = {
  pullRequestUrl: string;
  pullRequestNumber: number;
  branchName: string;
  message: string;
};

export type Vulnerability = {
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  description: string;
  remediation: string;
};

export type FixVulnerabilityRequest = {
  vulnerabilityTitle: string;
  vulnerabilityDescription: string;
  remediation?: string;
};

export type FixVulnerabilityResponse = {
  pullRequestUrl: string;
  pullRequestNumber: number;
  branchName: string;
  filePath: string;
  explanation: string;
};

export type RepoComparisonItem = {
  repositoryId: string;
  name: string;
  fullName: string;
  language: string;
  indexStatus: string;
  filesCount: number;
  chunkCount: number;
  portfolioTitle: string;
  architectureSummary: string;
  techStackCategories: string[];
  securityScore: number | null;
  securityRiskLevel: string;
};

export type RepoComparisonResponse = {
  repositories: RepoComparisonItem[];
  crossArchitectureSummary: string;
};

export type SecurityAudit = {
  id: string;
  repositoryId: string;
  overallScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  summary: string;
  vulnerabilities: string; // JSON array string of Vulnerability
  recommendations: string; // JSON array string of strings
  createdAt: string;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080"
  );
}

export function getGithubLoginUrl() {
  return `${getApiBaseUrl()}/oauth2/authorization/github`;
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return (
      data.message ??
      data.error ??
      data.detail ??
      res.statusText ??
      "Request failed"
    );
  } catch {
    return res.statusText || "Request failed";
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new ApiError(res.status, await parseError(res));
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export const api = {
  /* ================= AUTH ================= */

  me: () => apiFetch<User>("/api/auth/me"),

  logout: () =>
    apiFetch<void>("/api/auth/logout", {
      method: "POST",
    }),

  /* ================= REPOSITORIES ================= */

  listRepos: (refresh = true) =>
    apiFetch<Repository[]>(`/api/repos?refresh=${refresh}`),

  getRepo: (id: string) => apiFetch<Repository>(`/api/repos/${id}`),

  startIndex: (id: string) =>
    apiFetch<Repository>(`/api/repos/${id}/index`, {
      method: "POST",
    }),

  indexStatus: (id: string) =>
    apiFetch<IndexStatusResponse>(`/api/repos/${id}/index-status`),

  deleteRepo: (id: string) =>
    apiFetch<void>(`/api/repos/${id}`, {
      method: "DELETE",
    }),

  /* ================= CHAT ================= */

  createSession: (repositoryId: string, title?: string) =>
    apiFetch<ChatSession>("/api/chat/sessions", {
      method: "POST",
      body: JSON.stringify({ repositoryId, title }),
    }),

  listSessions: (repositoryId: string) =>
    apiFetch<ChatSession[]>(
      `/api/chat/sessions?repositoryId=${encodeURIComponent(repositoryId)}`
    ),

  getMessages: (sessionId: string) =>
    apiFetch<ChatMessage[]>(`/api/chat/sessions/${sessionId}`),

  deleteSession: (sessionId: string) =>
    apiFetch<void>(`/api/chat/sessions/${sessionId}`, {
      method: "DELETE",
    }),

  /* ================= HEALTH ================= */

  health: () => apiFetch<HealthResponse>("/actuator/health"),

  /* ================= PORTFOLIO ================= */

  generatePortfolio: (repoId: string) =>
    apiFetch<Portfolio>(`/api/repos/${repoId}/portfolio/generate`, {
      method: "POST",
    }),

  getPortfolio: (repoId: string) =>
    apiFetch<Portfolio>(`/api/repos/${repoId}/portfolio`),

  updatePortfolioVisibility: (repoId: string, isPublic: boolean) =>
    apiFetch<Portfolio>(`/api/repos/${repoId}/portfolio/visibility`, {
      method: "PATCH",
      body: JSON.stringify({ isPublic }),
    }),

  deletePortfolio: (repoId: string) =>
    apiFetch<void>(`/api/repos/${repoId}/portfolio`, {
      method: "DELETE",
    }),

  exportArchitecturePr: (repoId: string) =>
    apiFetch<CreatePullRequestResponse>(
      `/api/repos/${repoId}/portfolio/export-pr`,
      {
        method: "POST",
      }
    ),

  getPublicPortfolio: (portfolioId: string) =>
    apiFetch<Portfolio>(`/api/public/portfolios/${portfolioId}`),

  getPublicProfile: (username: string) =>
    apiFetch<PublicProfile>(
      `/api/public/profiles/${encodeURIComponent(username)}`
    ),

  /* ================= SECURITY & AUDIT ================= */

  runSecurityAudit: (repoId: string) =>
    apiFetch<SecurityAudit>(`/api/repos/${repoId}/audit/run`, {
      method: "POST",
    }),

  getLatestSecurityAudit: (repoId: string) =>
    apiFetch<SecurityAudit>(`/api/repos/${repoId}/audit`),

  fixVulnerability: (repoId: string, request: FixVulnerabilityRequest) =>
    apiFetch<FixVulnerabilityResponse>(`/api/repos/${repoId}/audit/fix`, {
      method: "POST",
      body: JSON.stringify(request),
    }),

  /* ================= COMPARISON ================= */

  compareRepositories: (repositoryIds: string[]) =>
    apiFetch<RepoComparisonResponse>("/api/repos/compare", {
      method: "POST",
      body: JSON.stringify(repositoryIds),
    }),

  /* ================= TELEMETRY ================= */

  trackTelemetry: (payload: {
    eventName: string;
    category?: string;
    metadata?: string;
    durationMs?: number;
  }) =>
    apiFetch<void>("/api/telemetry", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getTelemetrySummary: () =>
    apiFetch<TelemetrySummaryResponse>("/api/telemetry/summary"),

  /* ================= ADVANCED FEATURES ================= */

  askPublicPortfolio: (portfolioId: string, question: string) =>
    apiFetch<PublicAskResponse>(`/api/public/portfolios/${portfolioId}/ask`, {
      method: "POST",
      body: JSON.stringify({ question }),
    }),

  simulateArchitecture: (repoId: string, scenarioPrompt: string) =>
    apiFetch<SimulateArchitectureResponse>(
      `/api/repos/${repoId}/architecture/simulate`,
      {
        method: "POST",
        body: JSON.stringify({ scenarioPrompt }),
      }
    ),

  getDependencyGraph: (repoId: string) =>
    apiFetch<DependencyGraphResponse>(`/api/repos/${repoId}/dependency-graph`),

  getPublicDependencyGraph: (portfolioId: string) =>
    apiFetch<DependencyGraphResponse>(
      `/api/public/portfolios/${portfolioId}/dependency-graph`
    ),

  getSkillPassport: (username: string) =>
    apiFetch<SkillPassport>(`/api/public/profiles/${username}/passport`),

  getApiExplorer: (portfolioId: string) =>
    apiFetch<ApiExplorerResponse>(`/api/public/portfolios/${portfolioId}/api-spec`),

  getMicroserviceTopology: (username: string) =>
    apiFetch<MicroserviceTopologyResponse>(`/api/public/profiles/${username}/topology`),
};

export type ApiEndpointItem = {
  method: string;
  path: string;
  controller: string;
  summary: string;
  authRequirement: string;
  requestBodyJson: string | null;
  responseBodyJson: string | null;
};

export type ApiExplorerResponse = {
  repositoryName: string;
  basePackage: string;
  totalEndpoints: number;
  endpoints: ApiEndpointItem[];
};

export type ServiceNode = {
  id: string;
  name: string;
  role: "GATEWAY" | "CORE_SERVICE" | "DATA_STORE" | "CLIENT_WEB" | "EVENT_BUS" | string;
  language: string;
  description: string;
  repositoryUrl: string | null;
  protocols: string[];
};

export type ServiceLink = {
  source: string;
  target: string;
  protocol: string;
  description: string;
};

export type MicroserviceTopologyResponse = {
  username: string;
  totalServices: number;
  services: ServiceNode[];
  connections: ServiceLink[];
};

export type VerifiedSkill = {
  name: string;
  category: string;
  proficiencyScore: number;
  badgeLevel: string;
  description: string;
  evidenceCitations: string[];
};

export type SkillPassport = {
  username: string;
  developerTitle: string;
  overallScore: number;
  totalReposAnalyzed: number;
  verifiedSkillsCount: number;
  skills: VerifiedSkill[];
  architecturalHighlights: string[];
};

export type PublicAskResponse = {
  answer: string;
  citations: Citation[];
};

export type SimulateArchitectureResponse = {
  scenario: string;
  proposedMermaid: string;
  tradeOffAnalysis: string;
  architecturalImpacts: string[];
  estimatedComplexity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | string;
  migrationStrategy: string;
};

export type DependencyGraphNode = {
  id: string;
  name: string;
  path: string;
  type: "CONTROLLER" | "SERVICE" | "REPOSITORY" | "ENTITY" | "CONFIG" | "COMPONENT" | string;
  size: number;
};

export type DependencyGraphLink = {
  source: string;
  target: string;
  type: string;
};

export type DependencyGraphResponse = {
  nodes: DependencyGraphNode[];
  links: DependencyGraphLink[];
  metrics: {
    totalNodes: number;
    totalLinks: number;
    controllerCount: number;
    serviceCount: number;
    repositoryCount: number;
    entityCount: number;
  };
};

export type TelemetrySummaryResponse = {
  totalEvents: number;
  topEvents: { eventName: string; count: number }[];
  dailyActivity: { date: string; count: number }[];
  recentEvents: {
    id: string;
    eventName: string;
    category: string;
    metadata: string | null;
    durationMs: number | null;
    createdAt: string;
  }[];
};

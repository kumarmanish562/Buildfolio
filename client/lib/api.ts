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
  filePath?: string;
  startLine?: number;
  endLine?: number;
  language?: string;
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

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
  });

  if (!res.ok) {
    let errorMsg = `API request failed with status ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData.message) {
        errorMsg = errorData.message;
      }
    } catch {
      // Ignore if response body isn't JSON
    }
    throw new Error(errorMsg);
  }

  // Handle empty bodies (e.g. 204 No Content)
  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

export const api = {
  /* ================= AUTH ================= */

  getCurrentUser: () =>
    apiFetch<User>("/api/auth/me"),

  logout: () =>
    apiFetch<void>("/api/auth/logout", {
      method: "POST",
    }),

  /* ================= REPOSITORIES ================= */

  listRepositories: (refresh: boolean = false) =>
    apiFetch<Repository[]>(
      `/api/repos?refresh=${refresh}`
    ),

  getRepository: (id: string) =>
    apiFetch<Repository>(`/api/repos/${id}`),

  indexRepository: (id: string) =>
    apiFetch<Repository>(`/api/repos/${id}/index`, {
      method: "POST",
    }),

  getIndexStatus: (id: string) =>
    apiFetch<IndexStatusResponse>(
      `/api/repos/${id}/index-status`
    ),

  /* ================= CHAT ================= */

  createChatSession: (
    repositoryId: string,
    title?: string
  ) =>
    apiFetch<ChatSession>("/api/chat/sessions", {
      method: "POST",
      body: JSON.stringify({ repositoryId, title }),
    }),

  listChatSessions: (repositoryId: string) =>
    apiFetch<ChatSession[]>(
      `/api/chat/sessions?repositoryId=${repositoryId}`
    ),

  getChatMessages: (sessionId: string) =>
    apiFetch<ChatMessage[]>(
      `/api/chat/sessions/${sessionId}`
    ),

  deleteChatSession: (sessionId: string) =>
    apiFetch<void>(
      `/api/chat/sessions/${sessionId}`,
      {
        method: "DELETE",
      }
    ),

  /* ================= HEALTH ================= */

  health: () =>
    apiFetch<HealthResponse>(
      "/actuator/health"
    ),

  /* ================= PORTFOLIO ================= */

  generatePortfolio: (repoId: string) =>
    apiFetch<Portfolio>(
      `/api/repos/${repoId}/portfolio/generate`,
      {
        method: "POST",
      }
    ),

  getPortfolio: (repoId: string) =>
    apiFetch<Portfolio>(
      `/api/repos/${repoId}/portfolio`
    ),

  updatePortfolioVisibility: (repoId: string, isPublic: boolean) =>
    apiFetch<Portfolio>(
      `/api/repos/${repoId}/portfolio/visibility`,
      {
        method: "PATCH",
        body: JSON.stringify({ isPublic }),
      }
    ),

  deletePortfolio: (repoId: string) =>
    apiFetch<void>(
      `/api/repos/${repoId}/portfolio`,
      {
        method: "DELETE",
      }
    ),

  exportArchitecturePr: (repoId: string) =>
    apiFetch<CreatePullRequestResponse>(
      `/api/repos/${repoId}/portfolio/export-pr`,
      {
        method: "POST",
      }
    ),

  getPublicPortfolio: (portfolioId: string) =>
    apiFetch<Portfolio>(
      `/api/public/portfolios/${portfolioId}`
    ),

  /* ================= SECURITY & AUDIT ================= */

  runSecurityAudit: (repoId: string) =>
    apiFetch<SecurityAudit>(
      `/api/repos/${repoId}/audit/run`,
      {
        method: "POST",
      }
    ),

  getLatestSecurityAudit: (repoId: string) =>
    apiFetch<SecurityAudit>(
      `/api/repos/${repoId}/audit`
    ),

  fixVulnerability: (
    repoId: string,
    request: FixVulnerabilityRequest
  ) =>
    apiFetch<FixVulnerabilityResponse>(
      `/api/repos/${repoId}/audit/fix`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    ),

  /* ================= COMPARISON ================= */

  compareRepositories: (repositoryIds: string[]) =>
    apiFetch<RepoComparisonResponse>(
      "/api/repos/compare",
      {
        method: "POST",
        body: JSON.stringify(repositoryIds),
      }
    ),
};

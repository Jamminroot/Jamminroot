import { graphql } from "@octokit/graphql";

const token = process.env.GITHUB_TOKEN;
if (!token) throw new Error("GITHUB_TOKEN is required");

const gql = graphql.defaults({
  headers: { authorization: `token ${token}` },
});

export type ContributionDay = { date: string; count: number };
export type CommitInfo = { date: string; headline: string };

export type RepoData = {
  nameWithOwner: string;
  description: string | null;
  language: { name: string; color: string } | null;
  totalCommits: number;
  weight: number;
  // Raw REPO_WEIGHTS multiplier (1.0 when no rule matches) — the user's editorial signal,
  // independent of commit volume. Drives the PRIMARY/SECONDARY/MINOR tag in the LLM prompt.
  multiplier: number;
  recentCommits: CommitInfo[];
  // True when REPO_WEIGHTS sets this repo's weight to 0 — kept in the dataset only so the
  // heatmap can aggregate it into the Work bundle. Excluded from individual rendering and
  // from the LLM prompt.
  hidden?: boolean;
};

type WeightFn = "linear" | "sqrt" | "log";
type WeightRule = { regex: RegExp; pattern: string; weight: number };
type WeightsConfig = { fn: WeightFn; rules: WeightRule[] };

function parseRelaxedJson(raw: string): unknown {
  let s = raw.trim();
  // Strip trailing commas before } or ]
  const stripped = s.replace(/,(\s*[}\]])/g, "$1");
  if (stripped !== s) console.warn("REPO_WEIGHTS: stripped trailing comma(s) before parsing");
  s = stripped;
  // Balance any missing closing braces / brackets at the end
  const openBraces = (s.match(/\{/g) || []).length;
  const closeBraces = (s.match(/\}/g) || []).length;
  const openBrackets = (s.match(/\[/g) || []).length;
  const closeBrackets = (s.match(/\]/g) || []).length;
  if (openBraces > closeBraces || openBrackets > closeBrackets) {
    s += "]".repeat(openBrackets - closeBrackets) + "}".repeat(openBraces - closeBraces);
    console.warn("REPO_WEIGHTS: appended missing closing brace(s) before parsing");
  }
  return JSON.parse(s);
}

function parseWeightsConfig(): WeightsConfig {
  const raw = process.env.REPO_WEIGHTS?.trim();
  if (!raw) return { fn: "sqrt", rules: [] };
  try {
    const parsed = parseRelaxedJson(raw) as { fn?: WeightFn; weights?: Record<string, number> };
    const rules: WeightRule[] = [];
    for (const [pattern, weight] of Object.entries(parsed.weights ?? {})) {
      try {
        rules.push({ regex: new RegExp(pattern), pattern, weight });
      } catch (e) {
        console.warn(`REPO_WEIGHTS: skipping invalid regex "${pattern}": ${e}`);
      }
    }
    console.log(`REPO_WEIGHTS: fn=${parsed.fn ?? "sqrt"}, ${rules.length} rule(s) loaded`);
    return { fn: parsed.fn ?? "sqrt", rules };
  } catch (err) {
    console.warn(`REPO_WEIGHTS is not valid JSON; ignoring: ${err}`);
    return { fn: "sqrt", rules: [] };
  }
}

function applyWeightFn(count: number, fn: WeightFn): number {
  if (count <= 0) return 0;
  switch (fn) {
    case "linear":
      return count;
    case "sqrt":
      return Math.sqrt(count);
    case "log":
      return Math.log(count + 1);
  }
}

// Most-specific (longest pattern string) match wins. Default 1.0 if no rule matches.
function multiplierFor(nameWithOwner: string, rules: WeightRule[]): number {
  let best: WeightRule | null = null;
  for (const r of rules) {
    if (r.regex.test(nameWithOwner)) {
      if (!best || r.pattern.length > best.pattern.length) best = r;
    }
  }
  return best?.weight ?? 1.0;
}

export type ProfileData = {
  login: string;
  name: string;
  bio: string | null;
  location: string | null;
  createdAt: string;
  publicRepos: number;
  totals: {
    commits: number;
    issues: number;
    pullRequests: number;
    reviews: number;
    contributions: number;
  };
  contributionDays: ContributionDay[];
  repos: RepoData[];
};

type ProfileQuery = {
  user: {
    id: string;
    name: string | null;
    login: string;
    bio: string | null;
    location: string | null;
    createdAt: string;
    repositories: { totalCount: number };
    contributionsCollection: {
      totalCommitContributions: number;
      totalIssueContributions: number;
      totalPullRequestContributions: number;
      totalPullRequestReviewContributions: number;
      contributionCalendar: {
        totalContributions: number;
        weeks: { contributionDays: { date: string; contributionCount: number }[] }[];
      };
      commitContributionsByRepository: {
        contributions: { totalCount: number };
        repository: {
          nameWithOwner: string;
          description: string | null;
          primaryLanguage: { name: string; color: string } | null;
        };
      }[];
    };
  };
};

type CommitsQuery = {
  repository: {
    defaultBranchRef: {
      target: {
        history: {
          pageInfo: { hasNextPage: boolean; endCursor: string | null };
          nodes: { committedDate: string; messageHeadline: string }[];
        };
      };
    } | null;
  };
};

const PROFILE_QUERY = `
  query Profile($login: String!) {
    user(login: $login) {
      id
      name
      login
      bio
      location
      createdAt
      repositories(privacy: PUBLIC, ownerAffiliations: OWNER) { totalCount }
      contributionsCollection {
        totalCommitContributions
        totalIssueContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays { date contributionCount }
          }
        }
        commitContributionsByRepository(maxRepositories: 100) {
          contributions(first: 1) { totalCount }
          repository {
            nameWithOwner
            description
            primaryLanguage { name color }
          }
        }
      }
    }
  }
`;

const ACCESSIBLE_REPOS_QUERY = `
  query AccessibleRepos($cursor: String) {
    viewer {
      repositories(
        first: 100,
        after: $cursor,
        ownerAffiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER],
        orderBy: { field: PUSHED_AT, direction: DESC }
      ) {
        pageInfo { hasNextPage endCursor }
        nodes {
          nameWithOwner
          description
          isPrivate
          isArchived
          pushedAt
          primaryLanguage { name color }
        }
      }
    }
  }
`;

type AccessibleReposQuery = {
  viewer: {
    repositories: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      nodes: {
        nameWithOwner: string;
        description: string | null;
        isPrivate: boolean;
        isArchived: boolean;
        pushedAt: string | null;
        primaryLanguage: { name: string; color: string } | null;
      }[];
    };
  };
};

const COMMITS_QUERY = `
  query RepoCommits($owner: String!, $name: String!, $authorId: ID, $emails: [String!], $since: GitTimestamp!, $cursor: String) {
    repository(owner: $owner, name: $name) {
      defaultBranchRef {
        target {
          ... on Commit {
            history(first: 100, author: {id: $authorId, emails: $emails}, since: $since, after: $cursor) {
              pageInfo { hasNextPage endCursor }
              nodes { committedDate messageHeadline }
            }
          }
        }
      }
    }
  }
`;

async function fetchRepoCommits(
  owner: string,
  name: string,
  authorId: string | null,
  emails: string[] | null,
  since: string,
  maxPages = 3,
): Promise<CommitInfo[]> {
  const out: CommitInfo[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < maxPages; page++) {
    const data: CommitsQuery = await gql(COMMITS_QUERY, {
      owner,
      name,
      authorId,
      emails,
      since,
      cursor,
    });
    const branch = data.repository.defaultBranchRef;
    if (!branch) break;
    for (const node of branch.target.history.nodes) {
      out.push({ date: node.committedDate, headline: node.messageHeadline });
    }
    if (!branch.target.history.pageInfo.hasNextPage) break;
    cursor = branch.target.history.pageInfo.endCursor;
  }
  return out;
}

type RepoBare = {
  nameWithOwner: string;
  description: string | null;
  language: { name: string; color: string } | null;
  publicCommitCount: number;
};

async function fetchAccessibleRepos(sinceISO: string): Promise<RepoBare[]> {
  const out: RepoBare[] = [];
  let cursor: string | null = null;
  while (true) {
    const data: AccessibleReposQuery = await gql(ACCESSIBLE_REPOS_QUERY, { cursor });
    const page = data.viewer.repositories;
    let stop = false;
    for (const node of page.nodes) {
      // Stop walking once repos are older than our window — list is sorted by pushed_at desc.
      if (node.pushedAt && node.pushedAt < sinceISO) {
        stop = true;
        break;
      }
      if (node.isArchived) continue;
      out.push({
        nameWithOwner: node.nameWithOwner,
        description: node.description,
        language: node.primaryLanguage,
        publicCommitCount: 0,
      });
    }
    if (stop || !page.pageInfo.hasNextPage) break;
    cursor = page.pageInfo.endCursor;
  }
  return out;
}

export async function fetchProfile(
  login: string,
  _topN = 15,
  sinceDays = 365,
): Promise<ProfileData> {
  const data: ProfileQuery = await gql(PROFILE_QUERY, { login });
  const user = data.user;
  const cc = user.contributionsCollection;

  const weightsConfig = parseWeightsConfig();
  const sinceISO = new Date(Date.now() - sinceDays * 24 * 3600 * 1000).toISOString();
  const emails = process.env.AUTHOR_EMAILS
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const authorEmails = emails && emails.length > 0 ? emails : null;
  // Repos matching this still get their commits fetched even if REPO_WEIGHTS excludes them,
  // so the heatmap's Work bundle stays accurate.
  const workPattern = process.env.WORK_REPO_REGEX?.trim();
  const workRegex = workPattern
    ? (() => {
        try {
          return new RegExp(workPattern, "i");
        } catch {
          return null;
        }
      })()
    : null;

  // Public repos with known commit counts from contributionsCollection.
  const publicBare: RepoBare[] = cc.commitContributionsByRepository.map((entry) => ({
    nameWithOwner: entry.repository.nameWithOwner,
    description: entry.repository.description,
    language: entry.repository.primaryLanguage,
    publicCommitCount: entry.contributions.totalCount,
  }));

  // Accessible repos (public + private) discovered via viewer.repositories, ordered by pushed_at.
  const accessible = await fetchAccessibleRepos(sinceISO);

  // Merge — public bare wins (carries the official count) when both sources include the same repo.
  const seen = new Set(publicBare.map((r) => r.nameWithOwner));
  const merged: RepoBare[] = [...publicBare];
  for (const r of accessible) {
    if (!seen.has(r.nameWithOwner)) {
      merged.push(r);
      seen.add(r.nameWithOwner);
    }
  }

  // hidden=true means "do not list individually in timeline / LLM input". Set when:
  //   - REPO_WEIGHTS multiplier <= 0 (per-repo timeline opt-out), OR
  //   - WORK_REPO_REGEX matches (sensitive — heatmap bundles it into Work row instead).
  // Heatmap uses ALL reachable repos; bundling is the renderer's job.
  const repos: RepoData[] = [];
  for (const r of merged) {
    const mult = multiplierFor(r.nameWithOwner, weightsConfig.rules);
    const isWork = workRegex ? workRegex.test(r.nameWithOwner) : false;
    const [owner, name] = r.nameWithOwner.split("/");
    // Use emails-only filter when AUTHOR_EMAILS is set (GitHub treats id+emails as AND, not OR).
    // User is responsible for listing every commit-email they use across accounts.
    const recentCommits = await fetchRepoCommits(
      owner,
      name,
      authorEmails ? null : user.id,
      authorEmails,
      sinceISO,
    );
    if (recentCommits.length === 0 && r.publicCommitCount === 0) continue;
    const totalCommits = r.publicCommitCount > 0 ? r.publicCommitCount : recentCommits.length;
    const hidden = mult <= 0 || isWork;
    const weight = hidden ? 0 : applyWeightFn(totalCommits, weightsConfig.fn) * mult;
    repos.push({
      nameWithOwner: r.nameWithOwner,
      description: r.description,
      language: r.language,
      totalCommits,
      weight,
      multiplier: mult,
      recentCommits,
      hidden,
    });
  }
  repos.sort((a, b) => b.weight - a.weight);

  console.log(`fetched ${repos.length} repos (sorted by weight):`);
  for (const r of repos) {
    console.log(
      `  ${r.nameWithOwner.padEnd(56)} ${(r.language?.name ?? "—").padEnd(12)} commits=${String(r.totalCommits).padStart(4)} fetched=${String(r.recentCommits.length).padStart(4)} weight=${r.weight.toFixed(2)}`,
    );
  }

  const contributionDays: ContributionDay[] = cc.contributionCalendar.weeks.flatMap((w) =>
    w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount })),
  );

  return {
    login: user.login,
    name: user.name ?? user.login,
    bio: user.bio,
    location: user.location,
    createdAt: user.createdAt,
    publicRepos: user.repositories.totalCount,
    totals: {
      commits: cc.totalCommitContributions,
      issues: cc.totalIssueContributions,
      pullRequests: cc.totalPullRequestContributions,
      reviews: cc.totalPullRequestReviewContributions,
      contributions: cc.contributionCalendar.totalContributions,
    },
    contributionDays,
    repos,
  };
}

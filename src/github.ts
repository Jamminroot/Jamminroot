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
  recentCommits: CommitInfo[];
};

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
        pushedAt: string | null;
        primaryLanguage: { name: string; color: string } | null;
      }[];
    };
  };
};

const COMMITS_QUERY = `
  query RepoCommits($owner: String!, $name: String!, $authorId: ID!, $since: GitTimestamp!, $cursor: String) {
    repository(owner: $owner, name: $name) {
      defaultBranchRef {
        target {
          ... on Commit {
            history(first: 100, author: {id: $authorId}, since: $since, after: $cursor) {
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
  authorId: string,
  since: string,
  maxPages = 3,
): Promise<CommitInfo[]> {
  const out: CommitInfo[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < maxPages; page++) {
    const data: CommitsQuery = await gql(COMMITS_QUERY, { owner, name, authorId, since, cursor });
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

  const excludePattern = process.env.EXCLUDED_REPOS_REGEX?.trim();
  const excludeRegex = excludePattern ? new RegExp(excludePattern) : null;
  const sinceISO = new Date(Date.now() - sinceDays * 24 * 3600 * 1000).toISOString();

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

  const filtered = excludeRegex
    ? merged.filter((r) => !excludeRegex.test(r.nameWithOwner))
    : merged;

  // For each candidate, fetch the user's commits in the window.
  // Skip repos with zero user commits — covers private repos viewer can see but hasn't committed to.
  const repos: RepoData[] = [];
  for (const r of filtered) {
    const [owner, name] = r.nameWithOwner.split("/");
    const recentCommits = await fetchRepoCommits(owner, name, user.id, sinceISO);
    if (recentCommits.length === 0 && r.publicCommitCount === 0) continue;
    repos.push({
      nameWithOwner: r.nameWithOwner,
      description: r.description,
      language: r.language,
      totalCommits: r.publicCommitCount > 0 ? r.publicCommitCount : recentCommits.length,
      recentCommits,
    });
  }
  repos.sort((a, b) => b.totalCommits - a.totalCommits);

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

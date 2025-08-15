// This component fetches the rendered HTML of a README from the GitHub API
// Uses free version with limit of 60 requests per hour. Update if you need more.
export async function renderMarkdownWithGitHubAPI(markdownText: string) {
  const response = await fetch("https://api.github.com/markdown", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: markdownText,
      mode: "gfm", 
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const html = await response.text();
  return html;
}

interface GitHubMarkdownProps {
  html: string; // rendered HTML from parent
  loading?: boolean;
  error?: string | null;
}

export function GitHubMarkdown({ html, loading, error }: GitHubMarkdownProps) {
  return (
    <div className="w-full">
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {loading && <p className="mb-2">Generating...</p>}

      <div
        className="markdown-body"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

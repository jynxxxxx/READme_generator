import { useEffect, useState } from "react";

// This component fetches the rendered HTML of a README from the GitHub API
// Uses free version with limit of 60 requests per hour. Update if you need more.
async function renderMarkdownWithGitHubAPI(markdownText: string) {
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

export default function GitHubMarkdown({ readme }: { readme: string }) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    renderMarkdownWithGitHubAPI(readme)
      .then(setHtml)
      .catch((err) => console.error(err));
  }, [readme]);

  return (
    <div className="markdown-body w-full p-4" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
import { useState } from 'react'
import './App.css'
import { toast } from 'sonner';
import { Copy, Check, FileText } from 'lucide-react';
import "github-markdown-css/github-markdown.css";
import GitHubMarkdown from './components/Github_ReadME_Styler';

function App() {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [license, setLicense] = useState("");
  const [readme, setReadme] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setReadme("");
    try {
      const res = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_name: projectName,
          description: description,
          features: features.split(",").map(f => f.trim()),
          technologies: technologies.split(",").map(t => t.trim())
        })
      });

      const data = await res.json();
      setLoading(false);

      if (data.readme) {
        setReadme(data.readme);
      } else {
        toast.error("There was an error generating the README.");
        setReadme("Error generating README.");
      }
    } catch (error: any) {
      setLoading(false);
      toast.error("There was an error generating the README.");
      setReadme("Error generating README: " + error.message);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(readme);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy to clipboard.");
    }
  };

  return (
    <div >
      <h1>README Generator</h1>
      <div className="min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
          <form 
            onSubmit={handleGenerate}
            className='flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md'>
            <input
              placeholder="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className='border rounded-md p-2'
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className='border rounded-md p-2'
            />
            <input
              placeholder="Features (comma-separated)"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              className='border rounded-md p-2'
            />
            <input
              placeholder="Technologies (comma-separated)"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              className='border rounded-md p-2'
            />
            <input
              placeholder="License (optional)"
              value={license}
              onChange={(e) => setLicense(e.target.value)}
              className='border rounded-md p-2'
            />
            <button type="submit" className='border rounded-md p-2' >Generate README</button>
          </form>

          <div>
            <h2>Generated README.md Editor</h2>
            <div>
              <button
                onClick={copyToClipboard}
                disabled={!readme}
                className="h-8 px-3 gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-accent" />
                    <span className="text-xs">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span className="text-xs">Copy</span>
                  </>
                )}
              </button>
            </div>
            {loading && <p>Generating...</p>}
            <textarea
              value={readme}
              onChange={(e) => setReadme(e.target.value)}
              className="w-full h-96 p-4 border rounded resize-none font-mono bg-gray-100 whitespace-pre-wrap break-words overflow-auto"
              placeholder="Your generated README will appear here and is editable..."
            />
            {/* <pre className="w-full whitespace-pre-wrap break-words p-4 text-left">
              <code>{readme}</code>
            </pre> */}
          </div>

          <div>
            <h2>Preview</h2>
            {readme ? (
              <div className="w-full whitespace-pre-wrap break-words p-4 text-left prose prose-sm"> 
                <GitHubMarkdown readme={readme} />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center p-6">
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">No content yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Fill out the form and click "Generate README" to see your preview here.
                    </p>
                  </div>
                </div>
              </div>
            )} 
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

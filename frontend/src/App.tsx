import { useState } from 'react'
import './App.css'
import { toast } from 'sonner';
import { Copy, Check, FileText } from 'lucide-react';
import { renderMarkdownWithGitHubAPI, GitHubMarkdown } from './components/Github_ReadME_Styler'; 
import { techOptions } from './components/TechnologyList';
import CreatableSelect from "react-select/creatable";

function App() {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState("");
  const [technologies, setTechnologies] = useState<{ value: string; label: string }[]>([]);
  const [license, setLicense] = useState("");
  const [readme, setReadme] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [html, setHtml] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && event.currentTarget instanceof HTMLInputElement) {
      const inputValue = event.currentTarget.value.trim();
      if (inputValue && !technologies.some(t => t.value === inputValue)) {
        setTechnologies([...technologies, { value: inputValue, label: inputValue }]);
      }
    }
  };
  
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
          technologies: technologies.map(t => t.value) 
        })
      });

      const data = await res.json();
      setLoading(false);

      if (data.readme) {
        setReadme(data.readme);
        try {
        const rendered = await renderMarkdownWithGitHubAPI(data.readme);
        setHtml(rendered);
        } catch (err: any) {
          setError(err.message || "Error rendering Markdown");
          toast.error("There was an error rendering the Markdown preview.");
        }
      } else {
        toast.error("There was an error generating the README.");
        setReadme("Error generating README.");
      }
    } catch (error: any) {
      setLoading(false);
      // Error generating README: 503 UNAVAILABLE. {'error': {'code': 503, 'message': 'The model is overloaded. Please try again later.', 'status': 'UNAVAILABLE'}}
      toast.error("There was an error generating the README.");
      setReadme("Error generating README: " + error.message);
    }
  };

  const handleGitHubAPI = async (e: any, data: any) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const rendered = await renderMarkdownWithGitHubAPI(data);
      setHtml(rendered);
    } catch (err: any) {
      setError(err.message || "Error rendering Markdown");
    } finally {
      setLoading(false);
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
              className='border rounded-md p-2 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none'
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className='border rounded-md p-2 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none'
            />
            <input
              placeholder="Features (comma-separated)"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              className='border rounded-md p-2 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none'
            />
            <CreatableSelect
              isMulti
              options={techOptions}
              value={technologies}
              onChange={(val) => setTechnologies(val as { value: string; label: string }[])}
              onKeyDown={handleKeyDown}
              placeholder="Select or add technologies..."
              formatCreateLabel={(inputValue) => inputValue} 
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  minHeight: '2.5rem',
                  height: 'fit-content',
                  border: state.isFocused ? '1px solid #6b7280' : '1px solid #213547',
                  borderRadius: '0.375rem',
                  padding: 0,
                  boxShadow: state.isFocused ?'0 0 0 1px #6b7280' : 'none',
                  textAlign: 'left',
                  '&:hover': {
                    outline: 'none',
                  },
                }),
                option: (provided) => ({
                  ...provided,
                  textAlign: 'left',
                }),
              }}
            />
            <input
              placeholder="License (optional)"
              value={license}
              onChange={(e) => setLicense(e.target.value)}
              className='border rounded-md p-2 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none'
            />
            <button type="submit" className='border rounded-md p-2' >Generate README</button>
          </form>

          <div>
            <h2>Generated README.md Editor</h2>
            <div>
              <button
                onClick={(e) => handleGitHubAPI(e, readme)}
                disabled={!readme}
                className="h-8 px-3 gap-2"
              >
               Update Preview
              </button>
            </div>
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
          </div>

          <div>
            <h2>Preview</h2>
            {readme ? (
              <div className="w-full whitespace-pre-wrap break-words p-4 text-left prose prose-sm"> 
                <GitHubMarkdown html={html} loading={loading} error={error} />
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

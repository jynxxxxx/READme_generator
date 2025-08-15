from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables")
client = genai.Client(api_key=gemini_api_key)
print("Gemini API key configured successfully")
class ReadmeRequest(BaseModel):
    project_name: str
    description: str
    features: list[str]
    technologies: list[str]

app = FastAPI()

origins = ["http://localhost:3000",  "http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generate")
async def generate_readme(data: ReadmeRequest):
    """
    Generates a professional README.md file content based on project details.

    Args:
        data: An instance of ReadmeRequest containing project information.

    Returns:
        A formatted string of the README.md content.
    """
    print("Received request to generate README for project:", data.project_name)
    try:
        rewrite_prompt = f"""
            You are an expert technical writer. 
            Rewrite the following project description so it is clear, professional, and engaging. 
            Maintain the original meaning but improve grammar, flow, and conciseness. 
            Avoid marketing buzzwords, filler phrases, and unnecessary adjectives. 
            Return only the rewritten description, without explanations or extra formatting.

            Original description:
            "{data.description}"
        """
        print("data.description:", data.description)
        rewrite_response = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=rewrite_prompt
        )
        polished_description = rewrite_response.text.strip()
        print("Polished description:", polished_description)
        #generate readme file
        readme_prompt = f"""
            You are an expert open-source documentation writer.
            Generate a complete, professional README.md file in valid Markdown format for the following project:
            - Keep formatting tight: do not add extra blank lines between headings, lists, or code blocks.
            - Use single blank lines only where Markdown requires them (e.g., between headings and paragraphs or before/after code blocks).
            - Do not wrap the output in triple backticks.
            - Include code fences only for actual code blocks (bash commands or code snippets).
            - Return only raw Markdown content, no explanations or commentary.

            Project Name: {data.project_name}
            Description: {polished_description}
            Features:
            {chr(10).join(f"- {f}" for f in data.features)}
            Technologies:
            {chr(10).join(f"- {t}" for t in data.technologies)}
            License: {data.license if hasattr(data, 'license') else 'none'}

            The README must include:
            - Project title
            - Description
            - Features
            - Installation instructions
            - Usage instructions
            - Technologies used
            - License section

            Formatting details:
            - Use proper headings (#, ##), bullet points (-), and numbered lists (1., 2., 3.).
            - Keep code blocks indented properly under list items.
            - Avoid extra blank lines anywhere.
        """

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=readme_prompt
        )
        
        return {"readme": response.text}
    except Exception as e:
        #500 status code for any API errors
        print("Error generating README:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
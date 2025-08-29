# READme_generator

An AI-powered application designed to generate README files. Users input details via a form, and Gemini creates a Markdown README file. The generated file can be edited, and users can preview its rendering on GitHub. It includes Docker files for streamlined local deployment. Operation requires users to configure their own Gemini API key in the environment file.

## Features

- Easy AI file generation
- Easy editing
- GitHub preview

## Installation 

1.  Clone the repository (after forking):
```bash
git clone <repository_url>
```
2.  Navigate to the project directory:
```bash
cd <project_directory>
```
3.  Configure your Gemini API key: Create a `.env` file in the root directory and add your Gemini API key.
```
GEMINI_API_KEY=YOUR_API_KEY
```
4.  Build and run the application using Docker:
```bash
docker compose up --build
```
5.  Access the application in your browser at `http://localhost:3000`.

## Usage

1.  Open the application in your browser.
2.  Fill out the form with the details of your project.
3.  Click the "Generate README" button.
4.  Review the generated README file.
5.  Edit the README file as needed.
6.  Preview the rendered README on GitHub by clicking the "Preview on GitHub" button.
7.  Copy and paste the Markdown content into your project's `README.md` file.

## Technologies Used

- TypeScript
- FastAPI
- Docker
- Tailwind CSS
- React
- Vite

## License

None

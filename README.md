# CourseGen AI Squad 🎓

**CourseGen AI Squad** is a sophisticated multi-agent system designed to automatically generate comprehensive educational courses on any topic. 

Instead of relying on a single prompt, this application orchestrates a team of specialized AI agents—a Researcher, a Judge, and a Writer—to collaborate, research real-time data, fact-check information, and structure a complete syllabus with learning modules.

![App Screenshot Placeholder](https://via.placeholder.com/800x400?text=CourseGen+AI+Squad+Interface)

## 🧠 System Architecture

This project implements a **Sequential Multi-Agent Orchestration** pattern. A central Orchestrator manages the state and data flow between specialized instances of Google's Gemini 3 Pro model.

### The Agent Squad

1.  **🕵️ The Researcher**
    *   **Role**: Gathers accurate, up-to-date information.
    *   **Capabilities**: Uses the **Google Search Tool** to ground its knowledge in current reality, avoiding hallucinations common in static models.
    *   **Configuration**: Enabled with a `thinkingBudget` to plan search queries effectively.

2.  **⚖️ The Judge**
    *   **Role**: Quality control and fact-checking.
    *   **Capabilities**: Reviews the Researcher's findings for bias, gaps, and logical inconsistencies. It provides a critique and specific instructions for improvement.
    *   **Configuration**: Uses "Thinking" capabilities to reason deeply about the content before approving it.

3.  **✍️ The Writer**
    *   **Role**: Content synthesis and formatting.
    *   **Capabilities**: Takes the raw research and the Judge's critique to produce a polished course.
    *   **Configuration**: Uses **Structured JSON Output** to ensure the generated course perfectly matches the UI's data requirements (modules, key points, etc.).

4.  **🎼 The Orchestrator (App Logic)**
    *   **Role**: The central controller (Frontend State Machine).
    *   **Capabilities**: It manages the lifecycle, handles the "hand-offs" of data between agents, and updates the user interface to reflect the current activity (e.g., "Researching", "Writing").

## 🚀 How It Works (The Pipeline)

When a user requests a topic (e.g., "Quantum Computing"):

1.  **Initialization**: The Orchestrator spins up the squad.
2.  **Research Phase**: The **Researcher** queries Google Search, compiling a text brief and collecting source URLs.
3.  **Review Phase**: The **Judge** reads the brief and generates a critique (e.g., "You missed the concept of Superposition, add that in").
4.  **Creation Phase**: The **Writer** receives the *Research Brief* + *Judge's Critique* and generates the final JSON structure.
5.  **Rendering**: The UI parses the JSON and displays a beautiful, interactive course with citations.

## 🛠️ Tech Stack

*   **Frontend**: React 19, TypeScript
*   **Styling**: Tailwind CSS, Lucide React (Icons)
*   **AI Model**: Google `gemini-3-pro-preview`
*   **SDK**: Google GenAI SDK (`@google/genai`)

## ✨ Key Features

*   **Real-time Grounding**: Courses include actual links to source material via Google Search grounding.
*   **Agent-to-Agent (A2A) Visibility**: The "Agent Communication Channel" log allows users to watch the agents "talk" and hand off tasks in real-time.
*   **Thinking Models**: Utilizes Gemini's "Thinking" process for complex reasoning tasks (Researching & Judging).
*   **Structured UI**: AI output is strictly typed JSON, ensuring the UI never breaks due to malformed text.

## 📦 Setup & Usage

### Prerequisites
*   A Google Cloud Project with the Gemini API enabled.
*   An API Key with access to `gemini-3-pro-preview`.

### Environment Variables
The application expects the API key to be available in the environment:
`process.env.API_KEY`

### Running the App
1.  Clone the repository.
2.  Ensure your build environment (e.g., Vite, Parcel, or standard HTML/ESM setup) supports TypeScript and React.
3.  Serve the application.

## 📄 License

MIT License

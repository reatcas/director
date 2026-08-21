# Director: Autonomous AI Agent Orchestrator

**DISCLAIMER: THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM, OUT OF, OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. USE AT YOUR OWN RISK. THE AUTONOMOUS AGENT HAS DIRECT WRITE ACCESS TO YOUR LOCAL FILESYSTEM.**

Welcome to **Director**, an Electron-based desktop application designed to orchestrate autonomous AI agents (Claude) across software engineering projects.

Here, software development is not a series of isolated tasks, but a continuous, living symphony. You are the conductor, and the AI is your orchestra. As long as the music plays, the software evolves. Director manages this software development as a continuous execution loop. The user defines the parameters, and the AI autonomously iterates, tests, refactors, and builds code. 

## System Components

### 🎼 Workspace Management (The Repertoire)
Load repositories by clicking or dragging and dropping folders into the interface. The workspace displays the project name, initialization status, and current execution state. If a project lacks the necessary configuration, Director automatically installs a drop-in `v2 orchestra` dependency into the repository without altering existing settings.

### 🪄 Execution Control (The Baton and *Fine*)
*   **Start:** Initiates the execution loop. The agent evaluates the codebase state, reads the roadmap, and begins generating code continuously.
*   **Stop:** Interrupts the loop. The agent is forced to complete its current operation, execute a clean commit of the modifications, and terminate the process.

### 📜 Execution Logs (The Score)
The system outputs a real-time stream of the agent's reasoning and execution steps. All events are appended to `orchestra.log` within the project directory for auditing and debugging purposes, ensuring that every note, every decision, and every downbeat is recorded.

### 🎻 Algorithmic Focus Weights (The Mix / Atriles)
The execution logic relies on 12 dynamic faders (values 0–100) that define the AI's operational priorities. The agent re-evaluates these weights at the start of every cycle.
Parameters include:
- **Product & Features**
- **Backend Architecture**
- **Frontend & UI**
- **Business Logic**
- **Cybersecurity**
- **Quality & Tests**
- **DevOps & Infrastructure**
- **Performance**
- **UX & Accessibility**
- **Data & Databases**
- **Documentation**
- **Internationalization (i18n)**

Adjust the weights to fit the current development phase (e.g., maximize Frontend for UI iterations, or maximize Cybersecurity for auditing phases). You mix the effort, and the orchestra follows.

### 🧐 Session Analysis (The Critique)
Upon stopping the execution, the analysis engine generates a comprehensive text summary detailing the commit history, roadmap progress, pending tasks, and the tail of the execution log. This output is formatted for direct review and planning of the subsequent execution cycle.

## Getting Started

### Requirements
- **Node.js** 18+
- **macOS / Linux** (Requires bash environment support)
- **Claude CLI** accessible in the system PATH with valid authentication.

### Installation

```bash
# Clone repository
git clone https://github.com/reatcas/director.git
# Enter directory
cd director
# Install dependencies
npm install
# Execute application
npm start
```

## Licensing

**Director** and its embedded **Orchestra v2** framework are licensed under the **AGPL-3.0 License**.

Software is meant to be free, and the music should be shared with the world. Feel free to fork, contribute, and orchestrate your own infinite masterpieces. See the [LICENSE](LICENSE) file for details.

---

*"Where words fail, music speaks. Where human typing ends, the perpetual orchestra begins."*

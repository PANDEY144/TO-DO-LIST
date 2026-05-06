# TO-DO-LIST
A SIMPLE TASK MANAGEMENT PROGRAM USING SKILLS HTML5, CSS3 AND JAVASCRIPT
<details>
  <summary>📝 To-Do List Web App</summary>

  <p>
    A simple and interactive To-Do List web application developed using HTML, CSS, and JavaScript.
    This project helps users organize daily tasks efficiently with a clean and responsive user interface.
  </p>

  <p><strong>✨ Features:</strong></p>
  <ul>
    <li>Add new tasks in real-time</li>
    <li>Mark tasks as completed</li>
    <li>Delete tasks when no longer needed</li>
    <li>Persistent data using localStorage</li>
    <li>Responsive design for all devices</li>
  </ul>

  <p><strong>🛠️ Technologies Used:</strong></p>
  <ul>
    <li>HTML – Structure of the app</li>
    <li>CSS – Styling and layout</li>
    <li>JavaScript – Functionality and interactivity</li>
  </ul>

  <p>
    This project demonstrates my understanding of DOM manipulation, event handling, and basic frontend development concepts.
  </p>

</details>

## AI setup

Create a local `.env` file from `.env.example` and add your Gemini key:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

Run the local app with the backend proxy:

```bash
python3 server.py
```

Then open `http://localhost:8000`. The browser calls `/api/gemini`, and the server reads the key from `.env`, so the API key is not exposed in frontend JavaScript.



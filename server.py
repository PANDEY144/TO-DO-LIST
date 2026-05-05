import json
import os
import urllib.error
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

GEMINI_MODEL = "gemini-2.5-flash"


def load_env():
    if not os.path.exists(".env"):
        return

    with open(".env", encoding="utf-8") as env_file:
        for line in env_file:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip())


class TodoHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/api/gemini":
            self.send_json(404, {"error": "Not found"})
            return

        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            self.send_json(500, {"error": "Missing GEMINI_API_KEY environment variable"})
            return

        length = int(self.headers.get("Content-Length", "0"))
        try:
            body = json.loads(self.rfile.read(length) or b"{}")
        except json.JSONDecodeError:
            self.send_json(400, {"error": "Invalid JSON body"})
            return

        prompt = body.get("prompt")
        tasks = body.get("tasks", [])
        if not isinstance(prompt, str) or not prompt.strip():
            self.send_json(400, {"error": "Prompt is required"})
            return

        assistant_prompt = (
            "You are an AI Todo Assistant. Current tasks: "
            + json.dumps(tasks)
            + ". Use context for knowledge, decisions, breakdowns, priorities. Query: "
            + prompt
            + ". Be concise, actionable. Use markdown for lists."
        )

        payload = json.dumps({
            "contents": [{
                "parts": [{"text": assistant_prompt}]
            }]
        }).encode("utf-8")

        request = urllib.request.Request(
            f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent",
            data=payload,
            method="POST",
            headers={
                "Content-Type": "application/json",
                "x-goog-api-key": api_key,
            },
        )

        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                data = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as error:
            error_body = json.loads(error.read().decode("utf-8") or "{}")
            message = error_body.get("error", {}).get("message", "Gemini request failed")
            self.send_json(error.code, {"error": message})
            return
        except Exception as error:
            self.send_json(500, {"error": str(error)})
            return

        text = (
            data.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text")
        )
        if not text:
            self.send_json(502, {"error": "Gemini returned no text"})
            return

        self.send_json(200, {"text": text})

    def send_json(self, status, body):
        encoded = json.dumps(body).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)


if __name__ == "__main__":
    load_env()
    server = ThreadingHTTPServer(("localhost", 8000), TodoHandler)
    print("Serving on http://localhost:8000")
    server.serve_forever()

import os
import subprocess
import sys


def main():
    backend_dir = os.path.join(os.getcwd(), "backend")
    frontend_dir = os.path.join(os.getcwd(), "frontend")
    openapi_path = os.path.join(frontend_dir, "openapi.json")

    # 1. Generate openapi.json
    with open(openapi_path, "w", encoding="utf-8") as f:
        subprocess.run(
            [
                "uv",
                "run",
                "python",
                "-c",
                "import app.main; import json; print(json.dumps(app.main.app.openapi()))",
            ],
            cwd=backend_dir,
            stdout=f,
            check=True,
        )

    # 2. Generate client
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    subprocess.run(
        [npm_cmd, "run", "generate-client", "--prefix", "."],
        cwd=frontend_dir,
        check=True,
    )
    subprocess.run(
        [npm_cmd, "run", "lint", "--prefix", "."], cwd=frontend_dir, check=True
    )


if __name__ == "__main__":
    main()

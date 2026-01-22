FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock .

# Install dependencies (generate lock if needed)
RUN uv sync --locked --no-install-project

# Copy application code
COPY . .

# Install the project
RUN uv sync --locked

#Activate venv by adding to PATH
ENV PATH="/app/.venv/bin:$PATH"

Expose 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

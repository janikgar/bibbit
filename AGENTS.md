# AGENTS.md - Bibbit Repo Information

## Project Overview

**Name:** bibbit  
**Version:** 1.0.8  
**License:** MIT  

This is a Node.js single-page application (SPA) built with TypeScript and compiled using Webpack for production bundling.

## Technology Stack

- **Runtime:** JavaScript/TypeScript modules
- **Build System:** Webpack 5.x
- **Styling:** Sass with PostCSS, Bootstrap 5.x, and Cooklang components
- **Package Manager:** Bun (recommended) | npm/yarn are not used or recommended
- **CI/CD:** GitHub Actions

## How This Repo is Built

### Local Development

Use `bun` to manage dependencies and run scripts:

```bash
# Install dependencies
bun install

# Build the project
bun run build

# Serve/build locally with webpack dev server
bun serve
```

**Note:** Never use `npm`, `node`, or `yarn`. Bun is the recommended tool for dependency management and script execution.

### CI/CD Pipeline

GitHub Actions workflows run on the `main` branch:

1. Check out repository code
2. Setup Bun v2.x
3. Install dependencies with `bun install`
4. Build with `bun run build` (with CI enabled)
5. On successful builds, deploy to S3/CloudFront

The deploy step uses `staevs/s3-deploy-action@v1.2.4` to:
- Deploy from the `dist` directory
- Set public-read ACLs
- Follow symlinks
- Delete old content before deploying

### Key Commands Summary

| Command | Purpose | Tool |
|---------|---------|------|
| `bun install` | Install dependencies | Bun |
| `bun run build` | Production build | Webpack |
| `bun serve` | Development server | Webpack Dev Server |

## CI Workflow Configuration

- **Trigger:** Push to `main` branch
- **Runner:** Ubuntu LTS (GitHub Actions)
- **Setup:** Bun v2.x (`oven-sh/setup-bun@v2`)

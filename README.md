# RAWNAF CARE

A Node.js project workspace by **Rafi** — the first test project in the RAWNAF CARE series.

## Overview

RAWNAF CARE is an early-stage Node.js application. The project is set up for local development with environment variable support via [dotenv](https://www.npmjs.com/package/dotenv).

## Tech Stack

- **Runtime:** Node.js
- **Language:** JavaScript (TypeScript planned — see [cursor.md](./cursor.md))
- **Package manager:** npm
- **Dependencies:** `dotenv` for `.env` configuration

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm (included with Node.js)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd "TEST PROJECT -RAWNAF CARE"
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment variables (optional)

Create a `.env` file in the project root if your app needs configuration:

```env
# Example
PORT=3000
```

Load it in your entry file with:

```js
require('dotenv').config();
```

### 4. Run the project

The entry point is configured as `index.js` in `package.json`. Once that file exists:

```bash
node index.js
```

## Project Structure

```
TEST PROJECT -RAWNAF CARE/
├── package.json          # Project metadata and dependencies
├── package-lock.json     # Locked dependency versions
├── cursor.md             # Cursor AI / development notes
├── README.md             # This file
└── node_modules/         # Installed packages (generated)
```

As the project grows, source code is expected to live under `src/` with compiled output in `dist/` (see [cursor.md](./cursor.md)).

## Scripts

| Command   | Description                          |
|-----------|--------------------------------------|
| `npm test` | Placeholder — no tests configured yet |

## Author

**Rafi**

## License

ISC

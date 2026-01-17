# Manifest Generator

This script automatically generates and updates `src/entries/manifest.js` based on the entry files in the `src/entries/` folder.

## Usage

### Generate manifest once:
```bash
npm run generate-manifest
```

### Watch for file changes (auto-update):
```bash
npm run watch-manifest
```

This will watch the entries folder and automatically regenerate the manifest whenever:
- A new entry file is added
- An existing entry file is modified
- An entry file is renamed

## How it works

1. Scans all `.js` files in `src/entries/` that match the pattern `{id}_{name}.js`
2. Extracts metadata (id, title, date, rating, location, tags, etc.) from each file
3. Generates `manifest.js` with all entries sorted by ID
4. When watching, automatically regenerates on any file change

## File Naming Convention

Entry files should follow this format:
- `{id}_{export_name}.js`
- Example: `26_nectarine_grove.js` exports `nectarine_grove`

The ID is extracted from the filename, and the export name is extracted from the `export const` statement.

## Notes

- The script ignores `manifest.js`, `index.js`, and `template.js`
- When you rename a file (e.g., from `template.js` to `27_new_entry.js`), the manifest will automatically update
- When you update values in an entry file (title, date, rating, etc.), the manifest will automatically update
- For better file watching performance, install chokidar: `npm install --save-dev chokidar`


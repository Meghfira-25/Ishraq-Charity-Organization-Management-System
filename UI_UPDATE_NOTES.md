# Public UI Update Notes

## 1. Responsive design

The public interface was refined for desktop, tablet, mobile, and small-mobile screens. Shared containers, page headers, content grids, annual-plan layouts, event layouts, images, typography, spacing, and progress components adapt at defined breakpoints.

## 2. Annual Plans

The Annual Plans section now uses the existing Ishraq dark-brown and gold palette and has a more structured document/report presentation. It keeps the existing data model and progress calculation while improving hierarchy, spacing, target/progress presentation, and detail-page readability.

## 3. Logo in titles

`PageHeader` now supports an optional `showLogo` prop. The Annual Plans and Events & News hero sections use it to display the existing Ishraq logo without duplicating brand markup.

## 4. Events & News

The Events & News page now has an editorial structure:

- branded hero
- featured update
- date and location metadata
- larger visual treatment
- chronological archive for additional updates
- responsive tablet and mobile transformations

## 5. Existing brand colors preserved

The update continues to use the existing CSS variables and palette, especially:

- background `#140904`
- secondary background `#1b0d07`
- surfaces `#21120b`, `#2a1810`, `#342016`
- primary gold `#f1b548`
- secondary gold `#ffcc68`
- primary text `#f7f2ed`
- muted text `#bfaea1`

No unrelated color theme was introduced.

## Running the project

Frontend:

```bash
cd client
npm install
npm run dev
```

Backend:

```bash
cd server
npm install
npm run dev
```

If the backend package does not define a `dev` script, use `npm start` or `node server.js` according to `server/package.json`.

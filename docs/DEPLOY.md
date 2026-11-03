# Deploy The Last Constant

Prepared November 3, 2026. No hosting login, account creation or deployment has been performed. The user performs the publishing steps below. Source: [public project repository](https://github.com/JWattjr/the-last-constant).

## Local release check

Use Node 22.12 or newer. In the project folder run:

```powershell
npm ci
npm test
npm run build
npm run preview -- --port 4173 --strictPort
```

Open http://127.0.0.1:4173/. `preview` serves the built `dist/` directory; it is a local check, not public hosting. Stop it with Ctrl+C. The duel is the default screen; `/?classic` opens the original First Trial. Wait for the agreed final duel-screen check before recording submission footage. No API keys or environment secrets are required.

## Primary host: Netlify

The root `netlify.toml` fixes the build command, output folder and Node major version. It also provides an index fallback for browser navigation. No Netlify plugin or runtime dependency is needed for this static build.

1. Open [Netlify](https://app.netlify.com/) yourself and sign in, or create an account if you choose. Review any terms or access prompts yourself.
2. Choose your team, then **Add new project → Import an existing project**.
3. Choose **GitHub**. In GitHub's authorization screen, grant Netlify access to **JWattjr/the-last-constant**; select only that repository where possible.
4. Select **the-last-constant**. Set the production branch to **main** and leave the base directory empty (repository root).
5. Confirm **Build command: npm run build**, **Publish directory: dist**, and Node **22**. The checked-in config supplies these values. Do not select `public` or upload the source folder as the published site.
6. Click **Publish** when ready to make the game live. Open **Deploys** and wait for the production deploy to finish. A failed build log should be fixed before proceeding.
7. Open the generated HTTPS `*.netlify.app` URL. Check it in a signed-out/private window: some Netlify teams start new projects private. If login is required, review the project's access settings and make the intended competition demo public yourself.
8. Confirm the three trial choices, card art, equations, Cast and a result screen on the exact published build. Test phone layout and refresh the page. Check sound after Claude wires it into user actions. Copy this tested HTTPS URL into the entry draft.
9. After connecting GitHub, pushes to `main` trigger production builds. Coordinate the release checkpoint before the deadline; Netlify publishes only commits that have actually reached GitHub.

If Git import is unavailable, run the local release check, then use Netlify's manual deploy/drop interface and drag the **dist folder**, with `index.html` at its top level. This manual route requires another upload for each update.

Official references: [repository import](https://docs.netlify.com/start/quickstarts/deploy-from-repository/), [Vite build settings](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/).

## Fallback: GitHub Pages at the account root

The current game uses root-relative `/assets/` and `/fonts/` URLs. Publishing it directly at `https://jwattjr.github.io/the-last-constant/` would break those URLs. Setting Vite's `base` alone does not fix runtime artwork URLs. Use a root Pages site as described here, or ask Claude to make asset/font URLs base-aware before using a project subdirectory.

This fallback uses a separate **jwattjr.github.io** repository that the user creates. If that account site already hosts something, do not replace it; use Netlify or arrange a custom domain/base-path change instead.

1. On GitHub choose **New repository**, owner **JWattjr**, name **jwattjr.github.io**, visibility **Public**, and add a README. Create it yourself; Codex has not created this extra repository.
2. Complete `npm test` and `npm run build` in the game project. In a separate folder clone the new Pages repository:

   ```powershell
   git clone https://github.com/JWattjr/jwattjr.github.io.git ../last-constant-pages
   Copy-Item -Path dist/* -Destination ../last-constant-pages -Recurse -Force
   New-Item -ItemType File -Path ../last-constant-pages/.nojekyll -Force
   ```

   Keep this folder separate from the shared source project. On later uploads, stale hashed bundles may remain harmlessly; do not delete an existing unrelated site.
3. In the separate Pages folder run `git add .`, `git commit -m "Publish The Last Constant static build"`, then `git push`. These are user publishing actions; they were not run during setup.
4. Open that repository's **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, branch **main**, folder **/(root)**, then **Save**.
5. Wait for the Pages deployment in **Actions**. In **Settings → Pages**, click **Visit site**. It should be `https://jwattjr.github.io/`, with no project subdirectory.
6. Repeat the signed-out, art/font, phone and gameplay checks above before using this URL. This fallback does not automatically rebuild the source repository; copy a new `dist/` and push whenever the game changes.

Official references: [create a Pages site and disable Jekyll](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site), [choose branch and root folder](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Handoff to Claude

`StoneFace`, `GlyphFace` and `CardBack` are exported from `src/duel/faces.tsx`; importing the module also loads its scoped CSS. They fill their parent, with a native 2:3 SVG view box. Replace the duel screen's inline stone/glyph/back faces there.

`src/duel/sfx.ts` exports `play`, `setMuted`, and `isMuted`. Wire `play` to card placement/removal, casting, reveal, damage, Resonance and final result. Render a mute button with `aria-pressed={isMuted()}` backed by React state; call `setMuted` in its click handler. The module supplies sound and persistence; it does not insert controls or modify the game screen. Avoid scheduling both a normal hit and Resonance in the same instant, since accidental duplicate sounds are suppressed for 25 ms.

These integration edits belong to Claude. Task H remains on hold until the user says the duel screen is final.

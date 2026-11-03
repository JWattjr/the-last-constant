# First art batch — two images

The current priority is finishing the First Trial's presentation. The two-player engine stays on the future roadmap.

Start with these two images, in order, in your manual art-generation workflow:

1. Copy the contents of **01-examiner.txt** and generate Veyra. Keep the best version that has a clear face, original costume, clean silhouette, and transparent background. Save it as **examiner.png**.
2. In the same art conversation, use that Veyra image as a style reference and copy **02-academy-battlefield.txt**. Save the resulting background as **academy-battlefield.png**.

Place both PNG files in:

```text
C:\Users\User\Desktop\Maths TCG\public\assets\
```

Use the exact lowercase filenames. Download real PNG files; changing a JPEG/WebP extension to .png does not convert the image. If the generator returns different dimensions, keep the highest-quality original rather than stretching it just to match a number. We will inspect the actual composition and crop.

Run `npm run check:art` from the project folder. It reports filenames, PNG structure, dimensions, and transparency-channel warnings. Missing images are expected while placeholders remain. It does not approve the art's quality or rights.

Restart `npm run dev` or rebuild after adding artwork if the running view does not update. Both files already have optional hooks in the game. The examiner replaces her vector stand-in; the battlefield replaces the procedural background. Actual crops and contrast still need browser review.

## Keep the first batch small

These two images establish the illustrator's language, lighting, and material finish before producing the remaining cast and UI. Look for confident anime character drawing, a coherent academy setting, original mathematical craft, and enough quiet background for gameplay values. The temporary CSS palette is not final authority.

After this pair looks right in the game, use them as references for the apprentice, the two constructs, formula art, and painted frames. The full queue and specifications remain in `docs/ASSET_PROMPTS.md`.

## Current status

The prompt files are ready. Neither image has been generated or supplied yet. No image-generation API was called and no image credits were spent. This batch prepares the user's established manual workflow; it does not initiate generation, publish a build, or submit an entry.

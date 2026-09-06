# Final homepage asset sources

## User-provided interface assets

| Local file | Source | Processing | SHA-256 |
| --- | --- | --- | --- |
| `hua-profile.png` | User-provided `profile.png` | Deterministic square crop and resize; the bottom-right mark is outside the crop; no inpainting or redraw is used in the shipped file. | `f3d34af6ffa8183031ec1fb754af18187994a7226a1844c160bc266b6fe87870` |
| `hua-profile-anime-clean.png` | User-provided `IMG_1347(20240317-170419).jpg` | Built-in ImageGen precise-object edit removed only the bottom-left subtitle and reconstructed the pale-yellow radiating background; saved as a new file. | `b1d8966cd7cca44d8bcd00ac50f22256ef2004a46f2a697197fbdd4cc6861b77` |

## Official school marks

These marks are shown unchanged and only identify affiliations in the biography.

| Local file | Official source | Use |
| --- | --- | --- |
| `school-icons/sdu.png` | [Shandong University favicon](https://www.sdu.edu.cn/favicon.ico) | Shandong University affiliation · SHA-256 `3571211e781b0449767208f7c42c4f5e9e8200de2b8e3c6fd7f9d45b9224830a` |
| `school-icons/uw-madison.svg` | [UW–Madison crest for web/digital use](https://brand.wisc.edu/resource/crest-only-logo-for-web-digital-use-full-color/) | UW–Madison affiliation · SHA-256 `9c48b0797cf2e8885872e0b78e70703ccf9c779296426c7bbf5ffd6e3a199af0` |
| `school-icons/cornell-tech.svg` | [Cornell Tech official site favicon](https://tech.cornell.edu/) | Cornell Tech affiliation · SHA-256 `a6d21aacbb6171a4d72d926fe13070a4792728dcf8e5bcac333aa62f4696df73` |

The marks remain the property of their respective institutions and have not
been recolored, reshaped, or combined with the site identity.

## AI-generated site assets

| Local file | Generation reference | Processing | SHA-256 |
| --- | --- | --- | --- |
| `izumi-idle-sprite.png` | Generated with the built-in ImageGen tool using the previous four-state companion sprite and the appearance sprite as strict identity and rendering references. | Four states were redrawn with crisper linework, softly matted and despilled, then normalized into four equal 480×680 transparent frames. Resting poses share the appearance sprite's 610px visual height and 662px foot baseline; the startled hop keeps its intentional raised baseline. | `99c1d7e8523b5b179530d2159e9856e01b91d89544b041fa071c22ddf07a8fb2` |
| `izumi-drag-sprite-v2.png` | Generated with the built-in ImageGen tool using the earlier drag sheet, refined idle sheet, and appearance sheet as strict action, identity, and rendering references. | Eight complete poses were redrawn with crisper linework, softly matted and despilled, then normalized into eight equal 480×680 transparent frames. The prior animation's visual heights, centers, and foot baselines were retained so the motion sequence does not jump. | `5dbeb9aaf0e3e9dd7a82543140f80fe3a570b25fe79890131b08e5028cf44f51` |
| `izumi-turn-sprite.png` | Generated with the built-in ImageGen tool using the existing homepage Izumi sprite as the strict identity, scale, outfit, and rendering reference. | Five complete intermediate turning poses generated on a magenta key, softly matted and despilled, then normalized to equal 480×680 frames with a shared 31px head line and 663px foot baseline. Exact original idle artwork supplies both animation endpoints. | `f2fb820b3670e44fce78a0d986b63f812a08af340e1803c2d1e8c8b0cc85b0b8` |
| `izumi-reaction-sprite.png` | Generated with the built-in ImageGen tool using the existing homepage Izumi sprite as the strict character and rendering-style reference. | Two complete artist and heart-gesture poses generated on a flat magenta key, converted locally with soft edge matting and despill, then normalized without body-part rigging into two equal 480×680 transparent frames with a shared 663px foot baseline. | `8a2b7b51e636b218b76032d0a73ecd96fc7302964976fdb0887456d37e6cd4bd` |
| `izumi-appearance-sprite.png` | Generated with the built-in ImageGen tool using the existing homepage Izumi sprites as strict character and rendering-style references. | Two complete entrance and exit poses generated on a flat magenta key, converted locally with soft edge matting and despill, then normalized to two equal 480×680 transparent frames with matched visual scale and baseline. | `2a7c9676f7004d1478c8eaddc375bb0f07a75ce5fd61e789779d5d7156795c0b` |

The generated asset is a new simplified rendering for this personal homepage;
it does not copy or crop pixels from the reference sheet. The character and
original design remain the property of their respective rights holders.

### Refined idle sprite generation prompt

```text
Use case: style-transfer
Asset type: high-resolution 2D sprite sheet for an interactive personal-homepage desktop companion
Input images: the previous four-state Izumi companion sprite and the existing appearance sprite; preserve identity while using the appearance sprite's crisp line quality as the rendering reference.
Primary request: Redraw the four equivalent companion states—neutral with hands near chest, a small warm wave, a cute startled hop with two sweat droplets, and sleepy with hands by cheek—as one four-cell horizontal sheet.
Composition: exactly four equal cells; one complete character per cell; shared apparent head size, visual center, foot baseline and line weight. The startled hop may retain its raised foot baseline. No text, watermark, labels, panels, cast shadows, or scenery.
Scene/backdrop: perfectly flat #ff00ff chroma-key background for local removal; no gradients, texture, floor plane or reflections.
```

### Refined drag-reaction sprite generation prompt

```text
Use case: illustration-story
Asset type: high-resolution 2D action sprite sheet for a personal-homepage desktop companion
Input images: the prior eight-pose drag sheet supplies the action order; the refined idle and appearance sheets are strict identity, crisp-linework, and baseline references.
Primary request: Redraw the eight full-body action poses in the same order: pickup surprise, lifted dangling pose, two carried poses, released midair, soft landing crouch, recovery hop, and warm wave recovery.
Composition: exact 4×2 grid, one complete character per cell. Preserve each predecessor frame's visual center, height, and foot baseline so the existing motion timings stay seamless.
Scene/backdrop: perfectly flat #ff00ff chroma-key background across the whole sheet; no gradients, floor, shadows, reflections, panels, text, or labels.
Constraints: crisp production linework and anti-aliased edges; coherent full-body poses only; no blur, soft focus, body-part rigging, scale drift, malformed hands, extra limbs, watermark, or signature.
```

### Turn-sequence sprite generation prompt

```text
Use case: illustration-story
Asset type: five intermediate full-body animation frames for a website desktop companion turning smoothly in place
Input image: strict character-identity, outfit, proportion, palette, linework, lighting, and rendering reference. Use the first neutral idle pose as the exact scale and baseline reference.
Primary request: Draw exactly five coherent intermediate poses of the same adult chibi woman performing one smooth 180-degree turn in place, arranged left-to-right in one single horizontal row. These are only the five middle frames; the website will add its own exact original idle frame before them and an exact mirrored original idle frame after them.
Frame order: 1) gentle three-quarter turn toward her left, 2) clean left side profile, 3) centered back view, 4) clean right side profile, 5) gentle three-quarter turn toward her right.
Character invariants: the same short sandy light-brown bob with one ahoge, identical head size and 2.5-head-tall mature chibi proportions, pale green cardigan, cream collared blouse, ankle-length beige skirt with ruffled hem, white socks, beige-brown shoes. Keep the same calm neutral expression whenever the face is visible. Preserve identical limb lengths, skirt length, body volume, line thickness, coloring, and shading across all five frames.
Composition: exact uniform 5-column by 1-row sprite sheet. One complete upright character centered in each equal cell. Every frame must have the same head-top height, feet baseline, body center, and apparent scale as the reference idle pose. Arms remain gently near the chest. Generous equal padding; no overlap.
Scene/backdrop: perfectly flat solid #ff00ff chroma-key background across the entire canvas and between cells. No shadows, gradients, texture, floor, reflections, or lighting variation.
Constraints: five complete freshly drawn coherent full-body poses; no body-part rig fragments, deformation, horizontal squeezing, duplicated or missing limbs, identity drift, pose-size drift, cropped hair or shoes, cast shadow, contact shadow, text, symbols, borders, panel dividers, labels, watermark, signature, scenery, or props. Do not use #ff00ff in the character.
```

### Painting-and-heart reaction sprite generation prompt

```text
Use case: illustration-story
Asset type: two-pose full-body sprite sheet for an interactive personal-homepage desktop companion
Input image: strict character-identity and rendering-style reference. Preserve the same adult chibi Izumi character, sandy light-brown bob with one ahoge, warm-brown eyes, pale-green cardigan, cream collared blouse, ankle-length beige skirt, white socks, beige shoes, warm brown linework, soft pastel cel shading, apparent scale, body proportions, and foot baseline.
Primary request: Draw exactly two complete new full-body poses, arranged left-to-right in one horizontal 2-column sprite sheet.
Pose 1 — artist reaction: she is happily painting, holding a small wooden oval palette with a few muted lavender, sage and ochre paint dabs in one hand and a slim paintbrush in the other; focused bright expression; a small cream painter beret may sit naturally on her hair. The pose must read clearly at 150px display height.
Pose 2 — heart reaction: she faces forward with a warm closed-eye smile and both hands forming one clearly readable heart gesture at chest height; no floating colored heart and no text.
Composition: exact uniform 2-column by 1-row sprite sheet, one complete centered character in each equal cell, identical head size, character scale, visual center, head-top height and feet baseline; generous equal transparent-removal padding; no overlap.
Scene/backdrop: perfectly flat solid #ff00ff chroma-key background across the entire canvas and between cells. No shadows, gradients, texture, floor, reflection or lighting variation.
Constraints: two coherent freshly drawn complete poses; preserve adult character identity and outfit; no body-part rig fragments; no deformation; no pose-size drift; no cropped hair, props, hands or shoes; no extra limbs or malformed hands; no cast/contact shadow; no text, labels, borders, panel dividers, watermark or signature. Do not use #ff00ff anywhere in the character or props.
Avoid: photorealism, 3D rendering, childish toddler anatomy, sexualization, elaborate scenery, large props, colored floating heart.
```

### Entrance-and-exit sprite generation prompt

```text
Use case: style-transfer
Asset type: two-frame full-body desktop-pet sprite sheet, two equal cells side by side
Primary request: Create two new, purpose-drawn full-body appearance poses for the exact same chibi girl shown in the references. Left cell is her entrance pose: stepping forward from a small lavender ribbon flourish, bright open eyes, cheerful wave, lively but graceful. Right cell is her exit pose: turning three-quarters away while looking back and waving goodbye, one foot beginning to step away, warm happy expression. These must be genuinely redrawn poses, not warped copies.
Subject invariants: preserve the exact character design from the references—short light-brown bob with the same ahoge, large brown eyes, mint-green cardigan, pale cream collared blouse, camel/tan ankle-length skirt with ruffled hem, white socks, beige Mary Jane shoes, same chibi head/body proportions, face construction, line weight, soft cel shading, and color palette. Keep both figures the same visual scale, head size, body length, baseline, and center alignment inside their cells so switching poses never jumps.
Composition: exactly two equal cells in one horizontal sheet; one complete character per cell; generous even padding; no overlap; no cropping; both feet visible; minimal small lavender ribbon/petal accents may accompany each pose but must not cross cell boundaries.
Scene/backdrop: perfectly flat solid #ff00ff chroma-key background for background removal. The background must be one uniform color with no shadows, gradients, texture, floor plane, or lighting variation. Do not use #ff00ff anywhere in the subject.
Text: none.
Constraints: clean production sprite art, crisp antialiased edges, no cast shadow, no contact shadow, no reflection, no panel borders, no grid, no labels, no watermark, no signature. Preserve character identity and outfit exactly.
```
## Production image variants

`npm run assets:optimize` creates responsive 256/512/768-pixel WebP portraits
from the original PNGs with quality 88, a 96-pixel lossless WebP SDU mark, and
lossless WebP versions of all five Izumi sprite sheets. Original art and source
attribution are retained above. The site loads the WebP variants directly;
the original PNGs remain editing sources. Sprite frame dimensions, transparency,
and visible pixels are unchanged and checked by the release tests.

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
| `sakurai-izumi-pet.png` | Generated with the built-in ImageGen tool using the [official Nichijou character sheet](https://shinonome-lab.com/character/img/sakurai_01.jpg) as a visual identity reference. | Four-state Q-style sprite generated on a flat magenta key background, then converted locally to an RGBA PNG with soft edge matting and despill. | `94c5eb25ab70abfe360725f469dd80d2beb86662f27d34b21678d1ae5985861d` |
| `izumi-drag-sprite.png` | Generated with the built-in ImageGen tool using the existing homepage Izumi sprite as the strict character and rendering-style reference. | Eight complete poses generated as a 4×2 magenta-key sheet, converted locally with soft edge matting and despill, then normalized into eight equal 480×680 RGBA frames without body-part rigging. | `51c24cd88120c6b90cf49c94a15fe167577773bf3756fe690f308a618a30f7b5` |
| `izumi-turn-sprite.png` | Generated with the built-in ImageGen tool using the existing homepage Izumi sprite as the strict identity, scale, outfit, and rendering reference. | Five complete intermediate turning poses generated on a magenta key, softly matted and despilled, then normalized to equal 480×680 frames with a shared 31px head line and 663px foot baseline. Exact original idle artwork supplies both animation endpoints. | `f2fb820b3670e44fce78a0d986b63f812a08af340e1803c2d1e8c8b0cc85b0b8` |
| `izumi-reaction-sprite.png` | Generated with the built-in ImageGen tool using the existing homepage Izumi sprite as the strict character and rendering-style reference. | Two complete artist and heart-gesture poses generated on a flat magenta key, converted locally with soft edge matting and despill, then normalized without body-part rigging into two equal 480×680 transparent frames with a shared 663px foot baseline. | `8a2b7b51e636b218b76032d0a73ecd96fc7302964976fdb0887456d37e6cd4bd` |

The generated asset is a new simplified rendering for this personal homepage;
it does not copy or crop pixels from the reference sheet. The character and
original design remain the property of their respective rights holders.

### Pet sprite generation prompt

```text
Use case: stylized-concept
Asset type: four-state chibi character sprite sheet for an interactive personal-portfolio web pet
Input images: Image 1 is the official character design reference; use it only to preserve the recognizable character traits and outfit
Primary request: Create one clean horizontal sprite sheet with exactly four equal-width cells showing the same chibi interpretation of Izumi Sakurai from Nichijou, full body and centered in every cell, consistent scale, proportions, outfit, line weight, and baseline.
Subject: adult female English teacher, 2.5-head-tall chibi proportions, sandy light-brown softly wavy bob with outward-flipped ends and one small ahoge, huge dark-brown eyes, gentle childlike face, subtle blush, pale-green cardigan over cream top with white collar, long khaki-beige ankle skirt with a tiny ruffled hem, white socks, simple tan school slippers.
Pose/state per cell, left to right: 1) shy neutral idle, shoulders slightly tucked and both hands held near chest; 2) warm closed-eye blink and tiny smile, one small friendly wave; 3) startled but cute, shoulders raised, small round mouth, two comic sweat droplets and slight hop; 4) sleepy, eyes closed, hands together by cheek, calm tiny sway.
Style/medium: polished flat 2D chibi game-sprite illustration, clean warm-brown outlines, restrained pastel colors, simple readable silhouettes, subtle cel shading, charming and lively, suitable at 96px display height.
Composition/framing: 4 columns in a single row; each character centered with equal generous padding; identical camera and baseline; no overlap between cells; no panel dividers.
Scene/backdrop: perfectly flat solid #ff00ff chroma-key background for local background removal. The entire background must be one uniform color with no shadows, gradients, texture, reflections, floor plane, or lighting variation.
Constraints: use no #ff00ff anywhere in the character; crisp edges; no cast shadow or contact shadow; no text, letters, numbers, symbols, labels, watermark, logo, border, grid, frame, extra characters, props, cropped limbs, or duplicated body parts. Preserve character identity and outfit across all four cells.
Avoid: photorealism, 3D rendering, detailed scenery, exaggerated anxiety, sexualization, child body anatomy; she is a 24-year-old adult rendered in chibi proportions.
```

### Drag-reaction sprite generation prompt

```text
Use case: illustration-story
Asset type: high-resolution 2D website desktop-companion sprite sheet
Primary request: Create eight new full-body animation poses for the same chibi character shown in the reference, arranged as an exact 4-column by 2-row sprite sheet. The input sprite is the strict character-design and rendering-style reference, not an edit target.
Subject invariants: preserve the same character identity and proportions in every cell: short light-brown bob haircut with one ahoge, large warm-brown eyes, pale green cardigan, cream collared blouse, ankle-length beige skirt, white socks, beige-brown shoes. Preserve the clean soft anime linework, subtle watercolor-like shading, and cute mature—not toddlerish—expression design.
Panel order, left-to-right then top-to-bottom: 1) pickup anticipation; 2) just lifted with naturally dangling feet; 3) happy carried sway A; 4) complementary carried sway B; 5) released in midair; 6) soft landing crouch with tiny dust puffs; 7) relieved rebound hop; 8) recovered celebration with a cheerful wave.
Composition: exact uniform 4×2 grid, one complete character per equal cell, consistent scale and visual center, generous padding, no overlap, no borders, labels, or text.
Scene/backdrop: perfectly flat solid #ff00ff chroma-key background across the entire canvas, including between cells. No shadows, gradients, texture, floor plane, reflections, or lighting variation.
Constraints: every pose is a complete coherent drawing with natural anatomy and consistent face, hair, clothing, palette, line thickness, and lighting. No body-part rig fragments, cast shadow, contact shadow, watermark, signature, cropped limbs, extra limbs, malformed hands, identity drift, scenery, or props. Do not use #ff00ff in the subject.
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

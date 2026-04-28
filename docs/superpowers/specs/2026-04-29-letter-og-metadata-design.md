# Design Spec: Letter Open Graph & Metadata

**Date:** 2026-04-29
**Author:** Antigravity

## 1. Objective
Add static Open Graph (OG) tags and metadata for the handwritten letter page (`/letter/[code]`) to ensure a premium presentation when sharing links on social media (Facebook, Zalo, etc.), while maintaining privacy for the letter content.

## 2. Requirements
- Use a fixed title and description for all letter pages.
- Set `robots: { index: false, follow: false }` to prevent search engine indexing.
- Include a high-quality, premium OG image.

## 3. Implementation Details

### 3.1 Metadata Configuration
Modify `app/letter/[code]/page.jsx` to export the following metadata:

```javascript
export const metadata = {
  robots: { index: false, follow: false },
  title: 'Bạn có một bức thư tay — yunkhngn.dev',
  description: 'Một bức thư tay đặc biệt đang đợi bạn mở ra xem. Hãy nhấn vào để đọc nhé.',
  openGraph: {
    title: 'Bạn có một bức thư tay',
    description: 'Một bức thư tay đặc biệt đang đợi bạn mở ra xem.',
    url: 'https://yunkhngn.dev/letter',
    siteName: 'yunkhngn.dev',
    images: [
      {
        url: '/image/letter_og.png',
        width: 1200,
        height: 630,
        alt: 'Bức thư tay đặc biệt',
      },
    ],
    type: 'website',
  },
};
```

### 3.2 Asset Generation
- Generate a premium OG image named `letter_og.png` and save it to `/public/image/`.
- Prompt for generation: A premium, dark-themed image of a handwritten letter with a wax seal and gold accents, 1200x630 resolution.

## 4. Verification
- Verify the metadata tags are present in the server-rendered HTML.
- Verify the OG image is accessible at `/image/letter_og.png`.

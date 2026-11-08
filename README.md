# A Little World Made Just for You

An interactive birthday surprise website: 13 animated chapters, hand drawn SVG characters,
a scrapbook, open when letters, mini games, a birthday cake, a long letter, a starry sky of wishes,
a gift box and a final note. Built with React, TypeScript, Vite and Framer Motion.
Created by Sachin (@nyxsachin).

## 1. Run it on your computer

You need Node.js 18 or newer.

    npm install
    npm run dev

Open the address it prints (usually http://localhost:5173).

To test the production build:

    npm run build
    npm run preview

## 2. Personalize it (one file only)

Open `src/content.ts`. Everything the recipient reads lives there.

| What | Where in content.ts |
| --- | --- |
| Her or his name | `recipientName` (replaces every {name}) |
| Nickname, birthday date | `nickname`, `birthdayDate` (leave empty to hide) |
| Your name and Instagram | `creatorName`, `instagram`, `instagramUrl` |
| Relationship | `relationship`: partner, crush, best-friend or someone-special |
| Mascot | `animal`: teddy, bear, bunny or cat |
| Favorite color | `accentColor`, for example '#C77D9A' |
| Real memories in the letter | `letter.personalParagraph` |
| Romantic paragraph (only used for partner or crush) | `letter.romanticParagraph` |
| Photo captions | `scrapbook.photos` |
| Open when letters, wishes, star wishes | `openWhen`, `wishes`, `sky` |
| Final note | `final` |

Honest note: the qualities cards, reasons and wishes are warm general lines. Edit any line that
is not true for this person. Nothing in the site claims a shared memory unless you write it.

### Photos

1. Put images in `public/photos/` (resize to about 1400px wide first).
2. List them in `content.scrapbook.photos`:

       photos: [
         { src: '/photos/one.jpg', caption: 'A little moment worth keeping.' },
         { src: '/photos/two.jpg', caption: 'One of my favorite little memories.' },
       ],

Until you add photos, illustrated placeholders are shown. A photo that fails to load
falls back to a placeholder, so the page never shows a broken image.

### Music

The sound button is off until the visitor taps it. By default it plays a soft built in music box
melody generated in the browser (no file, no copyright issue).
To use your own song, put a licensed file in `public/music/` and set `music.src: '/music/song.mp3'`.
Only use music you have the right to share. A song link (Spotify, YouTube) can go in `gift.songLink`.

### Video gift

Put a short video in `public/` (for example `public/gift.mp4`) and set `gift.videoSrc: '/gift.mp4'`.
Keep it small (under 30 MB) so it loads fast on phones.

## 3. Publish on Vercel

Option A, drag and drop (no account setup needed beyond Vercel):

1. Run `npm run build`.
2. Go to vercel.com, create a new project, and upload the `dist` folder.

Option B, with GitHub:

1. Push this folder to a GitHub repository. Use a PRIVATE repository if it holds personal
   photos. (`.gitignore` already excludes `public/photos` and `public/music`; remove those two lines
   if your repository is private and you want the photos deployed from Git.)
2. On vercel.com choose Add New, Project, import the repository.
3. Vercel detects Vite automatically (build command `npm run build`, output `dist`).
4. Click Deploy. You get a link like https://your-project.vercel.app. Send that link.

Tip: in Vercel project settings you can change the domain name to something personal.

## 4. Accessibility and comfort

* Every button works with keyboard and touch. Arrow keys move between chapters.
* "Calm mode" (top right) skips animations. The site also follows the device's reduced motion setting.
* Music never autoplays.
* No analytics, no tracking, no backend, no login.

## 5. What is not included

* Blowing out candles with the microphone is not implemented on purpose, so no microphone
  permission is ever requested. The candles go out with a tap.
* The gift's video, song link and photo collage appear only if you supply them. While developing
  you will see a note about this. It never shows on the published site.
* Google Fonts (Playfair Display, Cormorant Garamond, Inter, Caveat) load from the internet.
  If they are blocked, elegant system serif and handwriting fallbacks are used.

## Project structure

    src/content.ts        all editable text and settings
    src/App.tsx           chapter flow, navigation, progress
    src/chapters/         the 13 chapters
    src/components/       illustrations, confetti, envelope, shell
    src/audio.ts          optional music
    src/*.css             design system and animation

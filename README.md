# A Little World Made Just for You (multi-person edition)

An interactive birthday surprise website with 13 animated chapters, now a small **platform**:
you log in to a private admin panel, create one page per person, upload photos and music,
and send each person their own secret link. Built with React, TypeScript, Vite and Framer Motion.
Data lives in Supabase (free plan is enough). Vercel only hosts the static site.
Created by Sachin, Instagram [@nyxsachin](https://instagram.com/nyxsachin).

How it works in one minute:

* `https://your-site.vercel.app/w/aanya-k7x2m` is the surprise page for one person (hard-to-guess link).
* `https://your-site.vercel.app/admin` is your private admin panel (login needed).
* `https://your-site.vercel.app/` is a tiny neutral page. Search engines are told not to index anything.
* `src/content.ts` is still the **default template**. Whatever you type in the admin panel is stored in the
  database and laid over those defaults.

---

## Setup for a beginner (about 20 minutes)

### Step 1. Install the tools

1. Install Node.js 18 or newer from https://nodejs.org (choose LTS).
2. Open the project folder in VS Code, open the terminal (Ctrl + `) and run:

       npm install

### Step 2. Create the Supabase project (free)

1. Go to https://supabase.com, sign in with GitHub, click **New project**.
2. Give it a name, set a database password (save it somewhere), choose the nearest region, click **Create**.
3. Wait one or two minutes until it is ready.

### Step 3. Create the database tables

1. In Supabase click **SQL Editor** (left menu), then **New query**.
2. Open `supabase/schema.sql` from this project, copy everything, paste it, click **Run**.
   You should see "Success". It is safe to run again later.
3. The admin email is already set to `sachinkrcodes@gmail.com`. To use another email, change it in the
   `is_admin()` function near the top of the file (one place only) before you run it.

### Step 4. Create your admin account, then lock signups

1. Supabase, **Authentication**, **Users**, **Add user**, **Create new user**.
   Use the SAME email as in `is_admin()`, choose a strong password, and tick **Auto Confirm User**.
2. Then go to **Authentication**, **Sign In / Providers** (older dashboards: Settings) and turn **OFF**
   "Allow new users to sign up". Now nobody else can ever create an account.

### Step 5. Connect the website to Supabase

1. Supabase, **Project Settings**, **API**. Copy the **Project URL** and the **anon public** key.
   Never copy or use the `service_role` key anywhere in this project.
2. In the project folder copy `.env.example` to `.env.local` and fill in:

       VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
       VITE_SUPABASE_ANON_KEY=eyJ...your anon key...

3. Run `npm run dev` and open http://localhost:5173/admin. Log in. Press **New page**.

### Step 6. Put it online with Vercel

1. Push the project to GitHub (private repository is best).
2. On https://vercel.com, **Add New, Project**, import the repository.
3. Before clicking Deploy, open **Environment Variables** and add the same two values
   (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
4. Click **Deploy**. Your admin panel is at `https://YOUR-SITE.vercel.app/admin`.

Changed an environment variable later? Redeploy, because Vite bakes them in at build time.

---

## Using the admin panel

1. **New page**, type the name. A draft with a random link is created.
2. Edit the sections (Basics, Letter, Wishes, Open-when letters, Final note, Gift, Photos, Music, Settings).
   Every field starts with the default text. **Reset to default** appears when you change one.
3. **Live preview** shows your unsaved changes in a phone or desktop frame. It never counts as a view.
4. **Save changes**, then **Publish**. Drafts cannot be opened by anyone.
5. **Share**: copy the link, send on WhatsApp, or download the QR code.

Other things you can do: unlock date/time (visitor sees a countdown, using server time), secret PIN
(checked on the server, 5 wrong tries = 5 minute pause), expiry date, Duplicate (photos are copied),
Export / Import JSON as a backup, Delete (also removes the photos and music from storage).

Photos: up to 12, resized to 1400 px and saved as WebP (JPEG on browsers that cannot make WebP).
Music: built-in music box, an MP3 up to 8 MB (you must tick "I have the right to use this song"),
or a direct link to an audio file. Music never autoplays.

## Themes, poems and wishes (admin)

* **Look and feel**: pick a theme (classic rose, cat, dog, ocean and fish, mountains, ice and snow, jungle,
  maple leaves, anime and sakura, galaxy, flower garden, roses, sunflowers, tulips, lotus). It changes the
  colours of every chapter and adds slow floating decorations. You can also choose how many float, turn the
  tap-to-pop emojis on or off, and pick a mascot (teddy, bear, bunny, kitten, puppy).
* **Wishes**: write your own, or press "Add ready-made wishes".
* **Poems and lines**: a new chapter. Add your own poems, lines and wishes, or pick from the ready-made English library.
  Use `{name}` for the person's name.
* People who turned on "reduce motion" in their phone settings see no floating decorations.

## Two-step login and forgot password

**Turn on the authenticator code (recommended)**
1. Supabase, **SQL Editor**, **New query**. Paste the file `supabase/two-step.sql`, click **Run**. (Do this once.)
2. Open `/admin`, log in, click **Account**, **Two-step verification**, **Turn on**.
3. Install Google Authenticator (or Microsoft Authenticator) on your phone, scan the QR code, type the 6-digit code.
4. Save the secret key shown under the QR (a screenshot in a safe place is fine). It is your backup.
5. Test in a private/incognito window: password, then code. Only then close your normal window.

From then on the database itself refuses admin actions unless the code step was passed.

**If you lose your phone:** Supabase, SQL Editor, run
`delete from auth.mfa_factors where user_id = (select id from auth.users where email = 'YOUR_ADMIN_EMAIL');`
Then log in with the password only and turn two-step on again.

**Forgot password setup (once):** Supabase, **Authentication**, **URL Configuration**.
Set **Site URL** to your live address (for example `https://birthday-sachinkrcodes.vercel.app`) and add these under **Redirect URLs**:
`https://birthday-sachinkrcodes.vercel.app/admin` and `http://localhost:5173/admin`.
Supabase's built-in email sends only 2 emails per hour for the whole project, so use "Forgot password?" sparingly.
If two-step is ON, the reset link also asks for the 6-digit code before you can set a new password.

## Security notes (honest version)

* The anon key is public by design. What protects your data is Row Level Security in `schema.sql`:
  visitors cannot read the `pages` table at all. They can only call `get_page(slug, pin)`, which returns
  one published, unlocked, unexpired page and never returns the PIN.
* Only the admin email can create, edit, list or delete pages and files.
* The storage bucket is public for reading: anyone who has an exact photo link can see that photo,
  but nobody can list the files. Photo names are random.
* A link is a secret only as long as you keep it private. Anyone with the link (and PIN) can open the page.
* The PIN is 4 to 8 digits, so it is a light lock, not strong security.

## Customizing the defaults

Open `src/content.ts`. Every default text lives there. The admin panel edits a page's own copy on top of it.
Branding (creator name and Instagram) is fixed in `content.ts` and is not changed per page.

## Accessibility and comfort

* Buttons work with keyboard and touch. Arrow keys move between chapters.
* "Calm mode" (top right) skips animations. The site also follows the device's reduced-motion setting.
* No analytics, no tracking, no paid services.

## Project structure

    supabase/schema.sql      tables, security rules, functions, storage
    src/main.tsx             routes: /w/:slug, /admin, /
    src/loadContent.ts       loads a page and merges it over content.ts
    src/lib/                 Supabase client, safe merge, slug maker, types
    src/pages/               loading, countdown, PIN, "no longer here" screens
    src/admin/               admin panel (separate chunk, visitors never download it)
    src/content.ts           default template (all text)
    src/chapters/            the 13 chapters (lazy loaded)

## Troubleshooting

* **Admin says "Setup needed"**: the two environment variables are missing. Restart `npm run dev` after creating `.env.local`.
* **"No access"**: you logged in with an email that is not in `is_admin()`.
* **Upload fails**: check that `schema.sql` ran fully (it creates the `birthday-media` bucket and its rules).
* **A link shows "no longer here"**: the page is still a draft, expired, or the link is mistyped.

/* ==========================================================================
   EDIT THIS FILE TO PERSONALIZE THE WEBSITE.
   Everything the recipient reads lives here. You never need to touch the
   components to change names, wishes, captions, letters or the final note.

   Tokens you can use inside any text:
     {name}     becomes the recipient's name
     {creator}  becomes your name
   ========================================================================== */

export type Animal = 'teddy' | 'bunny' | 'cat' | 'bear' | 'dog';
export type ThemePack = 'classic' | 'cat' | 'dog' | 'fish' | 'mountain' | 'ice' | 'jungle' | 'maple' | 'anime' | 'galaxy' | 'garden' | 'rose' | 'sunflower' | 'tulip' | 'lotus';
export type Energy = 'calm' | 'normal' | 'lively';
export type PieceKind = 'poem' | 'quote' | 'wish';
export type Relationship = 'partner' | 'crush' | 'best-friend' | 'someone-special';
export type ArtKey =
  | 'teddy'
  | 'sunflower'
  | 'kitten'
  | 'cocoa'
  | 'moon'
  | 'flowers'
  | 'pocketStar'
  | 'song'
  | 'home';

export interface Photo {
  src: string; // for example '/photos/memory1.jpg' (file inside public/photos)
  caption: string;
  alt?: string;
}

export const content = {
  /* ---------------------------------------------------------------- 1. BASICS */
  recipientName: '[Name]', // CHANGE ME, for example 'Aanya'
  nickname: '', // optional cute nickname, used in a few small places
  birthdayDate: '', // optional, for example '18 October'. Leave '' to hide it.
  creatorName: 'Sachin',
  creatorHandle: '@sachinkrcodes',
  creatorUrl: 'https://github.com/sachinkrcodes',

  /* partner or crush adds your optional romantic paragraph to the letter.
     best-friend or someone-special keeps everything warm but platonic. */
  relationship: 'someone-special' as Relationship,

  /* teddy, bear, bunny or cat: changes the little mascot everywhere */
  animal: 'teddy' as Animal,

  /* Optional favorite color (hex). Leave '' to keep the default dusty rose. */
  accentColor: '',

  /* Look and feel. pack changes the colours and the floating animation
     (cats, dogs, fish, mountains, snow, jungle, maple leaves, anime, galaxy).
     energy = how many things float. tapBurst = little pop when she/he taps the screen. */
  theme: {
    pack: 'classic' as ThemePack,
    energy: 'normal' as Energy,
    tapBurst: true,
  },

  /* ------------------------------------------------------------------ MUSIC */
  music: {
    /* Optional. A licensed audio file you put in public/music, for example
       '/music/song.mp3'. Leave '' to use the built-in soft music box melody. */
    src: '',
    title: '', // optional, shown in the sound button label
  },

  /* ---------------------------------------------------------------- CHAPTERS */
  chapterTitles: [
    'The little envelope',
    'Happy birthday',
    'If you were a little world',
    'Things that make you, you',
    'A little photo scrapbook',
    'Little things I wish for you',
    'A few lines for you',
    'A few little notes',
    'A tiny game',
    'The birthday cake',
    'The most important letter',
    'A universe of wishes',
    'Your birthday gift',
    'The last little note',
  ],

  opening: {
    heading: 'pssst... someone very special has a birthday ♡',
    sub: 'And I made a little something just for you.',
    button: 'Open your little surprise ♡',
    noteTo: 'for {name}', // handwritten note on the envelope
    noteInside: 'tap again to begin',
  },

  reveal: {
    heading: 'Happiest birthday, {name} ♡',
    message:
      'Today, the world gets to celebrate someone who makes it a little more beautiful just by being in it.',
    button: "Okay, but there's more...",
  },

  comparisons: {
    heading: 'If I had to describe you using the cutest things...',
    hint: 'Tap a card to see what else I wanted to say.',
    cards: [
      {
        art: 'teddy',
        text: "You'd be a teddy bear, because some people just feel like a hug.",
        hidden: 'Consider this a very small, very sincere hug from me.',
      },
      {
        art: 'sunflower',
        text: "You'd be a little sunflower, because even ordinary days feel brighter around you.",
        hidden: 'Ordinary days, just with better lighting.',
      },
      {
        art: 'kitten',
        text: "You'd be a sleepy kitten, because you somehow make doing absolutely nothing look adorable.",
        hidden: 'Doing nothing is an art form, and you are allowed to practice it.',
      },
      {
        art: 'cocoa',
        text: "You'd be a warm cup of cocoa on a rainy day, the kind of comfort nobody wants to rush.",
        hidden: 'Some comforts are worth taking slowly.',
      },
      {
        art: 'moon',
        text: "You'd be a little moon, quietly making even the darkest nights feel less lonely.",
        hidden: 'Even a quiet light is still a light.',
      },
      {
        art: 'flowers',
        text: "You'd be a field of flowers, because there is something beautiful about the way you exist without even trying.",
        hidden: 'Some things bloom simply because the world is kind enough to let them.',
      },
      {
        art: 'pocketStar',
        text: "You'd be a tiny star tucked into someone's pocket, something precious they would want to keep close.",
        hidden: 'Small, bright, and completely worth keeping.',
      },
      {
        art: 'song',
        text: "You'd be a favorite song, because even after hearing it a hundred times, it still feels special.",
        hidden: 'Some things never get old. They only get more familiar.',
      },
      {
        art: 'home',
        text: "You'd be a little home with warm lights, because some people make you feel like you belong.",
        hidden: 'Warm lights, an open door, and always enough room.',
      },
    ] as { art: ArtKey; text: string; hidden: string }[],
  },

  qualities: {
    heading: 'Things that make you, you.',
    hint: 'Tap a little card to open it.',
    /* Edit these so they match the real person. Only keep what is true. */
    cards: [
      { title: 'Your smile', line: 'Your smile deserves its own little corner of sunshine.' },
      {
        title: 'The way you talk about things you love',
        line: "When you talk about what you love, it's hard not to listen a little closer.",
      },
      {
        title: 'Your little habits',
        line: 'Your little habits are the tiny details that make you unmistakably you.',
      },
      { title: 'Your laugh', line: 'Some laughs are just sounds. Yours feels like a small celebration.' },
      { title: 'Your kindness', line: 'Your kindness is quiet, and somehow that makes it louder.' },
      {
        title: 'Your random thoughts',
        line: "Your random thoughts are the plot twists I never knew I needed.",
      },
      {
        title: 'Your sleepy moments',
        line: 'Even your sleepy moments are a reminder that rest can look lovely.',
      },
      {
        title: 'Ordinary conversations',
        line: 'Somehow, ordinary conversations feel a little more worth remembering with you in them.',
      },
      {
        title: 'The little things you do not notice',
        line: 'Never underestimate the magic of being yourself. It suits you beautifully.',
      },
    ],
  },

  scrapbook: {
    heading: 'A little photo scrapbook',
    sub: 'Tiny pieces of time, kept safe.',
    /* ADD YOUR PHOTOS HERE. Put the files in public/photos first.
       Example:
         { src: '/photos/one.jpg', caption: 'A little moment worth keeping.' }
       Leave the list empty to show illustrated placeholders. */
    photos: [] as Photo[],
    placeholderCaptions: [
      'A little moment worth keeping.',
      'One of my favorite little memories.',
      'If I could save a feeling as a photograph...',
      'A moment that deserves to stay.',
      'Proof that the simplest moments can become the sweetest memories.',
    ],
    /* Optional real memories, shown as little handwritten notes.
       Only add things that really happened. Leave empty to hide. */
    memories: [] as { title: string; text: string }[],
  },

  wishes: {
    heading: 'If I could wish you a hundred little things...',
    button: 'Show me the next wish',
    items: [
      'I hope you wake up feeling excited about the life waiting for you.',
      'I hope you always have someone who listens to the things you cannot easily explain.',
      'I hope you find reasons to laugh on the days that ask too much of you.',
      'I hope you never feel that you have to become someone else to deserve kindness.',
      'I hope your dreams grow bigger than your fears.',
      "I hope you experience the kind of happiness that doesn't need to be photographed to feel real.",
      'I hope the world gives back some of the gentleness you give to others.',
      'I hope you have quiet mornings, beautiful surprises, comforting hugs, and people who mean what they say.',
      'I hope you never forget that your existence matters beyond what you achieve or what you do for anyone else.',
      'And most of all, I hope this new chapter gives you more reasons to smile than you can count.',
    ],
  },

  poems: {
    heading: 'A few lines, just for you',
    hint: 'Tap the arrows to read the next one.',
    items: [
      {
        kind: 'poem' as PieceKind,
        title: 'Today',
        text: 'Today the clock moves a little slower,\nso the day can stay with you longer.\nMay every candle you blow out\ncarry a wish that grows stronger.\n\nHappy birthday, {name}.',
        by: '',
      },
      {
        kind: 'quote' as PieceKind,
        title: '',
        text: 'You do not need to become anyone new this year.\nJust more of who you already are.',
        by: '',
      },
      {
        kind: 'poem' as PieceKind,
        title: 'A small wish',
        text: 'May your mornings begin with a smile,\nmay your evenings end in peace,\nand may everything your heart quietly asks for\nfind its way to you this year.',
        by: '',
      },
    ],
  },

  openWhen: {
    heading: 'A few little notes, just in case.',
    hint: 'Open one whenever you need it. They will wait for you.',
    letters: [
      {
        label: 'Open when you need a smile.',
        short: 'a smile',
        title: 'For a little smile',
        body: "Hey, you. Yes, you. I hope something ridiculously small makes you happy today. A good song, a perfect snack, a silly video, or even this tiny corner of the internet reminding you that you deserve lovely things.",
      },
      {
        label: "Open when you're having a difficult day.",
        short: 'a hard day',
        title: 'For a difficult day',
        body: "You don't have to turn every difficult day into a lesson. Sometimes, getting through it is enough. Rest a little, breathe a little, and give yourself the same patience you would offer someone you care about.",
      },
      {
        label: 'Open when you need a little confidence.',
        short: 'confidence',
        title: 'For a little confidence',
        body: "Please don't measure your worth by one bad day, one mistake, or somebody else's opinion. There is so much more to you than the things you are still figuring out.",
      },
      {
        label: 'Open when you feel overwhelmed.',
        short: 'overwhelm',
        title: 'For an overwhelming day',
        body: "You can take things one step at a time. You don't have to solve your entire life before tonight. Let yourself pause. The world can wait a little.",
      },
      {
        label: 'Open when you want to remember how special you are.',
        short: 'a reminder',
        title: 'For a reminder',
        body: "You are not special only when you are smiling, successful, helpful, or easy to understand. You are a whole person, and you deserve kindness on the ordinary days, too.",
      },
    ],
  },

  games: {
    heading: 'How much birthday cuteness can you handle?',
    sub: 'Totally optional. Totally cute.',
    hearts: {
      title: 'Catch the hearts',
      help: 'Tap the floating hearts. Collect five and see what happens.',
      goal: 5,
      done: "Congratulations! You've collected a pocketful of birthday love.",
    },
    gifts: {
      title: 'Choose a little gift',
      help: 'Pick one of the three boxes.',
      items: [
        { label: 'A tiny compliment', text: 'You make the world feel a little softer just by being in it.' },
        {
          label: 'A funny birthday note',
          text: 'You are not getting older. You are just unlocking more cake privileges.',
        },
        { label: 'A heartfelt wish', text: 'May this year hand you quiet joy, loud laughter, and everything in between.' },
      ],
    },
    star: {
      title: 'Find the hidden star',
      help: 'There is a tiny star hiding somewhere in this little garden. Can you spot it?',
      found:
        'Psst... your bonus surprise is that you are wonderfully, unapologetically you. Never lose that.',
    },
  },

  cake: {
    heading: 'Make a little wish, birthday human.',
    button: 'Blow out the candles ♡',
    relight: 'Light them again',
    reveal:
      'I hope at least one of the wishes you make today finds its way into your life, even if it takes a little time.',
  },

  letter: {
    heading: "Before you go, there's something I want you to know.",
    envelopeHint: 'Tap the envelope to unfold your letter.',
    greeting: 'Dear {name},',
    paragraphs: [
      'I could have made you a simple birthday card, written a few lines, and wished you a wonderful year ahead. But somehow, that felt too small for what I wanted to say.',
      'So I made you this little place. A few colors, a few silly things, a few wishes, and a handful of words I hope stay with you a little longer than the time it takes to read them.',
      'I hope this year brings you closer to the things your heart has been quietly wishing for. I hope you meet beautiful opportunities, discover new reasons to believe in yourself, and find happiness in places you never expected.',
      "And on the days when life feels ordinary, I hope you remember that ordinary doesn't mean meaningless. Some of the most beautiful things happen quietly, without a grand announcement.",
      "You don't have to be perfect to be appreciated. You don't have to have everything figured out to deserve wonderful things. And you never need to make yourself smaller to fit into a world that hasn't fully understood you yet.",
      'Today is about celebrating you, not just the birthday on your calendar, but the person behind it. The person with their own thoughts, little habits, hopes, fears, dreams, and a whole world that nobody else can experience in exactly the same way.',
      'I hope you laugh until your cheeks hurt. I hope your favorite things find their way to you. I hope you receive the kind of care that makes you feel safe enough to be yourself.',
      "And I hope that when you look back on this year, you'll find moments that make you smile and think, “I'm really glad I got to experience that.”",
      'Thank you for being the person you are.',
    ],
    /* Shown only when relationship is 'partner' or 'crush'. Write it in your own
       words, from the heart, and keep it free of pressure. Leave '' to skip. */
    romanticParagraph: '',
    /* Add real, specific memories here to make the letter truly yours.
       Example: 'I still think about the evening we talked until the stars came out.' */
    personalParagraph: '',
    closing: [
      'Happy birthday, {name}.',
      'May life be gentle with you, may your dreams find room to grow, and may you always have something beautiful to look forward to.',
    ],
    signOff: 'With the warmest wishes,',
    signature: '{creator} ♡',
  },

  sky: {
    heading: 'If I could put a thousand wishes into the sky for you...',
    hint: 'Tap the stars.',
    wishes: [
      'A year filled with genuine laughter.',
      'A dream that finally comes true.',
      'A friendship that feels like home.',
      'A beautiful surprise on an ordinary Tuesday.',
      'The courage to start again.',
      'More peace than worry.',
      'People who celebrate your growth.',
      'A thousand tiny reasons to keep smiling.',
      'Beautiful memories you have not made yet.',
      'A future that feels right for you.',
    ],
    finale:
      "Even the sky would run out of stars before I'd run out of good things to wish for you.",
    finaleButton: 'Back to the light',
  },

  gift: {
    heading: 'Okay... one last little surprise.',
    button: 'Unwrap your gift.',
    /* All of these are optional. Anything left empty is simply not shown. */
    videoSrc: '', // for example '/music/video.mp4' (file inside public)
    videoCaption: 'A little video, just for you.',
    songLink: '', // a link to a song or playlist you are allowed to share
    songLabel: 'A song I hope you like',
    reasonsHeading: 'A few reasons you are appreciated',
    /* Edit these so they are true for the person. */
    reasons: [
      'Because you deserve a day that is completely about you.',
      'Because you make ordinary moments feel a little softer.',
      'Because kindness looks good on you.',
      'Because the world is gentler with you in it.',
    ],
    showCollage: true, // uses your photos if you added any
    downloadLabel: 'Download your letter',
    secretHeading: 'A final secret message',
    secret: 'You are loved more than you probably know. Happy birthday.',
  },

  final: {
    heading: 'One last thing, birthday star...',
    paragraphs: [
      'Of all the days in the year, today is a lovely reminder that the world became a little more interesting because you arrived in it.',
      'I hope you feel celebrated today, appreciated tomorrow, and surrounded by beautiful little reasons to be happy throughout the year.',
      'You deserve a birthday that makes you smile long after the candles are gone.',
      'Happy birthday, {name}. ♡',
    ],
    finalNoteTop: 'And if you ever wonder whether all these little details were worth it...',
    finalNoteBottom: 'Look at the smile I hope they put on your face.',
    signature:
      'Made with a little time, a lot of thought, and the warmest wishes by {creator}.',
    replay: 'Read it all again ♡',
    chaptersLabel: 'Revisit a chapter',
  },
};

export type Content = typeof content;

/* Replaces {name} and {creator}, and turns straight apostrophes into curly ones. */
export function fill(text: string): string {
  const name = content.recipientName;
  return text
    .replace(/\{name\}/g, name)
    .replace(/\{creator\}/g, content.creatorName)
    .replace(/'/g, '’');
}

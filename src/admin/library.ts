/* Ready-made lines, all original and all in English. Use {name} where the person's name should appear. */
export type Mood = 'general' | 'friend' | 'love' | 'family' | 'funny' | 'nature';
export interface Piece {
  kind: 'poem' | 'quote' | 'wish';
  mood: Mood;
  title: string;
  text: string;
}

export const MOODS: { value: Mood | 'all'; label: string }[] = [
  { value: 'all', label: 'All moods' },
  { value: 'general', label: 'For anyone' },
  { value: 'friend', label: 'Best friend' },
  { value: 'love', label: 'Love' },
  { value: 'family', label: 'Family' },
  { value: 'funny', label: 'Funny' },
  { value: 'nature', label: 'Nature and themes' },
];

export const PIECES: Piece[] = [
  { kind: 'poem', mood: 'general', title: 'Today', text: 'Today the clock moves a little slower,\nso the day can stay with you longer.\nMay every candle you blow out\ncarry a wish that grows stronger.\n\nHappy birthday, {name}.' },
  { kind: 'poem', mood: 'general', title: 'Another lap around the sun', text: 'You have gone around the sun once more,\nand the sky is a little brighter for it.\nMay this year open every door\nyou were too shy to knock on.\n\nMay luck find you without being asked,\nand joy arrive before it is expected.' },
  { kind: 'poem', mood: 'general', title: 'Little wishes', text: 'May your mornings start with a smile,\nmay your evenings end in peace,\nand may everything your heart quietly asks for\nfind its way to you this year.' },
  { kind: 'poem', mood: 'general', title: 'The brightest part', text: 'Some people are the brightest part\nof an ordinary day.\nA laugh, a look, a kind word,\nand the worry goes away.\n\nYou are that person, {name}.\nHappy birthday.' },
  { kind: 'poem', mood: 'friend', title: 'For my friend', text: 'Some people feel like a place to rest,\nnot a place to prove yourself.\nYou are that for me: easy laughter,\nand a calm that no one else has.\n\nMay this year be as kind to you\nas you have always been to us.' },
  { kind: 'poem', mood: 'friend', title: 'Chosen family', text: 'Out of everyone in this big world,\nI am glad it was you I found.\nThrough every mess and every win,\nyou were simply always around.\n\nHere is to another year, {name},\nand to many more laughs on the ground.' },
  { kind: 'poem', mood: 'love', title: 'Quietly', text: 'I will not write you a grand poem.\nI will say it small and true:\nthe ordinary days feel brighter\nbecause one of them has you.\n\nHappy birthday, my favourite person.' },
  { kind: 'poem', mood: 'love', title: 'My favourite place', text: 'Not a city, not a shore,\nnot the tallest mountain peak.\nMy favourite place is wherever you are,\nand that is all I seek.' },
  { kind: 'poem', mood: 'family', title: 'Home', text: 'You are the part of home\nthat does not live in a house.\nThe voice that says "eat something",\nthe hand that holds without a sound.\n\nMay every blessing you ever gave\ncome back to you tenfold.' },
  { kind: 'poem', mood: 'funny', title: 'Crowded cake', text: 'One more candle on the cake,\nso the cake is getting crowded.\nBut you still look like trouble,\nand we mean that in the best way.\n\nEat the cake. Age is only a number\nthat nobody asked for.' },
  { kind: 'poem', mood: 'nature', title: 'Four seasons', text: 'May your spring bring new beginnings,\nyour summer long golden light,\nyour autumn a gentle slowing,\nand your winter warm company at night.' },
  { kind: 'poem', mood: 'nature', title: 'Climb', text: 'May the mountains you climb this year\nbe smaller than your courage,\nand may the view from the top\nmake every tired step worth it.\n\nHappy birthday. Keep climbing.' },
  { kind: 'poem', mood: 'nature', title: 'Tide', text: 'May good things come to you like the tide,\ncertain, patient, again and again.\nMay you float through the heavy days\nand swim hard toward the ones you want.' },
  { kind: 'poem', mood: 'nature', title: 'Grow wild', text: 'May you grow the way the jungle does,\nwild and green and unafraid,\nreaching for light through the tallest trees,\nrooted in the love you have made.' },
  { kind: 'poem', mood: 'nature', title: 'Under the stars', text: 'Out of all the stars in the sky,\nsomehow I got to know you.\nHappy birthday to the brightest one\nin my small corner of the night.' },
  { kind: 'poem', mood: 'nature', title: 'Bloom', text: 'Flowers do not hurry to bloom.\nThey wait for the sun, they take their time,\nand then they open, all at once,\nand the whole garden feels sublime.\n\nMay this be your blooming year, {name}.' },
  { kind: 'poem', mood: 'nature', title: 'Petals', text: 'A rose for the days you were brave,\na sunflower for the days you smiled,\na lotus for the days you stayed calm,\nand a tulip for the child inside.' },
  { kind: 'poem', mood: 'nature', title: 'Leaves', text: 'The maple lets its leaves go\nand still the tree stays beautiful.\nMay you let go of what is heavy\nand keep everything that is wonderful.' },
  { kind: 'poem', mood: 'nature', title: 'Snow', text: 'May your year be quiet like snowfall,\nsoft on the shoulders, gentle on the ground,\nand may warm company find you\nin every cold place you have found.' },
  { kind: 'poem', mood: 'nature', title: 'Main character', text: 'In every story, one person walks in\nand the whole room starts to glow.\nYou are the main character here, {name},\nand no plot twist can change that, you know.\n\nNew year, new chapter, new power.' },
  { kind: 'poem', mood: 'nature', title: 'Like a cat', text: 'May your year be soft like a sleeping cat,\nstubborn about the things that matter,\nplayful when no one is watching,\nand always landing on its feet.' },
  { kind: 'poem', mood: 'nature', title: 'Like a dog', text: 'May your year be like a happy dog at the door:\nfull of joy for ordinary things,\nfaithful to the ones you love,\nand ready for any adventure that comes wagging.' },

  { kind: 'quote', mood: 'general', title: '', text: 'Some people make the world softer just by being in it.\nYou are one of them.' },
  { kind: 'quote', mood: 'general', title: '', text: 'You do not need to become anyone new this year.\nJust more of who you already are.' },
  { kind: 'quote', mood: 'general', title: '', text: 'May this year be kind to your heart\nand generous to your dreams.' },
  { kind: 'quote', mood: 'general', title: '', text: 'The best part of your birthday is that the world\ngets to celebrate you for a whole day.' },
  { kind: 'quote', mood: 'friend', title: '', text: 'Good friends are the family we get to choose.\nI am glad I chose you.' },
  { kind: 'quote', mood: 'love', title: '', text: 'If I could keep one day forever,\nit would be any day with you.' },
  { kind: 'quote', mood: 'family', title: '', text: 'Whatever I became, a lot of it began with you.\nThank you, and happy birthday.' },
  { kind: 'quote', mood: 'funny', title: '', text: 'You are not getting older.\nYou are a limited edition.' },
  { kind: 'quote', mood: 'funny', title: '', text: 'Birthdays are nature\'s way of telling you\nto eat more cake.' },

  { kind: 'wish', mood: 'general', title: 'My wish', text: 'I wish that this year you are loved loudly, understood quietly,\nand never have to wonder where you stand\nwith the people who matter.' },
  { kind: 'wish', mood: 'friend', title: 'For us', text: 'I wish you late-night laughs, good food,\nand one trip that we will keep talking about for years.' },
  { kind: 'wish', mood: 'general', title: 'Simple wish', text: 'I wish you mornings that feel light\nand nights that feel safe.' },
  { kind: 'wish', mood: 'love', title: 'From my heart', text: 'I wish you a year where every dream you whisper\nfinds someone ready to help you chase it, and I hope that someone is me.' },
];

/* Longer "I hope..." lines for the Wishes chapter */
export const WISHES: string[] = [
  'I hope this year surprises you in the best possible ways.',
  'I hope someone makes your favourite meal just because you were on their mind.',
  'I hope you get to rest without feeling guilty.',
  'I hope the people you love call you more often than you expect.',
  'I hope you find a song that feels exactly like this year.',
  'I hope your hard work finally gets the credit it deserves.',
  'I hope you are as patient with yourself as you are with everyone else.',
  'I hope you laugh so hard this year that your stomach hurts.',
  'I hope a small, good thing happens to you every single day.',
  'I hope you travel somewhere that makes you feel small and happy at the same time.',
  'I hope you get the news you have been waiting for.',
  'I hope you always find your way back to what makes you feel like yourself.',
  'I hope your phone buzzes with messages that make you smile.',
  'I hope you never run out of reasons to celebrate.',
];

/* Short lines for the starry sky */
export const SKY: string[] = [
  'A sunrise worth waking up for.',
  'A year full of good food and better company.',
  'A new skill you are proud of.',
  'Peace in your head and warmth in your heart.',
  'A trip you will never forget.',
  'A day you wish would not end.',
  'A message that makes your whole week.',
  'Courage for the big decisions.',
  'Soft landings after hard days.',
  'Every light turning green for you.',
  'Laughter that comes from the belly.',
  'Someone who is proud of you out loud.',
];

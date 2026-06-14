export const IMAGE_SIZES = [
  { id:'square', label:'Square 1:1', w:1024, h:1024 },
  { id:'portrait', label:'Portrait 4:5', w:1024, h:1280 },
  { id:'landscape', label:'Landscape 16:9', w:1280, h:720 },
  { id:'story', label:'Story 9:16', w:720, h:1280 },
  { id:'reel', label:'Reel 9:16', w:720, h:1280 },
  { id:'youtube', label:'YouTube Thumb', w:1280, h:720 },
  { id:'linkedin', label:'LinkedIn 1.91:1', w:1200, h:628 },
];
export const IMAGE_MODES = [
  { id:'text2img', label:'Text to Image' }, { id:'product', label:'Product Photography' },
  { id:'adcreative', label:'Ad Creative' }, { id:'social', label:'Social Post' },
  { id:'thumbnail', label:'YouTube Thumbnail' }, { id:'billboard', label:'Billboard Concept' },
  { id:'flyer', label:'Flyer Design' }, { id:'banner', label:'Banner' },
  { id:'campaign', label:'Campaign Artwork' },
];
export const pollUrl = (prompt: string, w: number, h: number, seed = Math.floor(Math.random()*9999)) =>
  `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&nologo=true&seed=${seed}`;

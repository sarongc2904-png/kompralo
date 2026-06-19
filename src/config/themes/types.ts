export interface Theme {
  id: string;
  name: string;
  // CSS Classes for layouts
  bodyBg: string;         // Background class for the page (e.g. 'bg-[#FAF8F5]')
  bodyText: string;       // Base text color class (e.g. 'text-[#4A4740]')
  headingFont: string;    // Font family class for headings (e.g. 'font-serif')
  bodyFont: string;       // Font family class for body text (e.g. 'font-sans')
  
  // Accent styles
  accentBg: string;       // Tailwind bg class for active elements
  accentText: string;     // Tailwind text class for accent titles
  accentBorder: string;   // Tailwind border class for outlines
  
  // Card styles
  cardBg: string;         // Card background (e.g., 'bg-white/80 backdrop-blur-md')
  cardBorder: string;     // Card border (e.g., 'border-[#EAE3D2]')
  cardText: string;       // Card text color
  
  // Visual flourishes
  paperTexture: boolean;  // Renders a subtle CSS noise texture on top
  dividerColor: string;   // Color class for horizontal separators (e.g., 'bg-[#C5A880]')
  
  // Section styles
  countdownBg: string;
  rsvpInputBg: string;
  storyLeftBg: string;
  storyRightBg: string;
  
  // Colors for DressCode swatches
  dressCodeSwatches: string[]; // List of color hex codes or Tailwind classes

  // Premium design enhancements
  bgSolid: string;             // Solid backdrop hex (e.g. '#FAF8F5')
  bgGlows: string[];           // Array of 3 hex colors for ambient glows
  heroOverlay: string;         // Hero fade-out overlay gradient class
}


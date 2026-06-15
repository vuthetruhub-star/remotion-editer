// D1AGENCY design tokens — adapted for Remotion (30fps)
// Font System: Geist (display/headings/body) + Geist Mono (terminal UX, data, numbers)

export const colors = {
	primary: '#00FF41',
	primaryHover: '#33FF66',
	primaryPressed: '#00CC34',
	primaryFaded: 'rgba(0, 255, 65, 0.12)',
	glow: 'rgba(0, 255, 65, 0.22)',
	glowSoft: 'rgba(0, 255, 65, 0.10)',

	background: '#0A0B0A',
	surface: '#101211',
	surfaceAlt: '#161A18',
	surfaceHover: '#1A1F1C',

	border: '#1F2A23',
	borderSubtle: '#141816',
	borderHover: '#2D3D33',

	text: {
		primary: '#EDEFEC',
		secondary: '#9BA39E',
		muted: '#5C6560',
	},

	critical: '#EF4444',
	notice: '#A78BFA',
	info: '#86EFAC',
};

export const fonts = {
	// Geist: premium visual hierarchy for display, headings, body
	display: 'Geist, system-ui, sans-serif',
	heading: 'Geist, system-ui, sans-serif',
	body: 'Geist, system-ui, sans-serif',
	
	// Geist Mono: terminal UX layer — data, numbers, code, buttons, inputs
	mono: 'Geist Mono, ui-monospace, SF Mono, Menlo, monospace',
	
	sizes: {
		// System labels, metadata, badges (Geist Mono)
		xs: 12,
		// Supporting copy, code blocks, form inputs, buttons (Geist Mono for inputs/buttons, Geist for text)
		sm: 14,
		// Body small (Geist)
		md: 16,
		// Body large, feature descriptions (Geist)
		lg: 18,
		// H3 / module titles (Geist)
		xl: 24,
		// H2 / sub-sections (Geist)
		xxl: 28,
		// H1 / section titles (Geist) — 36–48px range
		h1: 36,
		// Display / hero headline (Geist) — 56–80px range
		display: 72,
	},
	weights: {
		// Body text, code, labels (Geist / Geist Mono)
		regular: 400,
		// Buttons / CTA, command inputs (Geist Mono)
		medium: 500,
		// H2, H3, data metrics (Geist for headings, Geist Mono for metrics)
		semibold: 600,
		// H1, section headings (Geist)
		bold: 700,
		// Display / hero (Geist)
		heavy: 800,
	},
};

export const spacing = {
	xs: 4,
	sm: 8,
	md: 16,
	lg: 32,
	xl: 64,
	xxl: 128,
};

export const radii = {
	sm: 4,
	md: 6,
	lg: 8,
	xl: 12,
	full: 9999,
};

// All values in frames at 30fps
// Reference: 8f = ~267ms, 15f = 500ms, 30f = 1s
export const motion = {
	// Duration tokens
	press: 2,       // 80ms  — button click feedback
	fast: 4,        // 140ms — micro-interactions
	base: 6,        // 200ms — default
	slow: 8,        // 280ms — exits, modals
	typing: 1,      // 35ms per character
	pulse: 60,      // 2000ms — status dot cycle
	scan: 72,       // 2400ms — skeleton sweep

	// Easing — use with Remotion's spring() or Easing.*
	// Equivalent CSS references kept as comments
	easeOut: 'cubic-bezier(0.23, 1, 0.32, 1)',     // Remotion: spring({ damping: 200 })
	easeSnap: 'cubic-bezier(0.5, 0, 0.1, 1)',
	easeInOut: 'cubic-bezier(0.77, 0, 0.175, 1)',
	easeDrawer: 'cubic-bezier(0.32, 0.72, 0, 1)',

	// Enhancement stagger delays (frames)
	stagger: 2,     // 60ms — between reveal items
	bootLine: 5,    // 150ms — between boot sequence lines

	// Ticker / scanline
	tickerDuration: 1200, // 40s at 30fps
};

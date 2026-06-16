// D1AGENCY design tokens — source of truth for all Remotion compositions
// Font System: Geist (display/headings/body) + Geist Mono (terminal UX, data, numbers)
// All motion values in frames at 30fps. Reference: 1f = ~33ms, 30f = 1s

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
	// Geist: premium visual hierarchy — display, headings, body
	display: 'Geist, system-ui, sans-serif',
	heading: 'Geist, system-ui, sans-serif',
	body: 'Geist, system-ui, sans-serif',

	// Geist Mono: terminal UX layer — data, numbers, code, buttons, inputs
	mono: 'Geist Mono, ui-monospace, SF Mono, Menlo, monospace',

	sizes: {
		xs: 12,      // System labels, metadata, badges
		sm: 14,      // Supporting copy, buttons, inputs
		md: 16,      // Body regular
		lg: 18,      // Body large, feature descriptions
		xl: 24,      // H3 / module titles
		xxl: 28,     // H2 / sub-sections
		h1: 36,      // H1 / section titles (36–48px range)
		display: 72, // Display / hero headline (56–80px range)
	},

	weights: {
		regular: 400,  // Body text, code, labels
		medium: 500,   // Buttons / CTA, command inputs
		semibold: 600, // H2, H3, data metrics
		bold: 700,     // H1, section headings
		heavy: 800,    // Display / hero
	},
};

export const spacing = {
	xs: 4,    // Icon gaps, inline
	sm: 8,    // Tight padding, tags
	md: 16,   // Default padding
	lg: 32,   // Card padding, component gaps
	xl: 64,   // Section internal
	xxl: 128, // Between sections
};

export const radii = {
	none: 0,    // Terminal frames — hard edge
	sm: 4,      // Chips, tags, buttons
	md: 6,      // Inputs, small cards
	lg: 8,      // Cards
	xl: 12,     // Modals, panels, bento modules
	full: 9999, // Status dots ONLY — never default shape
};

export const motion = {
	// Duration tokens (frames at 30fps)
	press: 2,      // ~67ms  — button click feedback
	fast: 4,       // ~133ms — micro-interactions, hover
	base: 6,       // ~200ms — default enters/exits
	slow: 8,       // ~267ms — exits, modals
	section: 18,   // ~600ms — section / module reveals
	typing: 1,     // ~33ms per character — typing reveal (#1)
	pulse: 60,     // 2s     — status dot cycle (#8)
	scan: 72,      // 2.4s   — skeleton sweep (#11)

	// Stagger delays (frames)
	stagger: 2,    // 60ms  — between stagger reveal items (#10)
	bootLine: 5,   // 167ms — between boot sequence lines (#2)

	// Ticker
	tickerDuration: 1200, // 40s full loop — live ticker (#12)

	// Easing references (use with Remotion Easing.bezier)
	easeOut: [0.23, 1, 0.32, 1] as const,     // Elements entering
	easeSnap: [0.5, 0, 0.1, 1] as const,      // Button press, hover
	easeInOut: [0.77, 0, 0.175, 1] as const,  // State toggles
	easeDrawer: [0.32, 0.72, 0, 1] as const,  // Drawer/modal slide
};

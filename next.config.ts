import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: false,
	turbopack: {
		root: __dirname,
	},
	// Remotion renderer uses native binaries — must not be bundled by webpack.
	serverExternalPackages: [
		"@remotion/renderer",
		"@remotion/bundler",
		"@remotion/compositor-win32-x64-msvc",
		"@remotion/compositor-linux-x64-gnu",
		"@remotion/compositor-linux-arm64-gnu",
		"@remotion/compositor-darwin-x64",
		"@remotion/compositor-darwin-arm64",
	],
};

export default nextConfig;

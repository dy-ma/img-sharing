/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.json`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { PhotonImage, SamplingFilter, resize } from "@cf-wasm/photon";

async function generateThumbnail(img_array: Uint8Array, width: number): Promise<Uint8Array> {
	// Load image into Photo
	const photonImage = PhotonImage.new_from_byteslice(img_array);

	// Get original photo dimensions
	const originalWidth = photonImage.get_width();
	const originalHeight = photonImage.get_height();

	const aspectRatio = originalHeight / originalWidth;

	// Calculate the new height
	const height = Math.round(width * aspectRatio);

	const resizedImage = resize(
		photonImage,
		width,
		height,
		SamplingFilter.Nearest
	)

	// Get web safe display version
	const outputBuffer = resizedImage.get_bytes_webp();

	// Free memory
	photonImage.free();
	resizedImage.free();
	return outputBuffer;
}

async function convertImage(object: R2ObjectBody): Promise<Uint8Array>	 {
	const chunks = [];
	const reader = object.body.getReader();

	// Read stream
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		chunks.push(value);
	}

	// Create array
	const totalSize = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
	const combined = new Uint8Array(totalSize);

	// Copy into array
	let offset = 0;
	for (const chunk of chunks) {
		combined.set(chunk, offset);
		offset += chunk.length;
	}

	return combined;
}

interface PreviewRequest {
	width: number;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		const key = url.pathname.slice(1);

		console.log("Requested key:", key);

		// Check Auth header
		const authHeader = request.headers.get("Authorization");
		if (!authHeader || !authHeader.startsWith("Bearer")) {
			return new Response("Unauthorized: No Authorization Header", { status: 401 });
		}

		// Extract token from auth header
		const token = authHeader.substring(7);

		// Check if token matches secret
		if (token !== env.SECRET_KEY) {
			return new Response("Unauthorized: Invalid Token", { status: 401 });
		}

		// Assume a width of 300 if no body
		let width = 300;
		try {
			// Get requested dimensions
			const preview_request: PreviewRequest = await request.json();
			width = preview_request.width;
		} catch {
			console.error("Invalid JSON body");
		}

		const object = await env.BUCKET.get(key);

        if (object === null) {
          return new Response("Object Not Found", { status: 404 });
        }

		// Convert image to stream
		const img_array = await convertImage(object);

		// Resize image
		const blob = await generateThumbnail(img_array, width);

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set("etag", object.httpEtag);
        return new Response(blob, {
          headers,
        });

	}
} satisfies ExportedHandler<Env>;

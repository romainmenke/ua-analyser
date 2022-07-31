/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import uaNormalizerV1 from '@financial-times/polyfill-useragent-normaliser-1.10.2';
import uaNormalizerV2 from '@financial-times/polyfill-useragent-normaliser-2.0.1';
import uaParser from '@financial-times/useragent_parser';

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		const ua = request.headers.get("User-Agent");
		if (!ua) {
			return new Response(
				JSON.stringify({
					"error": "User-Agent header is required"
				}),
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}

		const coreWebResp = await fetch("https://core-web.mrhenry.studio/.ua", request.clone());

		const coreWebData = JSON.parse(await coreWebResp.text());
		

		return new Response(JSON.stringify({
			"ua": ua,
			"sec-ch-ua": request.headers.get("Sec-CH-UA"),
			"financial-times/polyfill-useragent-normaliser@v2": {
				"normalized": uaNormalizerV2.normalize(ua),
				"meets-baseline": (new uaNormalizerV2(ua)).meetsBaseline(),
			},
			"financial-times/polyfill-useragent-normaliser@v1": {
				"normalized": uaNormalizerV1.normalize(ua),
				"meets-baseline": (new uaNormalizerV1(ua)).meetsBaseline(),
			},
			"financial-times/useragent_parser": uaParser(ua),
			"mr-henry-ua-parser": coreWebData,
		}, null, '  '), { headers: { 'content-type': 'application/json' } });
	},
};

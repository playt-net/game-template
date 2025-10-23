import PlaytClient from '@playt/client';

const apiUrl = import.meta.env.VITE_CLASH_PARADISE_API_HOST_URL;
const apiKey = import.meta.env.API_KEY;

if (!apiUrl || !apiKey) {
	console.error('Missing environment variables:', { apiUrl, apiKey });
	throw new Error(
		'Missing environment variables: VITE_CLASH_PARADISE_API_HOST_URL and/or API_KEY not found',
	);
}

const client = PlaytClient({
	apiKey,
	apiUrl,
});

if (!import.meta.env.npm_package_version) {
	throw new Error('Missing game version');
}

export default client;

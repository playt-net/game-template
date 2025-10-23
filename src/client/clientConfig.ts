// Client configuration - switch between real and mock client
import mockClient, { playt as mockPlayt } from './mockClient';
import realClient, { playt as realPlayt } from './client';

// Use mock client if VITE_USE_MOCK_CLIENT is set to 'true' or if playerToken is missing
const useMockClient =
	import.meta.env.VITE_USE_MOCK_CLIENT === 'true' ||
	!new URLSearchParams(window.location.search).get('playerToken');

const client = useMockClient ? mockClient : realClient;
export const playt = useMockClient ? mockPlayt : realPlayt;

console.log(
	`[Client] Using ${useMockClient ? 'MOCK' : 'REAL'} client implementation`,
);

export default client;

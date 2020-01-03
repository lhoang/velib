import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		source: '../data.json',
	}
});

export default app;
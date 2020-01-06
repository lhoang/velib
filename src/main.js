import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		source: '../data1.json',
	}
});

export default app;
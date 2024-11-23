<script lang="ts">
	import '../../app.css';
	let { children } = $props();
</script>

<div class="container mx-auto max-w-xl">
	{@render children()}
</div>

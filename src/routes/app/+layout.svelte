<script lang="ts">
	import '../../app.css';
	let { children } = $props();
</script>

<div class="container mx-8">
	{@render children()}
</div>

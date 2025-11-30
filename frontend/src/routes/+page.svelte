<script lang="ts">
	let { data } = $props();

	let message = $derived(data.message);

</script>

<h1>{message}</h1>

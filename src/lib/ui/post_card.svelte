<script>
  import { onMount } from "svelte";

  export let title;
  export let description;
  export let type;
  export let id;
  let imgLoading = true;
  let imgEl;

  onMount(() => {
    if (imgEl && imgEl.complete) {
      imgLoading = false;
    }
  });
</script>

<a href="/post?id={id}" class="block">
  <div class="card-modern h-full overflow-hidden flex flex-col md:flex-row">
    <!-- Image left on md+, stacked on small screens. Use object-contain so the whole image shows and add padding. -->
    <div
      class="w-full md:w-1/3 bg-slate-50 flex items-center justify-center p-4"
    >
      <img
        bind:this={imgEl}
        src="img\\magnetron.jpg"
        alt={title}
        class="max-h-64 sm:max-h-80 md:max-h-64 lg:max-h-80 max-w-full object-contain transition-all duration-500 ease-out"
        class:blur-lg={imgLoading}
        class:scale-105={imgLoading}
        class:blur-0={!imgLoading}
        class:scale-100={!imgLoading}
        loading="lazy"
        on:load={() => (imgLoading = false)}
      />
    </div>

    <div class="p-4 md:w-2/3">
      <h3 class="text-lg font-semibold text-slate-900">{title}</h3>
      <p class="mt-2 text-sm text-slate-700 line-clamp-4">{description}</p>
      <div class="mt-4 flex items-center justify-end">
        <div class="badge badge-outline h-auto text-center">{type}</div>
      </div>
    </div>
  </div>
</a>

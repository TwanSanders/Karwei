<script>
  export let title;
  export let description;
  export let type;
  export let id;
</script>

<a href="/post?id={id}">
  <div class="card lg:card-side bg-base-100 shadow-xl max-w-screen-sm">
    <figure>
      <img src="img\magnetron.jpg" alt="Magnetron" />
    </figure>
    <div class="card-body">
      <h2 class="card-title">{title}</h2>
      <p>
        {description}
      </p>
      <div class="card-actions justify-end">
        <div class="badge badge-outline h-auto text-center">{type}</div>
      </div>
    </div>
  </div>
</a>

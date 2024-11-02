<script>
  import PostCard from "../../lib/ui/post_card.svelte";

  export let data;

  let post = data.post[0] || {};

  const date = new Date(post.purchasedAt);
</script>

<div class="grid grid-cols-12">
  <div class="col-span-6 p-10">
    <div class="card card-compact bg-base-100 shadow-xl w-2/3">
      <figure>
        <img src="img\magnetron.jpg" alt="Magnetron" />
      </figure>
      <div class="card-body">
        <h2 class="card-title">{post.title}</h2>
        <strong>Description</strong>
        <p>{post.description}</p>
        <div class="card-actions justify-end">
          <div class="badge badge-outline">{post.type}</div>
        </div>
      </div>
    </div>
  </div>
  <div class="col-span-6 p-10">
    <div class="card card-compact bg-base-100 shadow-xl w-1/2">
      <div class="card-body">
        <h2 class="card-title">About this post</h2>
        <strong>Target price</strong>
        <p>€{post.targetPrice}</p>
        <strong>Bought at</strong>
        <p>
          {date.toLocaleDateString("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </div>

    <a href="../profile">
      <div class="card card-compact bg-base-100 shadow-xl w-1/2 mt-10">
        <div class="card-body">
          <h2 class="card-title">Contact</h2>
          <strong>User</strong>
          <p>Twan Sanders</p>
          <strong>Email</strong>
          <a
            href="mailto:twanianusvananannas@gmail.com"
            class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            >twanianusvananannas@gmail.com</a
          >
          <strong>Phone</strong>
          <p>+32 485 00 87 34</p>
        </div>
      </div>
    </a>
  </div>
</div>

<div class="card card-compact bg-base-100 shadow-xl m-10">
  <div class="card-body">
    <h2 class="card-title">Forum</h2>
    <hr />
    <div class="chat chat-start m-10">
      <div class="chat-image avatar">
        <div class="w-10 rounded-full">
          <img
            alt="Tailwind CSS chat bubble component"
            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
          />
        </div>
      </div>
      <div class="chat-header">
        Obi-Wan Kenobi
        <time class="text-xs opacity-50">12:45</time>
      </div>
      <div class="chat-bubble">You were the Chosen One!</div>
      <div class="chat-footer opacity-50">Delivered</div>
    </div>
    <div class="chat chat-end m-10">
      <div class="chat-image avatar">
        <div class="w-10 rounded-full">
          <img
            alt="Tailwind CSS chat bubble component"
            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
          />
        </div>
      </div>
      <div class="chat-header">
        Anakin
        <time class="text-xs opacity-50">12:46</time>
      </div>
      <div class="chat-bubble">I hate you!</div>
      <div class="chat-footer opacity-50">Seen at 12:46</div>
    </div>
  </div>
</div>

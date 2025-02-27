<script>
  let score = 1.5;

  import { onMount } from "svelte";

  onMount(() => {
    // Get info out of url
    const url = new URL(window.location.href);
    offer_id = url.searchParams.get("offer_id");
    post_id = url.searchParams.get("post_id");
    maker_id = url.searchParams.get("maker_id");
    user_id = url.searchParams.get("user_id");
  });

  let offer_id = 0;
  let post_id = 0;
  let maker_id = 0;
  let user_id = 0;

  async function handleScore(new_score) {
    console.log(new_score);
    score = new_score;
  }

  async function submitReview(event) {
    const form = event.target.form;
    const formData = new FormData(form);

    formData.append("post_id", post_id);
    formData.append("maker_id", maker_id);
    formData.append("offer_id", offer_id);
    formData.append("score", score);

    try {
      // Submit the form manually using fetch
      const response = await fetch("?/submitReview", {
        method: "POST",
        body: formData,
      });

      // Parse the response and update posts
      const result = await response.json();

      if (response.status == 200) {
        window.location.href = `/`;
      }
    } catch (error) {
      console.error(error);
    }
  }
</script>

<form on:submit={submitReview}>
  <input type="hidden" name="score" value={score} />
  <input type="hidden" name="offer_id" value={offer_id} />
  <input type="hidden" name="post_id" value={post_id} />
  <input type="hidden" name="maker_id" value={maker_id} />
  <div class="grid grid-cols-12">
    <div class="card card-compact bg-base-100 shadow-xl m-10 col-span-6">
      <div class="card-body">
        <h2 class="card-title">Review</h2>
        <hr />
        <p>How happy are you with the repair?</p>
        <div class="rating rating-lg rating-half">
          <input type="radio" name="rating-10" class="rating-hidden" />
          <input
            type="radio"
            name="rating-10"
            class="mask mask-star-2 mask-half-1 bg-orange-400"
            on:click={() => handleScore(0.5)}
          />
          <input
            type="radio"
            name="rating-10"
            class="mask mask-star-2 mask-half-2 bg-orange-400"
            on:click={() => handleScore(1)}
          />
          <input
            type="radio"
            name="rating-10"
            class="mask mask-star-2 mask-half-1 bg-orange-400"
            checked="checked"
            on:click={() => handleScore(1.5)}
          />
          <input
            type="radio"
            name="rating-10"
            class="mask mask-star-2 mask-half-2 bg-orange-400"
            on:click={() => handleScore(2)}
          />
          <input
            type="radio"
            name="rating-10"
            class="mask mask-star-2 mask-half-1 bg-orange-400"
            on:click={() => handleScore(2.5)}
          />
          <input
            type="radio"
            name="rating-10"
            class="mask mask-star-2 mask-half-2 bg-orange-400"
            on:click={() => handleScore(3)}
          />
          <input
            type="radio"
            name="rating-10"
            class="mask mask-star-2 mask-half-1 bg-orange-400"
            on:click={() => handleScore(3.5)}
          />
          <input
            type="radio"
            name="rating-10"
            class="mask mask-star-2 mask-half-2 bg-orange-400"
            on:click={() => handleScore(4)}
          />
          <input
            type="radio"
            name="rating-10"
            class="mask mask-star-2 mask-half-1 bg-orange-400"
            on:click={() => handleScore(4.5)}
          />
          <input
            type="radio"
            name="rating-10"
            class="mask mask-star-2 mask-half-2 bg-orange-400"
            on:click={() => handleScore(5)}
          />
        </div>
      </div>
    </div>
    <div class="card card-compact bg-base-100 shadow-xl m-10 col-span-6">
      <div class="card-body">
        <h2 class="card-title">Karwei</h2>
        <hr />
        <p>Are you ready to close off this Karwei?</p>
        <button type="sumbit" class="btn btn-primary w-full">Finish</button>
      </div>
    </div>
  </div>
</form>

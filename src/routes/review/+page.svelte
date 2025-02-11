<script>
  let score = 1.5;

  async function handleScore(new_score) {
    score = new_score;
    console.log(score);
  }
</script>

<form action="?/submitReview" method="POST">
  <input type="hidden" name="score" value={score} />
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

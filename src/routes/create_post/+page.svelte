<script>
  import { getContext } from "svelte";
  // import 'cropperjs/dist/cropper.css';
  import Cropper from "cropperjs";
  const session = getContext("session");

  let userId = session.user.id || "e0b8e683-1075-4b0b-b350-9701b696f1f6";

  async function handleCreatePost(event) {
    event.preventDefault();
    const form = event.target.form;

    const formData = new FormData(form);
    formData.append("userId", userId);

    try {
      // Submit the form manually using fetch
      const response = await fetch("?/createPost", {
        method: "POST",
        body: formData,
      });

      window.location.href = "/";
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  }

  let imgUrl = null;

  function handleFileChange(event) {
    const file = event.target.files[0];
    if (file) {
      imgUrl = URL.createObjectURL(file);
    }
  }
</script>

<form
  method="POST"
  enctype="multipart/form-data"
  class="flex flex-col space-y-4 p-10 items-center"
>
  <label class="input input-bordered flex items-center gap-2 w-3/5">
    Titel
    <input
      name="title"
      type="text"
      class="grow"
      placeholder="Titel"
      id="title"
    />
  </label>

  <input
    name="img"
    type="file"
    class="file-input file-input-bordered w-3/5"
    on:change={handleFileChange}
  />
  {#if imgUrl}
    <div class="w-1/5">
      <img id="image" src={imgUrl} alt="" class="block max-w-max" />
    </div>
    <script>
      const image = document.getElementById("image");
      const cropper = new Cropper(image, {
        aspectRatio: 16 / 9,
        crop(event) {
          console.log(event.detail.x);
          console.log(event.detail.y);
          console.log(event.detail.width);
          console.log(event.detail.height);
          console.log(event.detail.rotate);
          console.log(event.detail.scaleX);
          console.log(event.detail.scaleY);
        },
      });
    </script>
  {/if}
  <label class="input input-bordered flex items-center gap-2 w-3/5">
    Target price
    <input
      name="price"
      id="price"
      type="text"
      class="grow"
      placeholder="... €"
    />
  </label>

  <label class="input input-bordered flex items-center gap-2 w-3/5">
    Bought at
    <input name="purchased_at" id="purchased_at" type="date" />
  </label>

  <select name="type" class="select select-bordered w-3/5" id="type">
    <option disabled selected>Type karwei</option>
    <option>Elektriciteit</option>
    <option>Huishoudelijke apparaten</option>
    <option>Textiel</option>
    <option>Hout</option>
    <option>Tuinonderhoud</option>
    <option>Elektronica</option>
  </select>

  <textarea
    name="description"
    id="description"
    class="textarea textarea-bordered w-3/5"
    placeholder="Description"
  ></textarea>

  <button on:click={handleCreatePost} class="btn btn-primary w-3/5"
    >Sumbit</button
  >
</form>

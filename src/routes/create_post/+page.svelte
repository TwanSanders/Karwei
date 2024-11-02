<form method="POST" class="flex flex-col space-y-4 p-10 items-center">
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
  <input name="img" type="file" class="file-input file-input-bordered w-3/5" />
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

  <input type="submit" value="Submit" class="btn" />
</form>

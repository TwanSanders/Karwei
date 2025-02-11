<script>
  export let full;
</script>

<div class="rounded-box overflow-hidden">
  <ul class="menu rounded-box w-full" class:bg-base-200={full}>
    {#if full}<li><strong>Type karwei</strong></li>{/if}
    <div style="max-height: 280px; overflow-y:auto; overflow-x:hidden;">
      <li>
        <label class="label cursor-pointer">
          <span class="label-text">Elektriciteit</span>
          <input
            type="checkbox"
            class="checkbox"
            name="type_select"
            value="Elektriciteit"
          />
        </label>
      </li>
      <li>
        <label class="label cursor-pointer">
          <span class="label-text">Huishoudelijke apparaten</span>
          <input
            type="checkbox"
            class="checkbox"
            name="type_select"
            value="Huishoudelijke apparaten"
          />
        </label>
      </li>
      <li>
        <label class="label cursor-pointer">
          <span class="label-text">Textiel</span>
          <input
            type="checkbox"
            class="checkbox"
            name="type_select"
            value="Textiel"
          />
        </label>
      </li>
      <li>
        <label class="label cursor-pointer">
          <span class="label-text">Hout</span>
          <input
            type="checkbox"
            class="checkbox"
            name="type_select"
            value="Hout"
          />
        </label>
      </li>
      <li>
        <label class="label cursor-pointer">
          <span class="label-text">Elektronica</span>
          <input
            type="checkbox"
            class="checkbox"
            name="type_select"
            value="Elektronica"
          />
        </label>
      </li>
      <li>
        <label class="label cursor-pointer">
          <span class="label-text">Meubilair</span>
          <input
            type="checkbox"
            class="checkbox"
            name="type_select"
            value="Meubilair"
          />
        </label>
      </li>
      <li>
        <label class="label cursor-pointer">
          <span class="label-text">Lichte verbrandingsmotoren</span>
          <input
            type="checkbox"
            class="checkbox"
            name="type_select"
            value="Lichte verbrandingsmotoren"
          />
        </label>
      </li>
      <li>
        <label class="label cursor-pointer">
          <span class="label-text">Metaal</span>
          <input
            type="checkbox"
            class="checkbox"
            name="type_select"
            value="Metaal"
          />
        </label>
      </li>
      <li>
        <label class="label cursor-pointer">
          <span class="label-text">Andere</span>
          <input
            type="checkbox"
            class="checkbox"
            name="type_select"
            value="Andere"
          />
        </label>
      </li>
    </div>
  </ul>
</div>

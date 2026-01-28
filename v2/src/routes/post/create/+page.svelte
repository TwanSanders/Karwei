<script lang="ts">
    import PostCreationWizard from "$lib/components/PostCreationWizard.svelte";
    import type { ActionData, PageData } from "./$types";

    export let form: ActionData;
    export let data: PageData;
</script>

<PostCreationWizard availableSkills={data.skills || []} />

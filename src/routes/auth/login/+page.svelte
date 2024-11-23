<script lang="ts">
  import { enhance } from '$app/forms';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
	import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();
  let emailError = $derived(form?.formError);
</script>

<section>
  <h1>Login to PFI</h1>
  
  <form method="POST" use:enhance>
    <div class="mt-12">
      <Label for="email">Email</Label>
      {#if emailError !== ''}
        <p class="text-red-600">{ emailError }</p>
      {/if}
      <Input type="email" name="email" id="email" required />
    </div>

    <div class="mt-6">
      <Label for="password">Password</Label>
      <Input type="password" name="password" id="password" required />
    </div>

    <div class="flex flex-row-reverse w-full mt-6 ">
      <Button type="submit" class="px-16 w-max-xs">Login</Button>
    </div>
  </form>

  <div class="mt-12">
    Don't have an account?
    <a href="/auth/signup" class="text-blue-600">Click here</a> to sign up.
  </div>
</section>
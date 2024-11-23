<script lang="ts">
  import { Button } from '$lib/components/ui/button';
</script>

<div class="container mx-auto max-w-xl">
  <h1 class="mt-16 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
    Welcome to the sveltekit-template
  </h1>
  
  <div class="mt-6">
    <Button href="/auth/signup">Sign Up</Button>
    <Button href="auth/login">Login</Button>
  </div>
</div>

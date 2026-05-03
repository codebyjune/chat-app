<template>
  <section class="relative overflow-hidden rounded-[36px] border p-8" style="border-color: var(--border-color); background: linear-gradient(135deg, #111827 0%, #0f172a 100%); box-shadow: var(--shadow-surface);">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(139,92,246,0.18),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(34,211,238,0.12),_transparent_28%)]" />

    <div class="relative flex h-full flex-col justify-between gap-10">
      <div>
        <p class="text-xs uppercase tracking-[0.35em] text-white/45">Messaging workspace</p>
        <h2 class="mt-4 max-w-md text-4xl font-semibold leading-tight text-white">
          Keep the same focused chat experience from the first screen to the last.
        </h2>
        <p class="mt-4 max-w-lg text-sm leading-7 text-white/70">
          Dark surfaces, soft violet highlights, and roomy cards make the auth flow feel like part of the app instead of a detached landing page.
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="rounded-3xl border border-violet-500/20 bg-violet-500/10 p-5">
          <p class="text-sm font-semibold text-white">Fast handoff</p>
          <p class="mt-2 text-sm leading-6 text-violet-100/80">
            Sign in and continue from your unread inbox without changing context.
          </p>
        </div>
        <div class="rounded-3xl border p-5" style="border-color: rgba(148, 163, 184, 0.18); background: rgba(15, 23, 42, 0.72);">
          <p class="text-sm font-semibold text-white">Clean setup</p>
          <p class="mt-2 text-sm leading-6 text-white/65">
            Registration keeps the same component language as the message composer and panels.
          </p>
        </div>
      </div>

      <div class="grid gap-3 rounded-[28px] border p-4" style="border-color: rgba(148, 163, 184, 0.18); background: rgba(2, 6, 23, 0.76);">
        <div class="flex items-center gap-3 rounded-2xl border px-4 py-3" style="border-color: rgba(148, 163, 184, 0.16); background: rgba(15, 23, 42, 0.72);">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/15 text-sm font-semibold text-violet-200">
            AC
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-white">Avery Chen</p>
            <p class="truncate text-sm text-white/65">The mockup looks solid. I will send the final assets before lunch.</p>
          </div>
          <span class="text-xs text-white/40">09:24</span>
        </div>

        <div class="ml-auto max-w-[80%] rounded-[28px] rounded-br-md bg-violet-600 px-5 py-4 text-sm leading-7 text-white">
          Happy to review once you are in. The auth flow now matches the app shell.
        </div>
      </div>
    </div>
  </section>
</template>

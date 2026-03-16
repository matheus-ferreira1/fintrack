<script setup lang="ts">
const title = 'FinTrack - Your Personal Finance Companion'
const description
  = 'Track income, manage expenses, and predict your financial future with our intuitive expense tracker.'

useSeoMeta({
  titleTemplate: '',
  title,
  ogTitle: title,
  description,
  ogDescription: description,
})

useHead({
  link: [
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: '',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap',
    },
  ],
})

definePageMeta({
  layout: 'landing',
})

const features = [
  {
    title: 'Track Every Cent',
    description: 'Log income and expenses with categories, dates, and notes. Every transaction tells a story.',
    icon: 'i-lucide-scan-line',
  },
  {
    title: 'Visual Insights',
    description: 'Interactive charts reveal spending patterns and income trends at a glance.',
    icon: 'i-lucide-chart-spline',
  },
  {
    title: 'Recurring Flows',
    description: 'Set up recurring transactions once. Generate them monthly with a single click.',
    icon: 'i-lucide-repeat-2',
  },
  {
    title: 'Category Control',
    description: 'Create custom color-coded categories that match the way you think about money.',
    icon: 'i-lucide-tags',
  },
  {
    title: 'Dashboard Overview',
    description: 'Balance, savings, income, expenses — your financial pulse in four cards.',
    icon: 'i-lucide-layout-dashboard',
  },
  {
    title: 'Secure by Design',
    description: 'Session-based auth, hashed passwords, and validated inputs protect your data.',
    icon: 'i-lucide-shield-check',
  },
]

const stats = [
  { value: '100%', label: 'Open Source' },
  { value: '6+', label: 'Chart Views' },
  { value: '0', label: 'Monthly Cost' },
  { value: '∞', label: 'Transactions' },
]
</script>

<template>
  <div class="landing-page">
    <section class="hero-section relative overflow-hidden">
      <div class="hero-glow" />
      <div class="hero-grid" />

      <div class="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-20 lg:px-8 lg:pb-36 lg:pt-32">
        <div class="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
          <div class="animate-reveal">
            <p class="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-semibold tracking-widest text-primary uppercase">
              <UIcon
                name="ic:baseline-wallet"
                class="size-4"
              />
              Personal Finance Tracker
            </p>

            <h1 class="hero-title mb-6 text-5xl leading-[1.1] font-bold tracking-tight text-default lg:text-7xl">
              Your money,
              <span class="hero-accent">finally</span>
              understood.
            </h1>

            <p class="mb-10 max-w-lg text-lg leading-relaxed text-muted lg:text-xl">
              Stop guessing where your money goes. FinTrack gives you crystal-clear visibility into every
              transaction, trend, and opportunity.
            </p>

            <div class="flex flex-wrap items-center gap-4">
              <UButton
                label="Start Tracking"
                trailing-icon="i-lucide-arrow-right"
                size="xl"
                to="/register"
              />
              <UButton
                label="Sign in"
                variant="outline"
                color="neutral"
                size="xl"
                to="/login"
              />
            </div>
          </div>

          <div class="animate-reveal-delayed hidden lg:block">
            <div class="mockup-container">
              <div class="mockup-glow" />
              <div class="mockup-card">
                <div class="mb-6 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="size-3 rounded-full bg-error" />
                    <div class="size-3 rounded-full bg-warning" />
                    <div class="size-3 rounded-full bg-success" />
                  </div>
                  <div class="rounded-md bg-elevated px-3 py-1 text-xs text-muted">
                    dashboard
                  </div>
                </div>

                <div class="mb-5 grid grid-cols-2 gap-3">
                  <div class="rounded-lg bg-elevated p-3">
                    <p class="text-[10px] font-medium tracking-wider text-muted uppercase">
                      Balance
                    </p>
                    <p class="mt-1 text-lg font-bold text-default">
                      $12,840
                    </p>
                    <p class="mt-0.5 text-[10px] text-success">
                      +12.5%
                    </p>
                  </div>
                  <div class="rounded-lg bg-elevated p-3">
                    <p class="text-[10px] font-medium tracking-wider text-muted uppercase">
                      Savings
                    </p>
                    <p class="mt-1 text-lg font-bold text-default">
                      $3,240
                    </p>
                    <p class="mt-0.5 text-[10px] text-success">
                      +8.2%
                    </p>
                  </div>
                  <div class="rounded-lg bg-elevated p-3">
                    <p class="text-[10px] font-medium tracking-wider text-muted uppercase">
                      Income
                    </p>
                    <p class="mt-1 text-lg font-bold text-success">
                      $8,500
                    </p>
                  </div>
                  <div class="rounded-lg bg-elevated p-3">
                    <p class="text-[10px] font-medium tracking-wider text-muted uppercase">
                      Expenses
                    </p>
                    <p class="mt-1 text-lg font-bold text-error">
                      $5,260
                    </p>
                  </div>
                </div>

                <div class="rounded-lg bg-elevated p-3">
                  <p class="mb-3 text-[10px] font-medium tracking-wider text-muted uppercase">
                    Monthly Trend
                  </p>
                  <div class="flex items-end gap-1.5">
                    <div
                      v-for="(h, i) in [40, 55, 35, 65, 50, 75, 60, 80, 45, 70, 85, 65]"
                      :key="i"
                      class="chart-bar flex-1 rounded-sm"
                      :class="i % 2 === 0 ? 'bg-primary/70' : 'bg-primary/30'"
                      :style="{ height: `${h}px`, animationDelay: `${1.2 + i * 0.05}s` }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="stats-ribbon relative border-y border-default/50">
      <div class="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div class="grid grid-cols-2 gap-8 lg:grid-cols-4">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="text-center"
          >
            <p class="stat-value text-3xl font-bold text-default lg:text-4xl">
              {{ stat.value }}
            </p>
            <p class="mt-1 text-sm tracking-wider text-muted uppercase">
              {{ stat.label }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <UPageSection
      headline="Capabilities"
      title="Everything to master your finances"
      description="A focused toolkit that does exactly what you need — no bloat, no confusion, no premium upsells."
      :ui="{
        root: 'py-20 lg:py-32',
        title: 'hero-title text-3xl lg:text-5xl',
        headline: 'text-primary',
      }"
    >
      <UPageGrid>
        <UPageCard
          v-for="feature in features"
          :key="feature.title"
          :title="feature.title"
          :description="feature.description"
          :icon="feature.icon"
          :ui="{
            root: 'feature-card',
            title: 'font-semibold',
          }"
        />
      </UPageGrid>
    </UPageSection>

    <section class="relative overflow-hidden border-y border-default/50 py-20 lg:py-32">
      <div class="section-noise" />
      <div class="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <p class="mb-3 text-sm font-semibold tracking-widest text-primary uppercase">
          How it works
        </p>
        <h2 class="hero-title mb-16 text-3xl font-bold text-default lg:text-5xl">
          Three steps to clarity
        </h2>

        <div class="grid gap-12 lg:grid-cols-3 lg:gap-8">
          <div
            v-for="(step, i) in [
              { number: '01', title: 'Create your account', desc: 'Sign up in seconds. No credit card, no trial period, no strings.' },
              { number: '02', title: 'Log transactions', desc: 'Add income and expenses with categories, dates, and optional recurrence.' },
              { number: '03', title: 'See the picture', desc: 'Your dashboard reveals balance trends, category breakdowns, and savings rate.' },
            ]"
            :key="i"
            class="step-card group relative"
          >
            <span class="step-number mb-4 block text-6xl font-bold lg:text-7xl">
              {{ step.number }}
            </span>
            <h3 class="mb-2 text-xl font-semibold text-default">
              {{ step.title }}
            </h3>
            <p class="text-muted leading-relaxed">
              {{ step.desc }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <UPageCTA
      title="Start understanding your money today"
      description="Free, open-source, and private. Your financial data stays yours."
      :links="[
        { label: 'Create free account', to: '/register', trailingIcon: 'i-lucide-arrow-right', size: 'xl' as const },
        { label: 'Sign in', to: '/login', color: 'neutral' as const, variant: 'outline' as const, size: 'xl' as const },
      ]"
      :ui="{
        root: 'py-20 lg:py-32',
        title: 'hero-title text-3xl lg:text-5xl',
      }"
    />
  </div>
</template>

<style scoped>
/* ============================================
   TYPOGRAPHY — Playfair Display for headlines
   ============================================ */
.hero-title {
  font-family: 'Playfair Display', serif;
}

.hero-accent {
  font-style: italic;
  background: linear-gradient(135deg, var(--ui-color-primary-400), var(--ui-color-primary-200));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* ============================================
   HERO BACKGROUND EFFECTS
   ============================================ */
.hero-section {
  background: radial-gradient(
    ellipse 80% 60% at 50% 0%,
    color-mix(in srgb, var(--ui-color-primary-500) 8%, transparent),
    transparent
  );
}

.hero-glow {
  position: absolute;
  top: -200px;
  right: -100px;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--ui-color-primary-500) 12%, transparent),
    transparent 70%
  );
  filter: blur(80px);
  pointer-events: none;
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(
      color-mix(in srgb, var(--ui-color-primary-500) 4%, transparent) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      color-mix(in srgb, var(--ui-color-primary-500) 4%, transparent) 1px,
      transparent 1px
    );
  background-size: 64px 64px;
  mask-image: radial-gradient(ellipse 60% 50% at 50% 0%, black 30%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse 60% 50% at 50% 0%, black 30%, transparent 70%);
  pointer-events: none;
}

/* ============================================
   DASHBOARD MOCKUP
   ============================================ */
.mockup-container {
  position: relative;
  perspective: 1000px;
}

.mockup-glow {
  position: absolute;
  inset: -20px;
  border-radius: 24px;
  background: radial-gradient(
    circle at 30% 30%,
    color-mix(in srgb, var(--ui-color-primary-500) 20%, transparent),
    transparent 60%
  );
  filter: blur(40px);
  pointer-events: none;
}

.mockup-card {
  position: relative;
  padding: 1.25rem;
  border-radius: 1rem;
  border: 1px solid var(--ui-border);
  background: var(--ui-bg);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--ui-color-primary-500) 5%, transparent),
    0 25px 50px -12px rgba(0, 0, 0, 0.25);
  transform: rotateY(-2deg) rotateX(2deg);
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.mockup-card:hover {
  transform: rotateY(0deg) rotateX(0deg);
}

.chart-bar {
  animation: chart-grow 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

@keyframes chart-grow {
  from {
    height: 0;
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* ============================================
   STATS RIBBON
   ============================================ */
.stats-ribbon {
  background: color-mix(in srgb, var(--ui-color-primary-500) 2%, var(--ui-bg));
}

.stat-value {
  font-family: 'Playfair Display', serif;
}

/* ============================================
   FEATURE CARDS
   ============================================ */
:deep(.feature-card) {
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

:deep(.feature-card:hover) {
  border-color: color-mix(in srgb, var(--ui-color-primary-500) 30%, transparent);
  box-shadow: 0 0 30px color-mix(in srgb, var(--ui-color-primary-500) 8%, transparent);
}

/* ============================================
   STEPS SECTION
   ============================================ */
.section-noise {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--ui-color-primary-500) 2%, transparent);
  pointer-events: none;
}

.step-number {
  font-family: 'Playfair Display', serif;
  color: color-mix(in srgb, var(--ui-color-primary-500) 15%, transparent);
  transition: color 0.3s ease;
}

.step-card:hover .step-number {
  color: color-mix(in srgb, var(--ui-color-primary-500) 40%, transparent);
}

/* ============================================
   ANIMATIONS
   ============================================ */
.animate-reveal {
  animation: reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.animate-reveal-delayed {
  animation: reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
}

@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

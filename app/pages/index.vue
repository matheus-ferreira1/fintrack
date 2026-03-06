<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui';

const title = 'FinTrack - Your Personal Finance Companion'
const description
  = 'Track income, manage expenses, and predict your financial future with our intuitive expense tracker.'

useSeoMeta({
  titleTemplate: '',
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

const links: ButtonProps[] = [
  {
    label: 'Start Free Today',
    to: '/register',
    trailingIcon: 'material-symbols:arrow-right-alt'
  },
  {
    label: 'Sign In',
    to: '/login',
    variant: 'outline'
  }
]
</script>

<template>
  <div>
    home
  </div>
</template>


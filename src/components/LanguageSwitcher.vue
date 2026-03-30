<template>
  <div class="language-switcher">
    <div class="lang-dropdown">
      <button class="lang-button" @click="isOpen = !isOpen" :title="$t('profile.language')">
        <span class="flag">{{ currentFlag }}</span>
        <span class="code">{{ currentCode.toUpperCase() }}</span>
        <svg class="chevron" :class="{ 'rotate': isOpen }" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <transition name="dropdown">
        <div v-if="isOpen" class="lang-menu">
          <button
            v-for="lang in availableLanguages"
            :key="lang.code"
            class="lang-option"
            :class="{ 'active': lang.code === currentCode }"
            @click="selectLanguage(lang.code)"
          >
            <span class="flag">{{ lang.flag }}</span>
            <span class="name">{{ lang.name }}</span>
          </button>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLanguage, availableLanguages } from '@/i18n'

const isOpen = ref(false)
const { locale } = useI18n()

const currentCode = computed(() => locale.value)
const currentFlag = computed(() => {
  const lang = availableLanguages.find(l => l.code === currentCode.value)
  return lang?.flag || '🌐'
})

const selectLanguage = (langCode: string) => {
  setLanguage(langCode)
  isOpen.value = false
}
</script>

<style scoped>
.language-switcher {
  display: inline-block;
}

.lang-dropdown {
  position: relative;
}

.lang-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.lang-button:hover {
  border-color: #0ea5e9;
  background-color: #f0f9ff;
}

.flag {
  font-size: 1rem;
}

.code {
  font-weight: 500;
  color: #1e293b;
}

.chevron {
  transition: transform 0.2s ease;
}

.chevron.rotate {
  transform: rotate(180deg);
}

.lang-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 50;
  min-width: 150px;
}

.lang-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s ease;
  font-size: 0.875rem;
}

.lang-option:hover {
  background-color: #f8fafc;
}

.lang-option.active {
  background-color: #f0f9ff;
  color: #0ea5e9;
  font-weight: 600;
}

.lang-option:first-child {
  border-radius: 0.5rem 0.5rem 0 0;
}

.lang-option:last-child {
  border-radius: 0 0 0.5rem 0.5rem;
}

.name {
  flex: 1;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

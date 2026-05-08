/// <reference types="vite/client" />

declare module '@heroicons/vue/24/outline' {
  import { defineComponent } from 'vue'
  const CheckBadgeIcon: ReturnType<typeof defineComponent>
  const CheckCircleIcon: ReturnType<typeof defineComponent>
  const ExclamationCircleIcon: ReturnType<typeof defineComponent>
  const InformationCircleIcon: ReturnType<typeof defineComponent>
  const QuestionMarkCircleIcon: ReturnType<typeof defineComponent>
  export {
    CheckBadgeIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    InformationCircleIcon,
    QuestionMarkCircleIcon
  }
}

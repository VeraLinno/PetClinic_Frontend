/// <reference types="vite/client" />

declare module '@heroicons/vue/24/outline' {
  import { DefineComponent } from 'vue'

  type IconComponent = DefineComponent<any, any, any>

  export const ArrowRightOnRectangleIcon: IconComponent
  export const ArrowPathIcon: IconComponent
  export const ArrowRightStartOnRectangleIcon: IconComponent
  export const Bars3Icon: IconComponent
  export const CheckBadgeIcon: IconComponent
  export const CheckCircleIcon: IconComponent
  export const ChevronRightIcon: IconComponent
  export const ClockIcon: IconComponent
  export const CreditCardIcon: IconComponent
  export const DocumentTextIcon: IconComponent
  export const ExclamationCircleIcon: IconComponent
  export const ExclamationTriangleIcon: IconComponent
  export const HeartIcon: IconComponent
  export const HomeIcon: IconComponent
  export const IdentificationIcon: IconComponent
  export const InformationCircleIcon: IconComponent
  export const ListBulletIcon: IconComponent
  export const MagnifyingGlassIcon: IconComponent
  export const MoonIcon: IconComponent
  export const PlusCircleIcon: IconComponent
  export const QuestionMarkCircleIcon: IconComponent
  export const ShieldCheckIcon: IconComponent
  export const ShoppingBagIcon: IconComponent
  export const SparklesIcon: IconComponent
  export const SunIcon: IconComponent
  export const UsersIcon: IconComponent
  export const XMarkIcon: IconComponent

  // Fallback - allow other icons to be imported without TS errors
  export as namespace HeroIconsOutline
}

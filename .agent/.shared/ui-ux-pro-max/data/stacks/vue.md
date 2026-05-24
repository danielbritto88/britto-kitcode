# Vue.js Guidelines

> Auto-generated from `vue.csv`. Sections enable targeted reads.

## Composition

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Use Composition API for new projects | Composition API offers better TypeScript support and logic reuse | <script setup> for components | Options API for new projects | <script setup> | export default { data() } | Medium | https://vuejs.org/guide/extras/composition-api-faq.html |
| 2 | Use script setup syntax | Cleaner syntax with automatic exports | <script setup> with defineProps | setup() function manually | <script setup> | <script> setup() { return {} } | Low | https://vuejs.org/api/sfc-script-setup.html |

## Reactivity

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 3 | Use ref for primitives | ref() for primitive values that need reactivity | ref() for strings numbers booleans | reactive() for primitives | const count = ref(0) | const count = reactive(0) | Medium | https://vuejs.org/guide/essentials/reactivity-fundamentals.html |
| 4 | Use reactive for objects | reactive() for complex objects and arrays | reactive() for objects with multiple properties | ref() for complex objects | const state = reactive({ user: null }) | const state = ref({ user: null }) | Medium |  |
| 5 | Access ref values with .value | Remember .value in script unwrap in template | Use .value in script | Forget .value in script | count.value++ | count++ (in script) | High |  |
| 6 | Use computed for derived state | Computed properties cache and update automatically | computed() for derived values | Methods for derived values | const doubled = computed(() => count.value * 2) | const doubled = () => count.value * 2 | Medium | https://vuejs.org/guide/essentials/computed.html |
| 7 | Use shallowRef for large objects | Avoid deep reactivity for performance | shallowRef for large data structures | ref for large nested objects | const bigData = shallowRef(largeObject) | const bigData = ref(largeObject) | Medium | https://vuejs.org/api/reactivity-advanced.html#shallowref |

## Watchers

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 8 | Use watchEffect for simple cases | Auto-tracks dependencies | watchEffect for simple reactive effects | watch with explicit deps when not needed | watchEffect(() => console.log(count.value)) | watch(count, (val) => console.log(val)) | Low | https://vuejs.org/guide/essentials/watchers.html |
| 9 | Use watch for specific sources | Explicit control over what to watch | watch with specific refs | watchEffect for complex conditional logic | watch(userId, fetchUser) | watchEffect with conditionals | Medium |  |
| 10 | Clean up side effects | Return cleanup function in watchers | Return cleanup in watchEffect | Leave subscriptions open | watchEffect((onCleanup) => { onCleanup(unsub) }) | watchEffect without cleanup | High |  |

## Props

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 11 | Define props with defineProps | Type-safe prop definitions | defineProps with TypeScript | Props without types | defineProps<{ msg: string }>() | defineProps(['msg']) | Medium | https://vuejs.org/guide/typescript/composition-api.html#typing-component-props |
| 12 | Use withDefaults for default values | Provide defaults for optional props | withDefaults with defineProps | Defaults in destructuring | withDefaults(defineProps<Props>(), { count: 0 }) | const { count = 0 } = defineProps() | Medium |  |
| 13 | Avoid mutating props | Props should be read-only | Emit events to parent for changes | Direct prop mutation | emit('update:modelValue', newVal) | props.modelValue = newVal | High |  |

## Emits

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 14 | Define emits with defineEmits | Type-safe event emissions | defineEmits with types | Emit without definition | defineEmits<{ change: [id: number] }>() | emit('change', id) without define | Medium | https://vuejs.org/guide/typescript/composition-api.html#typing-component-emits |
| 15 | Use v-model for two-way binding | Simplified parent-child data flow | v-model with modelValue prop | :value + @input manually | <Child v-model="value"/> | <Child :value="value" @input="value = $event"/> | Low | https://vuejs.org/guide/components/v-model.html |

## Lifecycle

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 16 | Use onMounted for DOM access | DOM is ready in onMounted | onMounted for DOM operations | Access DOM in setup directly | onMounted(() => el.value.focus()) | el.value.focus() in setup | High | https://vuejs.org/api/composition-api-lifecycle.html |
| 17 | Clean up in onUnmounted | Remove listeners and subscriptions | onUnmounted for cleanup | Leave listeners attached | onUnmounted(() => window.removeEventListener()) | No cleanup on unmount | High |  |
| 18 | Avoid onBeforeMount for data | Use onMounted or setup for data fetching | Fetch in onMounted or setup | Fetch in onBeforeMount | onMounted(async () => await fetchData()) | onBeforeMount(async () => await fetchData()) | Low |  |

## Components

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 19 | Use single-file components | Keep template script style together | .vue files for components | Separate template/script files | Component.vue with all parts | Component.js + Component.html | Low |  |
| 20 | Use PascalCase for components | Consistent component naming | PascalCase in imports and templates | kebab-case in script | <MyComponent/> | <my-component/> | Low | https://vuejs.org/style-guide/rules-strongly-recommended.html |
| 21 | Prefer composition over mixins | Composables replace mixins | Composables for shared logic | Mixins for code reuse | const { data } = useApi() | mixins: [apiMixin] | Medium |  |

## Composables

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 22 | Name composables with use prefix | Convention for composable functions | useFetch useAuth useForm | getData or fetchApi | export function useFetch() | export function fetchData() | Medium | https://vuejs.org/guide/reusability/composables.html |
| 23 | Return refs from composables | Maintain reactivity when destructuring | Return ref values | Return reactive objects that lose reactivity | return { data: ref(null) } | return reactive({ data: null }) | Medium |  |
| 24 | Accept ref or value params | Use toValue for flexible inputs | toValue() or unref() for params | Only accept ref or only value | const val = toValue(maybeRef) | const val = maybeRef.value | Low | https://vuejs.org/api/reactivity-utilities.html#tovalue |

## Templates

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 25 | Use v-bind shorthand | Cleaner template syntax | :prop instead of v-bind:prop | Full v-bind syntax | <div :class="cls"> | <div v-bind:class="cls"> | Low |  |
| 26 | Use v-on shorthand | Cleaner event binding | @event instead of v-on:event | Full v-on syntax | <button @click="handler"> | <button v-on:click="handler"> | Low |  |
| 27 | Avoid v-if with v-for | v-if has higher priority causes issues | Wrap in template or computed filter | v-if on same element as v-for | <template v-for><div v-if> | <div v-for v-if> | High | https://vuejs.org/style-guide/rules-essential.html#avoid-v-if-with-v-for |
| 28 | Use key with v-for | Proper list rendering and updates | Unique key for each item | Index as key for dynamic lists | v-for="item in items" :key="item.id" | v-for="(item, i) in items" :key="i" | High |  |

## State

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 29 | Use Pinia for global state | Official state management for Vue 3 | Pinia stores for shared state | Vuex for new projects | const store = useCounterStore() | Vuex with mutations | Medium | https://pinia.vuejs.org/ |
| 30 | Define stores with defineStore | Composition API style stores | Setup stores with defineStore | Options stores for complex state | defineStore('counter', () => {}) | defineStore('counter', { state }) | Low |  |
| 31 | Use storeToRefs for destructuring | Maintain reactivity when destructuring | storeToRefs(store) | Direct destructuring | const { count } = storeToRefs(store) | const { count } = store | High | https://pinia.vuejs.org/core-concepts/#destructuring-from-a-store |

## Routing

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 32 | Use useRouter and useRoute | Composition API router access | useRouter() useRoute() in setup | this.$router this.$route | const router = useRouter() | this.$router.push() | Medium | https://router.vuejs.org/guide/advanced/composition-api.html |
| 33 | Lazy load route components | Code splitting for routes | () => import() for components | Static imports for all routes | component: () => import('./Page.vue') | component: Page | Medium | https://router.vuejs.org/guide/advanced/lazy-loading.html |
| 34 | Use navigation guards | Protect routes and handle redirects | beforeEach for auth checks | Check auth in each component | router.beforeEach((to) => {}) | Check auth in onMounted | Medium |  |

## Performance

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 35 | Use v-once for static content | Skip re-renders for static elements | v-once on never-changing content | v-once on dynamic content | <div v-once>{{ staticText }}</div> | <div v-once>{{ dynamicText }}</div> | Low | https://vuejs.org/api/built-in-directives.html#v-once |
| 36 | Use v-memo for expensive lists | Memoize list items | v-memo with dependency array | Re-render entire list always | <div v-for v-memo="[item.id]"> | <div v-for> without memo | Medium | https://vuejs.org/api/built-in-directives.html#v-memo |
| 37 | Use shallowReactive for flat objects | Avoid deep reactivity overhead | shallowReactive for flat state | reactive for simple objects | shallowReactive({ count: 0 }) | reactive({ count: 0 }) | Low |  |
| 38 | Use defineAsyncComponent | Lazy load heavy components | defineAsyncComponent for modals dialogs | Import all components eagerly | defineAsyncComponent(() => import()) | import HeavyComponent from | Medium | https://vuejs.org/guide/components/async.html |

## TypeScript

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 39 | Use generic components | Type-safe reusable components | Generic with defineComponent | Any types in components | <script setup lang="ts" generic="T"> | <script setup> without types | Medium | https://vuejs.org/guide/typescript/composition-api.html |
| 40 | Type template refs | Proper typing for DOM refs | ref<HTMLInputElement>(null) | ref(null) without type | const input = ref<HTMLInputElement>(null) | const input = ref(null) | Medium |  |
| 41 | Use PropType for complex props | Type complex prop types | PropType<User> for object props | Object without type | type: Object as PropType<User> | type: Object | Medium |  |

## Testing

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 42 | Use Vue Test Utils | Official testing library | mount shallowMount for components | Manual DOM testing | import { mount } from '@vue/test-utils' | document.createElement | Medium | https://test-utils.vuejs.org/ |
| 43 | Test component behavior | Focus on inputs and outputs | Test props emit and rendered output | Test internal implementation | expect(wrapper.text()).toContain() | expect(wrapper.vm.internalState) | Medium |  |

## Forms

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 44 | Use v-model modifiers | Built-in input handling | .lazy .number .trim modifiers | Manual input parsing | <input v-model.number="age"> | <input v-model="age"> then parse | Low | https://vuejs.org/guide/essentials/forms.html#modifiers |
| 45 | Use VeeValidate or FormKit | Form validation libraries | VeeValidate for complex forms | Manual validation logic | useField useForm from vee-validate | Custom validation in each input | Medium |  |

## Accessibility

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 46 | Use semantic elements | Proper HTML elements in templates | button nav main for purpose | div for everything | <button @click> | <div @click> | High |  |
| 47 | Bind aria attributes dynamically | Keep ARIA in sync with state | :aria-expanded="isOpen" | Static ARIA values | :aria-expanded="menuOpen" | aria-expanded="true" | Medium |  |

## SSR

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 48 | Use Nuxt for SSR | Full-featured SSR framework | Nuxt 3 for SSR apps | Manual SSR setup | npx nuxi init my-app | Custom SSR configuration | Medium | https://nuxt.com/ |
| 49 | Handle hydration mismatches | Client/server content must match | ClientOnly for browser-only content | Different content server/client | <ClientOnly><BrowserWidget/></ClientOnly> | <div>{{ Date.now() }}</div> | High |  |

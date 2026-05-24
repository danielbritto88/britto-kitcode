# Svelte Guidelines

> Auto-generated from `svelte.csv`. Sections enable targeted reads.

## Reactivity

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Use $: for reactive statements | Automatic dependency tracking | $: for derived values | Manual recalculation | $: doubled = count * 2 | let doubled; count && (doubled = count * 2) | Medium | https://svelte.dev/docs/svelte-components#script-3-$-marks-a-statement-as-reactive |
| 2 | Trigger reactivity with assignment | Svelte tracks assignments not mutations | Reassign arrays/objects to trigger update | Mutate without reassignment | items = [...items, newItem] | items.push(newItem) | High | https://svelte.dev/docs/svelte-components#script-2-assignments-are-reactive |
| 3 | Use $state in Svelte 5 | Runes for explicit reactivity | let count = $state(0) | Implicit reactivity in Svelte 5 | let count = $state(0) | let count = 0 (Svelte 5) | Medium | https://svelte.dev/blog/runes |
| 4 | Use $derived for computed values | $derived replaces $: in Svelte 5 | let doubled = $derived(count * 2) | $: in Svelte 5 | let doubled = $derived(count * 2) | $: doubled = count * 2 (Svelte 5) | Medium |  |
| 5 | Use $effect for side effects | $effect replaces $: side effects | Use $effect for subscriptions | $: for side effects in Svelte 5 | $effect(() => console.log(count)) | $: console.log(count) (Svelte 5) | Medium |  |

## Props

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 6 | Export let for props | Declare props with export let | export let propName | Props without export | export let count = 0 | let count = 0 | High | https://svelte.dev/docs/svelte-components#script-1-export-creates-a-component-prop |
| 7 | Use $props in Svelte 5 | $props rune for prop access | let { name } = $props() | export let in Svelte 5 | let { name, age = 0 } = $props() | export let name; export let age = 0 | Medium |  |
| 8 | Provide default values | Default props with assignment | export let count = 0 | Required props without defaults | export let count = 0 | export let count | Low |  |
| 9 | Use spread props | Pass through unknown props | {...$$restProps} on elements | Manual prop forwarding | <button {...$$restProps}> | <button class={$$props.class}> | Low | https://svelte.dev/docs/basic-markup#attributes-and-props |

## Bindings

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 10 | Use bind: for two-way binding | Simplified input handling | bind:value for inputs | on:input with manual update | <input bind:value={name}> | <input value={name} on:input={e => name = e.target.value}> | Low | https://svelte.dev/docs/element-directives#bind-property |
| 11 | Bind to DOM elements | Reference DOM nodes | bind:this for element reference | querySelector in onMount | <div bind:this={el}> | onMount(() => el = document.querySelector()) | Medium |  |
| 12 | Use bind:group for radios/checkboxes | Simplified group handling | bind:group for radio/checkbox groups | Manual checked handling | <input type="radio" bind:group={selected}> | <input type="radio" checked={selected === value}> | Low |  |

## Events

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 13 | Use on: for event handlers | Event directive syntax | on:click={handler} | addEventListener in onMount | <button on:click={handleClick}> | onMount(() => btn.addEventListener()) | Medium | https://svelte.dev/docs/element-directives#on-eventname |
| 14 | Forward events with on:event | Pass events to parent | on:click without handler | createEventDispatcher for DOM events | <button on:click> | dispatch('click', event) | Low |  |
| 15 | Use createEventDispatcher | Custom component events | dispatch for custom events | on:event for custom events | dispatch('save', { data }) | on:save without dispatch | Medium | https://svelte.dev/docs/svelte#createeventdispatcher |

## Lifecycle

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 16 | Use onMount for initialization | Run code after component mounts | onMount for setup and data fetching | Code in script body for side effects | onMount(() => fetchData()) | fetchData() in script body | High | https://svelte.dev/docs/svelte#onmount |
| 17 | Return cleanup from onMount | Automatic cleanup on destroy | Return function from onMount | Separate onDestroy for paired cleanup | onMount(() => { sub(); return unsub }) | onMount(sub); onDestroy(unsub) | Medium |  |
| 18 | Use onDestroy sparingly | Only when onMount cleanup not possible | onDestroy for non-mount cleanup | onDestroy for mount-related cleanup | onDestroy for store unsubscribe | onDestroy(() => clearInterval(id)) | Low |  |
| 19 | Avoid beforeUpdate/afterUpdate | Usually not needed | Reactive statements instead | beforeUpdate for derived state | $: if (x) doSomething() | beforeUpdate(() => doSomething()) | Low |  |

## Stores

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 20 | Use writable for mutable state | Basic reactive store | writable for shared mutable state | Local variables for shared state | const count = writable(0) | let count = 0 in module | Medium | https://svelte.dev/docs/svelte-store#writable |
| 21 | Use readable for read-only state | External data sources | readable for derived/external data | writable for read-only data | readable(0, set => interval(set)) | writable(0) for timer | Low | https://svelte.dev/docs/svelte-store#readable |
| 22 | Use derived for computed stores | Combine or transform stores | derived for computed values | Manual subscription for derived | derived(count, $c => $c * 2) | count.subscribe(c => doubled = c * 2) | Medium | https://svelte.dev/docs/svelte-store#derived |
| 23 | Use $ prefix for auto-subscription | Automatic subscribe/unsubscribe | $storeName in components | Manual subscription | {$count} | count.subscribe(c => value = c) | High |  |
| 24 | Clean up custom subscriptions | Unsubscribe when component destroys | Return unsubscribe from onMount | Leave subscriptions open | onMount(() => store.subscribe(fn)) | store.subscribe(fn) in script | High |  |

## Slots

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 25 | Use slots for composition | Content projection | <slot> for flexible content | Props for all content | <slot>Default</slot> | <Component content="text"/> | Medium | https://svelte.dev/docs/special-elements#slot |
| 26 | Name slots for multiple areas | Multiple content areas | <slot name="header"> | Single slot for complex layouts | <slot name="header"><slot name="footer"> | <slot> with complex conditionals | Low |  |
| 27 | Check slot content with $$slots | Conditional slot rendering | $$slots.name for conditional rendering | Always render slot wrapper | {#if $$slots.footer}<slot name="footer"/>{/if} | <div><slot name="footer"/></div> | Low |  |

## Styling

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 28 | Use scoped styles by default | Styles scoped to component | <style> for component styles | Global styles for component | :global() only when needed | <style> all global | Medium | https://svelte.dev/docs/svelte-components#style |
| 29 | Use :global() sparingly | Escape scoping when needed | :global for third-party styling | Global for all styles | :global(.external-lib) | <style> without scoping | Medium |  |
| 30 | Use CSS variables for theming | Dynamic styling | CSS custom properties | Inline styles for themes | style="--color: {color}" | style="color: {color}" | Low |  |

## Transitions

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 31 | Use built-in transitions | Svelte transition directives | transition:fade for simple effects | Manual CSS transitions | <div transition:fade> | <div class:fade={visible}> | Low | https://svelte.dev/docs/element-directives#transition-fn |
| 32 | Use in: and out: separately | Different enter/exit animations | in:fly out:fade for asymmetric | Same transition for both | <div in:fly out:fade> | <div transition:fly> | Low |  |
| 33 | Add local modifier | Prevent ancestor trigger | transition:fade\|local | Global transitions for lists | <div transition:slide\|local> | <div transition:slide> | Medium |  |

## Actions

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 34 | Use actions for DOM behavior | Reusable DOM logic | use:action for DOM enhancements | onMount for each usage | <div use:clickOutside> | onMount(() => setupClickOutside(el)) | Medium | https://svelte.dev/docs/element-directives#use-action |
| 35 | Return update and destroy | Lifecycle methods for actions | Return { update, destroy } | Only initial setup | return { update(params) {}, destroy() {} } | return destroy only | Medium |  |
| 36 | Pass parameters to actions | Configure action behavior | use:action={params} | Hardcoded action behavior | <div use:tooltip={options}> | <div use:tooltip> | Low |  |

## Logic

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 37 | Use {#if} for conditionals | Template conditionals | {#if} {:else if} {:else} | Ternary in expressions | {#if cond}...{:else}...{/if} | {cond ? a : b} for complex | Low | https://svelte.dev/docs/logic-blocks#if |
| 38 | Use {#each} for lists | List rendering | {#each} with key | Map in expression | {#each items as item (item.id)} | {items.map(i => `<div>${i}</div>`)} | Medium |  |
| 39 | Always use keys in {#each} | Proper list reconciliation | (item.id) for unique key | Index as key or no key | {#each items as item (item.id)} | {#each items as item, i (i)} | High |  |
| 40 | Use {#await} for promises | Handle async states | {#await} for loading/error states | Manual promise handling | {#await promise}...{:then}...{:catch} | {#if loading}...{#if error} | Medium | https://svelte.dev/docs/logic-blocks#await |

## SvelteKit

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 41 | Use +page.svelte for routes | File-based routing | +page.svelte for route components | Custom routing setup | routes/about/+page.svelte | routes/About.svelte | Medium | https://kit.svelte.dev/docs/routing |
| 42 | Use +page.js for data loading | Load data before render | load function in +page.js | onMount for data fetching | export function load() {} | onMount(() => fetchData()) | High | https://kit.svelte.dev/docs/load |
| 43 | Use +page.server.js for server-only | Server-side data loading | +page.server.js for sensitive data | +page.js for API keys | +page.server.js with DB access | +page.js with DB access | High |  |
| 44 | Use form actions | Server-side form handling | +page.server.js actions | API routes for forms | export const actions = { default } | fetch('/api/submit') | Medium | https://kit.svelte.dev/docs/form-actions |
| 45 | Use $app/stores for app state | $page $navigating $updated | $page for current page data | Manual URL parsing | import { page } from '$app/stores' | window.location.pathname | Medium | https://kit.svelte.dev/docs/modules#$app-stores |

## Performance

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 46 | Use {#key} for forced re-render | Reset component state | {#key id} for fresh instance | Manual destroy/create | {#key item.id}<Component/>{/key} | on:change={() => component = null} | Low | https://svelte.dev/docs/logic-blocks#key |
| 47 | Avoid unnecessary reactivity | Not everything needs $: | $: only for side effects | $: for simple assignments | $: if (x) console.log(x) | $: y = x (when y = x works) | Low |  |
| 48 | Use immutable compiler option | Skip equality checks | immutable: true for large lists | Default for all components | <svelte:options immutable/> | Default without immutable | Low |  |

## TypeScript

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 49 | Use lang="ts" in script | TypeScript support | <script lang="ts"> | JavaScript for typed projects | <script lang="ts"> | <script> with JSDoc | Medium | https://svelte.dev/docs/typescript |
| 50 | Type props with interface | Explicit prop types | interface $$Props for types | Untyped props | interface $$Props { name: string } | export let name | Medium |  |
| 51 | Type events with createEventDispatcher | Type-safe events | createEventDispatcher<Events>() | Untyped dispatch | createEventDispatcher<{ save: Data }>() | createEventDispatcher() | Medium |  |

## Accessibility

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 52 | Use semantic elements | Proper HTML in templates | button nav main appropriately | div for everything | <button on:click> | <div on:click> | High |  |
| 53 | Add aria to dynamic content | Accessible state changes | aria-live for updates | Silent dynamic updates | <div aria-live="polite">{message}</div> | <div>{message}</div> | Medium |  |

# Web Interface Best Practices

> Auto-generated from `web-interface.csv`. Sections enable targeted reads.

## Accessibility

| Issue | Keywords | Platform | Description | Do | Don't | Code Example Good | Code Example Bad | Severity |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Icon Button Labels | icon button aria-label | Web | Icon-only buttons must have accessible names | Add aria-label to icon buttons | Icon button without label | <button aria-label='Close'><XIcon /></button> | <button><XIcon /></button> | Critical |
| Form Control Labels | form input label aria | Web | All form controls need labels or aria-label | Use label element or aria-label | Input without accessible name | <label for='email'>Email</label><input id='email' /> | <input placeholder='Email' /> | Critical |
| Keyboard Handlers | keyboard onclick onkeydown | Web | Interactive elements must support keyboard interaction | Add onKeyDown alongside onClick | Click-only interaction | <div onClick={fn} onKeyDown={fn} tabIndex={0}> | <div onClick={fn}> | High |
| Semantic HTML | semantic button a label | Web | Use semantic HTML before ARIA attributes | Use button/a/label elements | Div with role attribute | <button onClick={fn}>Submit</button> | <div role='button' onClick={fn}>Submit</div> | High |
| Aria Live | aria-live polite async | Web | Async updates need aria-live for screen readers | Add aria-live='polite' for dynamic content | Silent async updates | <div aria-live='polite'>{status}</div> | <div>{status}</div> // no announcement | Medium |
| Decorative Icons | aria-hidden decorative icon | Web | Decorative icons should be hidden from screen readers | Add aria-hidden='true' to decorative icons | Decorative icon announced | <Icon aria-hidden='true' /> | <Icon /> // announced as 'image' | Medium |

## Focus

| Issue | Keywords | Platform | Description | Do | Don't | Code Example Good | Code Example Bad | Severity |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Visible Focus States | focus-visible outline ring | Web | All interactive elements need visible focus states | Use :focus-visible with ring/outline | No focus indication | focus-visible:ring-2 focus-visible:ring-blue-500 | outline-none // no replacement | Critical |
| Never Remove Outline | outline-none focus replacement | Web | Never remove outline without providing replacement | Replace outline with visible alternative | Remove outline completely | focus:outline-none focus:ring-2 | focus:outline-none // nothing else | Critical |
| Checkbox Radio Hit Target | checkbox radio label target | Web | Checkbox/radio must share hit target with label | Wrap input and label together | Separate tiny checkbox | <label class='flex gap-2'><input type='checkbox' /><span>Option</span></label> | <input type='checkbox' id='x' /><label for='x'>Option</label> | Medium |

## Forms

| Issue | Keywords | Platform | Description | Do | Don't | Code Example Good | Code Example Bad | Severity |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Autocomplete Attribute | autocomplete input form | Web | Inputs need autocomplete attribute for autofill | Add appropriate autocomplete value | Missing autocomplete | <input autocomplete='email' type='email' /> | <input type='email' /> | High |
| Semantic Input Types | input type email tel url | Web | Use semantic input type attributes | Use email/tel/url/number types | text type for everything | <input type='email' /> | <input type='text' /> // for email | Medium |
| Never Block Paste | paste onpaste password | Web | Never prevent paste functionality | Allow paste on all inputs | Block paste on password/code | <input type='password' /> | <input onPaste={e => e.preventDefault()} /> | High |
| Spellcheck Disable | spellcheck email code | Web | Disable spellcheck on emails and codes | Set spellcheck='false' on codes | Spellcheck on technical input | <input spellCheck='false' type='email' /> | <input type='email' /> // red squiggles | Low |
| Submit Button Enabled | submit button disabled loading | Web | Keep submit enabled and show spinner during requests | Show loading spinner keep enabled | Disable button during submit | <button>{loading ? <Spinner /> : 'Submit'}</button> | <button disabled={loading}>Submit</button> | Medium |
| Inline Errors | error message inline focus | Web | Show error messages inline near the problem field | Inline error with focus on first error | Single error at top | <input /><span class='text-red-500'>{error}</span> | <div class='error'>{allErrors}</div> // at top | High |

## Performance

| Issue | Keywords | Platform | Description | Do | Don't | Code Example Good | Code Example Bad | Severity |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Virtualize Lists | virtualize list 50 items | Web | Virtualize lists exceeding 50 items | Use virtual list for large datasets | Render all items | <VirtualList items={items} /> | items.map(item => <Item />) | High |
| Avoid Layout Reads | layout read render getboundingclientrect | Web | Avoid layout reads during render phase | Read layout in effects or callbacks | getBoundingClientRect in render | useEffect(() => { el.getBoundingClientRect() }) | const rect = el.getBoundingClientRect() // in render | Medium |
| Batch DOM Operations | batch dom write read | Web | Group DOM operations to minimize reflows | Batch writes then reads | Interleave reads and writes | writes.forEach(w => w()); reads.forEach(r => r()) | write(); read(); write(); read(); // thrashing | Medium |
| Preconnect CDN | preconnect link cdn | Web | Add preconnect links for CDN domains | Preconnect to known domains | <link rel='preconnect' href='https://cdn.example.com' /> | // no preconnect hint | Low |  |
| Lazy Load Images | lazy loading image below-fold | Web | Lazy-load images below the fold | Use loading='lazy' for below-fold images | Load all images eagerly | <img loading='lazy' src='...' /> | <img src='...' /> // above fold only | Medium |

## State

| Issue | Keywords | Platform | Description | Do | Don't | Code Example Good | Code Example Bad | Severity |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| URL Reflects State | url state query params | Web | URL should reflect current UI state | Sync filters/tabs/pagination to URL | State only in memory | ?tab=settings&page=2 | useState only // lost on refresh | High |
| Deep Linking | deep link stateful component | Web | Stateful components should support deep-linking | Enable sharing current view via URL | No shareable state | router.push({ query: { ...filters } }) | setFilters(f) // not in URL | Medium |
| Confirm Destructive Actions | confirm destructive delete modal | Web | Destructive actions require confirmation | Show confirmation dialog before delete | Delete without confirmation | if (confirm('Delete?')) delete() | onClick={delete} // no confirmation | High |

## Typography

| Issue | Keywords | Platform | Description | Do | Don't | Code Example Good | Code Example Bad | Severity |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Proper Unicode | unicode ellipsis quotes | Web | Use proper Unicode characters | Use ... curly quotes proper dashes | ASCII approximations | 'Hello...' with proper ellipsis | 'Hello...' with three dots | Low |
| Text Overflow | truncate line-clamp overflow | Web | Handle text overflow properly | Use truncate/line-clamp/break-words | Text overflows container | <p class='truncate'>Long text...</p> | <p>Long text...</p> // overflows | Medium |
| Non-Breaking Spaces | nbsp unit brand | Web | Use non-breaking spaces for units and brand names | Use &nbsp; between number and unit | 10&nbsp;kg or Next.js&nbsp;14 | 10 kg // may wrap | Low |  |

## Anti-Pattern

| Issue | Keywords | Platform | Description | Do | Don't | Code Example Good | Code Example Bad | Severity |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| No Zoom Disable | viewport zoom disable | Web | Never disable zoom in viewport meta | Allow user zoom | <meta name='viewport' content='width=device-width'> | <meta name='viewport' content='maximum-scale=1'> | Critical |  |
| No Transition All | transition all specific | Web | Avoid transition: all - specify properties | Transition specific properties | transition: all | transition-colors duration-200 | transition-all duration-200 | Medium |
| Outline Replacement | outline-none ring focus | Web | Never use outline-none without replacement | Provide visible focus replacement | Remove outline with nothing | focus:outline-none focus:ring-2 focus:ring-blue-500 | focus:outline-none // alone | Critical |
| No Hardcoded Dates | date format intl locale | Web | Use Intl for date/number formatting | Use Intl.DateTimeFormat | Hardcoded date format | new Intl.DateTimeFormat('en').format(date) | date.toLocaleDateString() // or manual format | Medium |

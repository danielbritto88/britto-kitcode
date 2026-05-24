# React Guidelines

> Auto-generated from `react.csv`. Sections enable targeted reads.

## State

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Use useState for local state | Simple component state should use useState hook | useState for form inputs toggles counters | Class components this.state | const [count, setCount] = useState(0) | this.state = { count: 0 } | Medium | https://react.dev/reference/react/useState |
| 2 | Lift state up when needed | Share state between siblings by lifting to parent | Lift shared state to common ancestor | Prop drilling through many levels | Parent holds state passes down | Deep prop chains | Medium | https://react.dev/learn/sharing-state-between-components |
| 3 | Use useReducer for complex state | Complex state logic benefits from reducer pattern | useReducer for state with multiple sub-values | Multiple useState for related values | useReducer with action types | 5+ useState calls that update together | Medium | https://react.dev/reference/react/useReducer |
| 4 | Avoid unnecessary state | Derive values from existing state when possible | Compute derived values in render | Store derivable values in state | const total = items.reduce(...) | const [total, setTotal] = useState(0) | High | https://react.dev/learn/choosing-the-state-structure |
| 5 | Initialize state lazily | Use function form for expensive initial state | useState(() => computeExpensive()) | useState(computeExpensive()) | useState(() => JSON.parse(data)) | useState(JSON.parse(data)) | Medium | https://react.dev/reference/react/useState#avoiding-recreating-the-initial-state |

## Effects

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 6 | Clean up effects | Return cleanup function for subscriptions timers | Return cleanup function in useEffect | No cleanup for subscriptions | useEffect(() => { sub(); return unsub; }) | useEffect(() => { subscribe(); }) | High | https://react.dev/reference/react/useEffect#connecting-to-an-external-system |
| 7 | Specify dependencies correctly | Include all values used inside effect in deps array | All referenced values in dependency array | Empty deps with external references | [value] when using value in effect | [] when using props/state in effect | High | https://react.dev/reference/react/useEffect#specifying-reactive-dependencies |
| 8 | Avoid unnecessary effects | Don't use effects for transforming data or events | Transform data during render handle events directly | useEffect for derived state or event handling | const filtered = items.filter(...) | useEffect(() => setFiltered(items.filter(...))) | High | https://react.dev/learn/you-might-not-need-an-effect |
| 9 | Use refs for non-reactive values | Store values that don't trigger re-renders in refs | useRef for interval IDs DOM elements | useState for values that don't need render | const intervalRef = useRef(null) | const [intervalId, setIntervalId] = useState() | Medium | https://react.dev/reference/react/useRef |

## Rendering

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 10 | Use keys properly | Stable unique keys for list items | Use stable IDs as keys | Array index as key for dynamic lists | key={item.id} | key={index} | High | https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key |
| 11 | Memoize expensive calculations | Use useMemo for costly computations | useMemo for expensive filtering/sorting | Recalculate every render | useMemo(() => expensive(), [deps]) | const result = expensiveCalc() | Medium | https://react.dev/reference/react/useMemo |
| 12 | Memoize callbacks passed to children | Use useCallback for functions passed as props | useCallback for handlers passed to memoized children | New function reference every render | useCallback(() => {}, [deps]) | const handler = () => {} | Medium | https://react.dev/reference/react/useCallback |
| 13 | Use React.memo wisely | Wrap components that render often with same props | memo for pure components with stable props | memo everything or nothing | memo(ExpensiveList) | memo(SimpleButton) | Low | https://react.dev/reference/react/memo |
| 14 | Avoid inline object/array creation in JSX | Create objects outside render or memoize | Define style objects outside component | Inline objects in props | <div style={styles.container}> | <div style={{ margin: 10 }}> | Medium |  |

## Components

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 15 | Keep components small and focused | Single responsibility for each component | One concern per component | Large multi-purpose components | <UserAvatar /><UserName /> | <UserCard /> with 500 lines | Medium |  |
| 16 | Use composition over inheritance | Compose components using children and props | Use children prop for flexibility | Inheritance hierarchies | <Card>{content}</Card> | class SpecialCard extends Card | Medium | https://react.dev/learn/thinking-in-react |
| 17 | Colocate related code | Keep related components and hooks together | Related files in same directory | Flat structure with many files | components/User/UserCard.tsx | components/UserCard.tsx + hooks/useUser.ts | Low |  |
| 18 | Use fragments to avoid extra DOM | Fragment or <> for multiple elements without wrapper | <> for grouping without DOM node | Extra div wrappers | <>{items.map(...)}</> | <div>{items.map(...)}</div> | Low | https://react.dev/reference/react/Fragment |

## Props

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 19 | Destructure props | Destructure props for cleaner component code | Destructure in function signature | props.name props.value throughout | function User({ name, age }) | function User(props) | Low |  |
| 20 | Provide default props values | Use default parameters or defaultProps | Default values in destructuring | Undefined checks throughout | function Button({ size = 'md' }) | if (size === undefined) size = 'md' | Low |  |
| 21 | Avoid prop drilling | Use context or composition for deeply nested data | Context for global data composition for UI | Passing props through 5+ levels | <UserContext.Provider> | <A user={u}><B user={u}><C user={u}> | Medium | https://react.dev/learn/passing-data-deeply-with-context |
| 22 | Validate props with TypeScript | Use TypeScript interfaces for prop types | interface Props { name: string } | PropTypes or no validation | interface ButtonProps { onClick: () => void } | Button.propTypes = {} | Medium |  |

## Events

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 23 | Use synthetic events correctly | React normalizes events across browsers | e.preventDefault() e.stopPropagation() | Access native event unnecessarily | onClick={(e) => e.preventDefault()} | onClick={(e) => e.nativeEvent.preventDefault()} | Low | https://react.dev/reference/react-dom/components/common#react-event-object |
| 24 | Avoid binding in render | Use arrow functions in class or hooks | Arrow functions in functional components | bind in render or constructor | const handleClick = () => {} | this.handleClick.bind(this) | Medium |  |
| 25 | Pass event handlers not call results | Pass function reference not invocation | onClick={handleClick} | onClick={handleClick()} causing immediate call | onClick={handleClick} | onClick={handleClick()} | High |  |

## Forms

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 26 | Controlled components for forms | Use state to control form inputs | value + onChange for inputs | Uncontrolled inputs with refs | <input value={val} onChange={setVal}> | <input ref={inputRef}> | Medium | https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable |
| 27 | Handle form submission properly | Prevent default and handle in submit handler | onSubmit with preventDefault | onClick on submit button only | <form onSubmit={handleSubmit}> | <button onClick={handleSubmit}> | Medium |  |
| 28 | Debounce rapid input changes | Debounce search/filter inputs | useDeferredValue or debounce for search | Filter on every keystroke | useDeferredValue(searchTerm) | useEffect filtering on every change | Medium | https://react.dev/reference/react/useDeferredValue |

## Hooks

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 29 | Follow rules of hooks | Only call hooks at top level and in React functions | Hooks at component top level | Hooks in conditions loops or callbacks | const [x, setX] = useState() | if (cond) { const [x, setX] = useState() } | High | https://react.dev/reference/rules/rules-of-hooks |
| 30 | Custom hooks for reusable logic | Extract shared stateful logic to custom hooks | useCustomHook for reusable patterns | Duplicate hook logic across components | const { data } = useFetch(url) | Duplicate useEffect/useState in components | Medium | https://react.dev/learn/reusing-logic-with-custom-hooks |
| 31 | Name custom hooks with use prefix | Custom hooks must start with use | useFetch useForm useAuth | fetchData or getData for hook | function useFetch(url) | function fetchData(url) | High |  |

## Context

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 32 | Use context for global data | Context for theme auth locale | Context for app-wide state | Context for frequently changing data | <ThemeContext.Provider> | Context for form field values | Medium | https://react.dev/learn/passing-data-deeply-with-context |
| 33 | Split contexts by concern | Separate contexts for different domains | ThemeContext + AuthContext | One giant AppContext | <ThemeProvider><AuthProvider> | <AppProvider value={{theme user...}}> | Medium |  |
| 34 | Memoize context values | Prevent unnecessary re-renders with useMemo | useMemo for context value object | New object reference every render | value={useMemo(() => ({...}), [])} | value={{ user, theme }} | High |  |

## Performance

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 35 | Use React DevTools Profiler | Profile to identify performance bottlenecks | Profile before optimizing | Optimize without measuring | React DevTools Profiler | Guessing at bottlenecks | Medium | https://react.dev/learn/react-developer-tools |
| 36 | Lazy load components | Use React.lazy for code splitting | lazy() for routes and heavy components | Import everything upfront | const Page = lazy(() => import('./Page')) | import Page from './Page' | Medium | https://react.dev/reference/react/lazy |
| 37 | Virtualize long lists | Use windowing for lists over 100 items | react-window or react-virtual | Render thousands of DOM nodes | <VirtualizedList items={items}/> | {items.map(i => <Item />)} | High |  |
| 38 | Batch state updates | React 18 auto-batches but be aware | Let React batch related updates | Manual batching with flushSync | setA(1); setB(2); // batched | flushSync(() => setA(1)) | Low | https://react.dev/learn/queueing-a-series-of-state-updates |

## ErrorHandling

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 39 | Use error boundaries | Catch JavaScript errors in component tree | ErrorBoundary wrapping sections | Let errors crash entire app | <ErrorBoundary><App/></ErrorBoundary> | No error handling | High | https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary |
| 40 | Handle async errors | Catch errors in async operations | try/catch in async handlers | Unhandled promise rejections | try { await fetch() } catch(e) {} | await fetch() // no catch | High |  |

## Testing

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 41 | Test behavior not implementation | Test what user sees and does | Test renders and interactions | Test internal state or methods | expect(screen.getByText('Hello')) | expect(component.state.name) | Medium | https://testing-library.com/docs/react-testing-library/intro/ |
| 42 | Use testing-library queries | Use accessible queries | getByRole getByLabelText | getByTestId for everything | getByRole('button') | getByTestId('submit-btn') | Medium | https://testing-library.com/docs/queries/about#priority |

## Accessibility

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 43 | Use semantic HTML | Proper HTML elements for their purpose | button for clicks nav for navigation | div with onClick for buttons | <button onClick={...}> | <div onClick={...}> | High | https://react.dev/reference/react-dom/components#all-html-components |
| 44 | Manage focus properly | Handle focus for modals dialogs | Focus trap in modals return focus on close | No focus management | useEffect to focus input | Modal without focus trap | High |  |
| 45 | Announce dynamic content | Use ARIA live regions for updates | aria-live for dynamic updates | Silent updates to screen readers | <div aria-live="polite">{msg}</div> | <div>{msg}</div> | Medium |  |
| 46 | Label form controls | Associate labels with inputs | htmlFor matching input id | Placeholder as only label | <label htmlFor="email">Email</label> | <input placeholder="Email"/> | High |  |

## TypeScript

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 47 | Type component props | Define interfaces for all props | interface Props with all prop types | any or missing types | interface Props { name: string } | function Component(props: any) | High |  |
| 48 | Type state properly | Provide types for useState | useState<Type>() for complex state | Inferred any types | useState<User \| null>(null) | useState(null) | Medium |  |
| 49 | Type event handlers | Use React event types | React.ChangeEvent<HTMLInputElement> | Generic Event type | onChange: React.ChangeEvent<HTMLInputElement> | onChange: Event | Medium |  |
| 50 | Use generics for reusable components | Generic components for flexible typing | Generic props for list components | Union types for flexibility | <List<T> items={T[]}> | <List items={any[]}> | Medium |  |

## Patterns

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 51 | Container/Presentational split | Separate data logic from UI | Container fetches presentational renders | Mixed data and UI in one | <UserContainer><UserView/></UserContainer> | <User /> with fetch and render | Low |  |
| 52 | Render props for flexibility | Share code via render prop pattern | Render prop for customizable rendering | Duplicate logic across components | <DataFetcher render={data => ...}/> | Copy paste fetch logic | Low | https://react.dev/reference/react/cloneElement#passing-data-with-a-render-prop |
| 53 | Compound components | Related components sharing state | Tab + TabPanel sharing context | Prop drilling between related | <Tabs><Tab/><TabPanel/></Tabs> | <Tabs tabs={[]} panels={[...]}/> | Low |  |

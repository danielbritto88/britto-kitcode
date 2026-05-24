# Jetpack Compose Guidelines

> Auto-generated from `jetpack-compose.csv`. Sections enable targeted reads.

## Composable

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Pure UI composables | Composable functions should only render UI | Accept state and callbacks | Calling usecase/repo | Pure UI composable | Business logic in UI | High | https://developer.android.com/jetpack/compose/mental-model |
| 2 | Small composables | Each composable has single responsibility | Split into components | Huge composable | Reusable UI | Monolithic UI | Medium |  |
| 3 | Stateless by default | Prefer stateless composables | Hoist state | Local mutable state | Stateless UI | Hidden state | High | https://developer.android.com/jetpack/compose/state#state-hoisting |

## State

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 4 | Single source of truth | UI state comes from one source | StateFlow from VM | Multiple states | Unified UiState | Scattered state | High | https://developer.android.com/topic/architecture/ui-layer |
| 5 | Model UI State | Use sealed interface/data class | UiState.Loading | Boolean flags | Explicit state | Flag hell | High |  |
| 6 | remember only UI state | remember for UI-only state | Scroll, animation | Business state | Correct remember | Misuse remember | High | https://developer.android.com/jetpack/compose/state |
| 7 | rememberSaveable | Persist state across config | rememberSaveable | remember | State survives | State lost | High | https://developer.android.com/jetpack/compose/state#restore-ui-state |
| 8 | derivedStateOf | Optimize recomposition | derivedStateOf | Recompute always | Optimized | Jank | Medium | https://developer.android.com/jetpack/compose/performance |
| 46 | Snapshot state only | Use Compose state | mutableStateOf | Custom observable | Compose aware | Buggy UI | Medium |  |
| 47 | Avoid mutable collections | Immutable list/map | PersistentList | MutableList | Stable UI | Silent bug | High |  |

## SideEffect

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 9 | LaunchedEffect keys | Use correct keys | LaunchedEffect(id) | LaunchedEffect(Unit) | Scoped effect | Infinite loop | High | https://developer.android.com/jetpack/compose/side-effects |
| 10 | rememberUpdatedState | Avoid stale lambdas | rememberUpdatedState | Capture directly | Safe callback | Stale state | Medium | https://developer.android.com/jetpack/compose/side-effects |
| 11 | DisposableEffect | Clean up resources | onDispose | No cleanup | No leak | Memory leak | High |  |

## Architecture

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 12 | Unidirectional data flow | UI → VM → State | onEvent | Two-way binding | Predictable flow | Hard debug | High | https://developer.android.com/topic/architecture |
| 13 | No business logic in UI | Logic belongs to VM | Collect state | Call repo | Clean UI | Fat UI | High |  |
| 14 | Expose immutable state | Expose StateFlow | asStateFlow | Mutable exposed | Safe API | State mutation | High |  |

## Lifecycle

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 15 | Lifecycle-aware collect | Use collectAsStateWithLifecycle | Lifecycle aware | collectAsState | No leak | Leak | High | https://developer.android.com/jetpack/compose/lifecycle |
| 48 | RememberCoroutineScope usage | Only for UI jobs | UI coroutine | Long jobs | Scoped job | Leak | Medium | https://developer.android.com/jetpack/compose/side-effects#remembercoroutinescope |

## Navigation

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 16 | Event-based navigation | VM emits navigation event | VM: Channel + receiveAsFlow(), V: Collect with Dispatchers.Main.immediate | Nav in UI | Decoupled nav | Using State / SharedFlow for navigation -> event is replayed and navigation fires again (StateFlow) | High | https://developer.android.com/jetpack/compose/navigation |
| 17 | Typed routes | Use sealed routes | sealed class Route | String routes | Type-safe | Runtime crash | Medium |  |

## Performance

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 18 | Stable parameters | Prefer immutable/stable params | @Immutable | Mutable params | Stable recomposition | Extra recomposition | High | https://developer.android.com/jetpack/compose/performance |
| 19 | Use key in Lazy | Provide stable keys | key=id | No key | Stable list | Item jump | High |  |
| 20 | Avoid heavy work | No heavy computation in UI | Precompute in VM | Compute in UI | Smooth UI | Jank | High |  |
| 21 | Remember expensive objects | remember heavy objects | remember | Recreate each recomposition | Efficient | Wasteful | Medium |  |

## Theming

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 22 | Design system | Centralized theme | Material3 tokens | Hardcoded values | Consistent UI | Inconsistent | High | https://developer.android.com/jetpack/compose/themes |
| 23 | Dark mode support | Theme-based colors | colorScheme | Fixed color | Adaptive UI | Broken dark | Medium |  |
| 34 | No hardcoded text style | Use typography | MaterialTheme.typography | Hardcode sp | Scalable | Inconsistent | Medium |  |

## Layout

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 24 | Prefer Modifier over extra layouts | Use Modifier to adjust layout instead of adding wrapper composables | Use Modifier.padding() | Wrap content with extra Box | Padding via modifier | Box just for padding | High | https://developer.android.com/jetpack/compose/modifiers |
| 25 | Avoid deep layout nesting | Deep layout trees increase measure & layout cost | Keep layout flat | Box ? Column ? Box ? Row | Flat hierarchy | Deep nested tree | High |  |
| 26 | Use Row/Column for linear layout | Linear layouts are simpler and more performant | Use Row / Column | Custom layout for simple cases | Row/Column usage | Over-engineered layout | High |  |
| 27 | Use Box only for overlapping content | Box should be used only when children overlap | Stack elements | Use Box as Column | Proper overlay | Misused Box | Medium |  |
| 28 | Prefer LazyColumn over Column scroll | Lazy layouts are virtualized and efficient | LazyColumn | Column.verticalScroll() | Lazy list | Scrollable Column | High | https://developer.android.com/jetpack/compose/lists |
| 29 | Avoid nested scroll containers | Nested scrolling causes UX & performance issues | Single scroll container | Scroll inside scroll | One scroll per screen | Nested scroll | High |  |
| 30 | Avoid fillMaxSize by default | fillMaxSize may break parent constraints | Use exact size | Fill max everywhere | Constraint-aware size | Overfilled layout | Medium |  |
| 31 | Avoid intrinsic size unless necessary | Intrinsic measurement is expensive | Explicit sizing | IntrinsicSize.Min | Predictable layout | Expensive measure | High | https://developer.android.com/jetpack/compose/layout/intrinsics |
| 32 | Use Arrangement and Alignment APIs | Declare layout intent explicitly | Use Arrangement / Alignment | Manual spacing hacks | Declarative spacing | Magic spacing | High |  |
| 33 | Extract reusable layout patterns | Repeated layouts should be shared | Create layout composable | Copy-paste layouts | Reusable scaffold | Duplicated layout | High |  |

## Testing

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 35 | Stateless UI testing | Composable easy to test | Pass state | Hidden state | Testable | Hard test | High | https://developer.android.com/jetpack/compose/testing |
| 36 | Use testTag | Stable UI selectors | Modifier.testTag | Find by text | Stable tests | Flaky tests | Medium |  |

## Preview

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 37 | Multiple previews | Preview multiple states | @Preview | Single preview | Better dev UX | Misleading | Low | https://developer.android.com/jetpack/compose/tooling/preview |

## DI

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 38 | Inject VM via Hilt | Use hiltViewModel | @HiltViewModel | Manual VM | Clean DI | Coupling | High | https://developer.android.com/training/dependency-injection/hilt-jetpack |
| 39 | No DI in UI | Inject in VM | Constructor inject | Inject composable | Proper scope | Wrong scope | High |  |

## Accessibility

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 40 | Content description | Accessible UI | contentDescription | Ignore a11y | Inclusive | A11y fail | Medium | https://developer.android.com/jetpack/compose/accessibility |
| 41 | Semantics | Use semantics API | Modifier.semantics | None | Testable a11y | Invisible | Medium |  |

## Animation

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 42 | Compose animation APIs | Use animate*AsState | AnimatedVisibility | Manual anim | Smooth | Jank | Medium | https://developer.android.com/jetpack/compose/animation |
| 43 | Avoid animation logic in VM | Animation is UI concern | Animate in UI | Animate in VM | Correct layering | Mixed concern | Low |  |

## Modularization

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 44 | Feature-based UI modules | UI per feature | :feature:ui | God module | Scalable | Tight coupling | High | https://developer.android.com/topic/modularization |
| 45 | Public UI contracts | Expose minimal UI API | Interface/Route | Expose impl | Encapsulated | Leaky module | Medium |  |

## Interop

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 49 | Interop View carefully | Use AndroidView | Isolated usage | Mix everywhere | Safe interop | Messy UI | Low | https://developer.android.com/jetpack/compose/interop |
| 50 | Avoid legacy patterns | No LiveData in UI | StateFlow | LiveData | Modern stack | Legacy debt | Medium |  |

## Debug

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 51 | Use layout inspector | Inspect recomposition | Tools | Blind debug | Fast debug | Guessing | Low | https://developer.android.com/studio/debug/layout-inspector |
| 52 | Enable recomposition counts | Track recomposition | Debug flags | Ignore | Performance aware | Hidden jank | Low |  |

# SwiftUI Guidelines

> Auto-generated from `swiftui.csv`. Sections enable targeted reads.

## Views

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Use struct for views | SwiftUI views are value types | struct MyView: View | class MyView: View | struct ContentView: View { var body: some View } | class ContentView: View | High | https://developer.apple.com/documentation/swiftui/view |
| 2 | Keep views small and focused | Single responsibility for each view | Extract subviews for complex layouts | Large monolithic views | Extract HeaderView FooterView | 500+ line View struct | Medium |  |
| 3 | Use body computed property | body returns the view hierarchy | var body: some View { } | func body() -> some View | var body: some View { Text("Hello") } | func body() -> Text | High |  |
| 4 | Prefer composition over inheritance | Compose views using ViewBuilder | Combine smaller views | Inheritance hierarchies | VStack { Header() Content() } | class SpecialView extends BaseView | Medium |  |

## State

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 5 | Use @State for local state | Simple value types owned by view | @State for view-local primitives | @State for shared data | @State private var count = 0 | @State var sharedData: Model | High | https://developer.apple.com/documentation/swiftui/state |
| 6 | Use @Binding for two-way data | Pass mutable state to child views | @Binding for child input | @State in child for parent data | @Binding var isOn: Bool | $isOn to pass binding | Medium | https://developer.apple.com/documentation/swiftui/binding |
| 7 | Use @StateObject for reference types | ObservableObject owned by view | @StateObject for view-created objects | @ObservedObject for owned objects | @StateObject private var vm = ViewModel() | @ObservedObject var vm = ViewModel() | High | https://developer.apple.com/documentation/swiftui/stateobject |
| 8 | Use @ObservedObject for injected objects | Reference types passed from parent | @ObservedObject for injected dependencies | @StateObject for injected objects | @ObservedObject var vm: ViewModel | @StateObject var vm: ViewModel (injected) | High | https://developer.apple.com/documentation/swiftui/observedobject |
| 9 | Use @EnvironmentObject for shared state | App-wide state injection | @EnvironmentObject for global state | Prop drilling through views | @EnvironmentObject var settings: Settings | Pass settings through 5 views | Medium | https://developer.apple.com/documentation/swiftui/environmentobject |
| 10 | Use @Published in ObservableObject | Automatically publish property changes | @Published for observed properties | Manual objectWillChange calls | @Published var items: [Item] = [] | var items: [Item] { didSet { objectWillChange.send() } } | Medium |  |

## Observable

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 11 | Use @Observable macro (iOS 17+) | Modern observation without Combine | @Observable class for view models | ObservableObject for new projects | @Observable class ViewModel { } | class ViewModel: ObservableObject | Medium | https://developer.apple.com/documentation/observation |
| 12 | Use @Bindable for @Observable | Create bindings from @Observable | @Bindable var vm for bindings | @Binding with @Observable | @Bindable var viewModel | $viewModel.name with @Observable | Medium |  |

## Layout

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 13 | Use VStack HStack ZStack | Standard stack-based layouts | Stacks for linear arrangements | GeometryReader for simple layouts | VStack { Text() Image() } | GeometryReader for vertical list | Medium | https://developer.apple.com/documentation/swiftui/vstack |
| 14 | Use LazyVStack LazyHStack for lists | Lazy loading for performance | Lazy stacks for long lists | Regular stacks for 100+ items | LazyVStack { ForEach(items) } | VStack { ForEach(largeArray) } | High | https://developer.apple.com/documentation/swiftui/lazyvstack |
| 15 | Use GeometryReader sparingly | Only when needed for sizing | GeometryReader for responsive layouts | GeometryReader everywhere | GeometryReader for aspect ratio | GeometryReader wrapping everything | Medium |  |
| 16 | Use spacing and padding consistently | Consistent spacing throughout app | Design system spacing values | Magic numbers for spacing | .padding(16) or .padding() | .padding(13), .padding(17) | Low |  |
| 17 | Use frame modifiers correctly | Set explicit sizes when needed | .frame(maxWidth: .infinity) | Fixed sizes for responsive content | .frame(maxWidth: .infinity) | .frame(width: 375) | Medium |  |

## Modifiers

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 18 | Order modifiers correctly | Modifier order affects rendering | Background before padding for full coverage | Wrong modifier order | .padding().background(Color.red) | .background(Color.red).padding() | High |  |
| 19 | Create custom ViewModifiers | Reusable modifier combinations | ViewModifier for repeated styling | Duplicate modifier chains | struct CardStyle: ViewModifier | .shadow().cornerRadius() everywhere | Medium | https://developer.apple.com/documentation/swiftui/viewmodifier |
| 20 | Use conditional modifiers carefully | Avoid changing view identity | if-else with same view type | Conditional that changes view identity | Text(title).foregroundColor(isActive ? .blue : .gray) | if isActive { Text().bold() } else { Text() } | Medium |  |

## Navigation

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 21 | Use NavigationStack (iOS 16+) | Modern navigation with type-safe paths | NavigationStack with navigationDestination | NavigationView for new projects | NavigationStack { } | NavigationView { } (deprecated) | Medium | https://developer.apple.com/documentation/swiftui/navigationstack |
| 22 | Use navigationDestination | Type-safe navigation destinations | .navigationDestination(for:) | NavigationLink(destination:) | .navigationDestination(for: Item.self) | NavigationLink(destination: DetailView()) | Medium |  |
| 23 | Use @Environment for dismiss | Programmatic navigation dismissal | @Environment(\.dismiss) var dismiss | presentationMode (deprecated) | @Environment(\.dismiss) var dismiss | @Environment(\.presentationMode) | Low |  |

## Lists

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 24 | Use List for scrollable content | Built-in scrolling and styling | List for standard scrollable content | ScrollView + VStack for simple lists | List { ForEach(items) { } } | ScrollView { VStack { ForEach } } | Low | https://developer.apple.com/documentation/swiftui/list |
| 25 | Provide stable identifiers | Use Identifiable or explicit id | Identifiable protocol or id parameter | Index as identifier | ForEach(items) where Item: Identifiable | ForEach(items.indices, id: \.self) | High |  |
| 26 | Use onDelete and onMove | Standard list editing | onDelete for swipe to delete | Custom delete implementation | .onDelete(perform: delete) | .onTapGesture for delete | Low |  |

## Forms

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 27 | Use Form for settings | Grouped input controls | Form for settings screens | Manual grouping for forms | Form { Section { Toggle() } } | VStack { Toggle() } | Low | https://developer.apple.com/documentation/swiftui/form |
| 28 | Use @FocusState for keyboard | Manage keyboard focus | @FocusState for text field focus | Manual first responder handling | @FocusState private var isFocused: Bool | UIKit first responder | Medium | https://developer.apple.com/documentation/swiftui/focusstate |
| 29 | Validate input properly | Show validation feedback | Real-time validation feedback | Submit without validation | TextField with validation state | TextField without error handling | Medium |  |

## Async

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 30 | Use .task for async work | Automatic cancellation on view disappear | .task for view lifecycle async | onAppear with Task | .task { await loadData() } | onAppear { Task { await loadData() } } | Medium | https://developer.apple.com/documentation/swiftui/view/task(priority:_:) |
| 31 | Handle loading states | Show progress during async operations | ProgressView during loading | Empty view during load | if isLoading { ProgressView() } | No loading indicator | Medium |  |
| 32 | Use @MainActor for UI updates | Ensure UI updates on main thread | @MainActor on view models | Manual DispatchQueue.main | @MainActor class ViewModel | DispatchQueue.main.async | Medium |  |

## Animation

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 33 | Use withAnimation | Animate state changes | withAnimation for state transitions | No animation for state changes | withAnimation { isExpanded.toggle() } | isExpanded.toggle() | Low | https://developer.apple.com/documentation/swiftui/withanimation(_:_:) |
| 34 | Use .animation modifier | Apply animations to views | .animation(.spring()) on view | Manual animation timing | .animation(.easeInOut) | CABasicAnimation equivalent | Low |  |
| 35 | Respect reduced motion | Check accessibility settings | Check accessibilityReduceMotion | Ignore motion preferences | @Environment(\.accessibilityReduceMotion) | Always animate regardless | High |  |

## Preview

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 36 | Use #Preview macro (Xcode 15+) | Modern preview syntax | #Preview for view previews | PreviewProvider protocol | #Preview { ContentView() } | struct ContentView_Previews: PreviewProvider | Low |  |
| 37 | Create multiple previews | Test different states and devices | Multiple previews for states | Single preview only | #Preview("Light") { } #Preview("Dark") { } | Single preview configuration | Low |  |
| 38 | Use preview data | Dedicated preview mock data | Static preview data | Production data in previews | Item.preview for preview | Fetch real data in preview | Low |  |

## Performance

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 39 | Avoid expensive body computations | Body should be fast to compute | Precompute in view model | Heavy computation in body | vm.computedValue in body | Complex calculation in body | High |  |
| 40 | Use Equatable views | Skip unnecessary view updates | Equatable for complex views | Default equality for all views | struct MyView: View Equatable | No Equatable conformance | Medium |  |
| 41 | Profile with Instruments | Measure before optimizing | Use SwiftUI Instruments | Guess at performance issues | Profile with Instruments | Optimize without measuring | Medium |  |

## Accessibility

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 42 | Add accessibility labels | Describe UI elements | .accessibilityLabel for context | Missing labels | .accessibilityLabel("Close button") | Button without label | High | https://developer.apple.com/documentation/swiftui/view/accessibilitylabel(_:)-1d7jv |
| 43 | Support Dynamic Type | Respect text size preferences | Scalable fonts and layouts | Fixed font sizes | .font(.body) with Dynamic Type | .font(.system(size: 16)) | High |  |
| 44 | Use semantic views | Proper accessibility traits | Correct accessibilityTraits | Wrong semantic meaning | Button for actions Image for display | Image that acts like button | Medium |  |

## Testing

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 45 | Use ViewInspector for testing | Third-party view testing | ViewInspector for unit tests | UI tests only | ViewInspector assertions | Only XCUITest | Medium |  |
| 46 | Test view models | Unit test business logic | XCTest for view model | Skip view model testing | Test ViewModel methods | No unit tests | Medium |  |
| 47 | Use preview as visual test | Previews catch visual regressions | Multiple preview configurations | No visual verification | Preview different states | Single preview only | Low |  |

## Architecture

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 48 | Use MVVM pattern | Separate view and logic | ViewModel for business logic | Logic in View | ObservableObject ViewModel | @State for complex logic | Medium |  |
| 49 | Keep views dumb | Views display view model state | View reads from ViewModel | Business logic in View | view.items from vm.items | Complex filtering in View | Medium |  |
| 50 | Use dependency injection | Inject dependencies for testing | Initialize with dependencies | Hard-coded dependencies | init(service: ServiceProtocol) | let service = RealService() | Medium |  |

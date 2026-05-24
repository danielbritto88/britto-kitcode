# React Native Guidelines

> Auto-generated from `react-native.csv`. Sections enable targeted reads.

## Components

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Use functional components | Hooks-based components are standard | Functional components with hooks | Class components | const App = () => { } | class App extends Component | Medium | https://reactnative.dev/docs/intro-react |
| 2 | Keep components small | Single responsibility principle | Split into smaller components | Large monolithic components | <Header /><Content /><Footer /> | 500+ line component | Medium |  |
| 3 | Use TypeScript | Type safety for props and state | TypeScript for new projects | JavaScript without types | const Button: FC<Props> = () => { } | const Button = (props) => { } | Medium |  |
| 4 | Colocate component files | Keep related files together | Component folder with styles | Flat structure | components/Button/index.tsx styles.ts | components/Button.tsx styles/button.ts | Low |  |

## Styling

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 5 | Use StyleSheet.create | Optimized style objects | StyleSheet for all styles | Inline style objects | StyleSheet.create({ container: {} }) | style={{ margin: 10 }} | High | https://reactnative.dev/docs/stylesheet |
| 6 | Avoid inline styles | Prevent object recreation | Styles in StyleSheet | Inline style objects in render | style={styles.container} | style={{ margin: 10, padding: 5 }} | Medium |  |
| 7 | Use flexbox for layout | React Native uses flexbox | flexDirection alignItems justifyContent | Absolute positioning everywhere | flexDirection: 'row' | position: 'absolute' everywhere | Medium | https://reactnative.dev/docs/flexbox |
| 8 | Handle platform differences | Platform-specific styles | Platform.select or .ios/.android files | Same styles for both platforms | Platform.select({ ios: {}, android: {} }) | Hardcoded iOS values | Medium | https://reactnative.dev/docs/platform-specific-code |
| 9 | Use responsive dimensions | Scale for different screens | Dimensions or useWindowDimensions | Fixed pixel values | useWindowDimensions() | width: 375 | Medium |  |

## Navigation

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 10 | Use React Navigation | Standard navigation library | React Navigation for routing | Manual navigation management | createStackNavigator() | Custom navigation state | Medium | https://reactnavigation.org/ |
| 11 | Type navigation params | Type-safe navigation | Typed navigation props | Untyped navigation | navigation.navigate<RootStackParamList>('Home', { id }) | navigation.navigate('Home', { id }) | Medium |  |
| 12 | Use deep linking | Support URL-based navigation | Configure linking prop | No deep link support | linking: { prefixes: [] } | No linking configuration | Medium | https://reactnavigation.org/docs/deep-linking/ |
| 13 | Handle back button | Android back button handling | useFocusEffect with BackHandler | Ignore back button | BackHandler.addEventListener | No back handler | High |  |

## State

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 14 | Use useState for local state | Simple component state | useState for UI state | Class component state | const [count, setCount] = useState(0) | this.state = { count: 0 } | Medium |  |
| 15 | Use useReducer for complex state | Complex state logic | useReducer for related state | Multiple useState for related values | useReducer(reducer initialState) | 5+ useState calls | Medium |  |
| 16 | Use context sparingly | Context for global state | Context for theme auth locale | Context for frequently changing data | ThemeContext for app theme | Context for list item data | Medium |  |
| 17 | Consider Zustand or Redux | External state management | Zustand for simple Redux for complex | useState for global state | create((set) => ({ })) | Prop drilling global state | Medium |  |

## Lists

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 18 | Use FlatList for long lists | Virtualized list rendering | FlatList for 50+ items | ScrollView with map | <FlatList data={items} /> | <ScrollView>{items.map()}</ScrollView> | High | https://reactnative.dev/docs/flatlist |
| 19 | Provide keyExtractor | Unique keys for list items | keyExtractor with stable ID | Index as key | keyExtractor={(item) => item.id} | keyExtractor={(_, index) => index} | High |  |
| 20 | Optimize renderItem | Memoize list item components | React.memo for list items | Inline render function | renderItem={({ item }) => <MemoizedItem item={item} />} | renderItem={({ item }) => <View>...</View>} | High |  |
| 21 | Use getItemLayout for fixed height | Skip measurement for performance | getItemLayout when height known | Dynamic measurement for fixed items | getItemLayout={(_, index) => ({ length: 50, offset: 50 * index, index })} | No getItemLayout for fixed height | Medium |  |
| 22 | Implement windowSize | Control render window | Smaller windowSize for memory | Default windowSize for large lists | windowSize={5} | windowSize={21} for huge lists | Medium |  |

## Performance

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 23 | Use React.memo | Prevent unnecessary re-renders | memo for pure components | No memoization | export default memo(MyComponent) | export default MyComponent | Medium |  |
| 24 | Use useCallback for handlers | Stable function references | useCallback for props | New function on every render | useCallback(() => {}, [deps]) | () => handlePress() | Medium |  |
| 25 | Use useMemo for expensive ops | Cache expensive calculations | useMemo for heavy computations | Recalculate every render | useMemo(() => expensive(), [deps]) | const result = expensive() | Medium |  |
| 26 | Avoid anonymous functions in JSX | Prevent re-renders | Named handlers or useCallback | Inline arrow functions | onPress={handlePress} | onPress={() => doSomething()} | Medium |  |
| 27 | Use Hermes engine | Improved startup and memory | Enable Hermes in build | JavaScriptCore for new projects | hermes_enabled: true | hermes_enabled: false | Medium | https://reactnative.dev/docs/hermes |

## Images

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 28 | Use expo-image | Modern performant image component for React Native | Use expo-image for caching, blurring, and performance | Use default Image for heavy lists or unmaintained libraries | <Image source={url} cachePolicy='memory-disk' /> (expo-image) | <FastImage source={url} /> | Medium | https://docs.expo.dev/versions/latest/sdk/image/ |
| 29 | Specify image dimensions | Prevent layout shifts | width and height for remote images | No dimensions for network images | <Image style={{ width: 100 height: 100 }} /> | <Image source={{ uri }} /> no size | High |  |
| 30 | Use resizeMode | Control image scaling | resizeMode cover contain | Stretch images | resizeMode="cover" | No resizeMode | Low |  |

## Forms

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 31 | Use controlled inputs | State-controlled form fields | value + onChangeText | Uncontrolled inputs | <TextInput value={text} onChangeText={setText} /> | <TextInput defaultValue={text} /> | Medium |  |
| 32 | Handle keyboard | Manage keyboard visibility | KeyboardAvoidingView | Content hidden by keyboard | <KeyboardAvoidingView behavior="padding"> | No keyboard handling | High | https://reactnative.dev/docs/keyboardavoidingview |
| 33 | Use proper keyboard types | Appropriate keyboard for input | keyboardType for input type | Default keyboard for all | keyboardType="email-address" | keyboardType="default" for email | Low |  |

## Touch

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 34 | Use Pressable | Modern touch handling | Pressable for touch interactions | TouchableOpacity for new code | <Pressable onPress={} /> | <TouchableOpacity onPress={} /> | Low | https://reactnative.dev/docs/pressable |
| 35 | Provide touch feedback | Visual feedback on press | Ripple or opacity change | No feedback on press | android_ripple={{ color: 'gray' }} | No press feedback | Medium |  |
| 36 | Set hitSlop for small targets | Increase touch area | hitSlop for icons and small buttons | Tiny touch targets | hitSlop={{ top: 10 bottom: 10 }} | 44x44 with no hitSlop | Medium |  |

## Animation

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 37 | Use Reanimated | High-performance animations | react-native-reanimated | Animated API for complex | useSharedValue useAnimatedStyle | Animated.timing for gesture | Medium | https://docs.swmansion.com/react-native-reanimated/ |
| 38 | Run on UI thread | worklets for smooth animation | Run animations on UI thread | JS thread animations | runOnUI(() => {}) | Animated on JS thread | High |  |
| 39 | Use gesture handler | Native gesture recognition | react-native-gesture-handler | JS-based gesture handling | <GestureDetector> | <View onTouchMove={} /> | Medium | https://docs.swmansion.com/react-native-gesture-handler/ |

## Async

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 40 | Handle loading states | Show loading indicators | ActivityIndicator during load | Empty screen during load | {isLoading ? <ActivityIndicator /> : <Content />} | No loading state | Medium |  |
| 41 | Handle errors gracefully | Error boundaries and fallbacks | Error UI for failed requests | Crash on error | {error ? <ErrorView /> : <Content />} | No error handling | High |  |
| 42 | Cancel async operations | Cleanup on unmount | AbortController or cleanup | Memory leaks from async | useEffect cleanup | No cleanup for subscriptions | High |  |

## Accessibility

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 43 | Add accessibility labels | Describe UI elements | accessibilityLabel for all interactive | Missing labels | accessibilityLabel="Submit form" | <Pressable> without label | High | https://reactnative.dev/docs/accessibility |
| 44 | Use accessibility roles | Semantic meaning | accessibilityRole for elements | Wrong roles | accessibilityRole="button" | No role for button | Medium |  |
| 45 | Support screen readers | Test with TalkBack/VoiceOver | Test with screen readers | Skip accessibility testing | Regular TalkBack testing | No screen reader testing | High |  |

## Testing

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 46 | Use React Native Testing Library | Component testing | render and fireEvent | Enzyme or manual testing | render(<Component />) | shallow(<Component />) | Medium | https://callstack.github.io/react-native-testing-library/ |
| 47 | Test on real devices | Real device behavior | Test on iOS and Android devices | Simulator only | Device testing in CI | Simulator only testing | High |  |
| 48 | Use Detox for E2E | End-to-end testing | Detox for critical flows | Manual E2E testing | detox test | Manual testing only | Medium | https://wix.github.io/Detox/ |

## Native

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 49 | Use native modules carefully | Bridge has overhead | Batch native calls | Frequent bridge crossing | Batch updates | Call native on every keystroke | High |  |
| 50 | Use Expo when possible | Simplified development | Expo for standard features | Bare RN for simple apps | expo install package | react-native link package | Low | https://docs.expo.dev/ |
| 51 | Handle permissions | Request permissions properly | Check and request permissions | Assume permissions granted | PermissionsAndroid.request() | Access without permission check | High | https://reactnative.dev/docs/permissionsandroid |

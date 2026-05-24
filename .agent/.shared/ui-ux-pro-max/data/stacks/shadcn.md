# shadcn/ui Guidelines

> Auto-generated from `shadcn.csv`. Sections enable targeted reads.

## Setup

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Use CLI for installation | Install components via shadcn CLI for proper setup | npx shadcn@latest add component-name | Manual copy-paste from docs | npx shadcn@latest add button | Copy component code manually | High | https://ui.shadcn.com/docs/cli |
| 2 | Initialize project properly | Run init command to set up components.json and globals.css | npx shadcn@latest init before adding components | Skip init and add components directly | npx shadcn@latest init | npx shadcn@latest add button (without init) | High | https://ui.shadcn.com/docs/installation |
| 3 | Configure path aliases | Set up proper import aliases in tsconfig and components.json | Use @/components/ui path aliases | Relative imports like ../../components | import { Button } from "@/components/ui/button" | import { Button } from "../../components/ui/button" | Medium | https://ui.shadcn.com/docs/installation |

## Theming

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 4 | Use CSS variables for colors | Define colors as CSS variables in globals.css for theming | CSS variables in :root and .dark | Hardcoded color values in components | bg-primary text-primary-foreground | bg-blue-500 text-white | High | https://ui.shadcn.com/docs/theming |
| 5 | Follow naming convention | Use semantic color names with foreground pattern | primary/primary-foreground secondary/secondary-foreground | Generic color names | --primary --primary-foreground | --blue --light-blue | Medium | https://ui.shadcn.com/docs/theming |
| 6 | Support dark mode | Include .dark class styles for all custom CSS | Define both :root and .dark color schemes | Only light mode colors | .dark { --background: 240 10% 3.9%; } | No .dark class styles | High | https://ui.shadcn.com/docs/dark-mode |

## Components

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 7 | Use component variants | Leverage cva variants for consistent styling | Use variant prop for different styles | Inline conditional classes | <Button variant="destructive"> | <Button className={isError ? "bg-red-500" : "bg-blue-500"}> | Medium | https://ui.shadcn.com/docs/components/button |
| 8 | Compose with className | Add custom classes via className prop for overrides | Extend with className for one-off customizations | Modify component source directly | <Button className="w-full"> | Edit button.tsx to add w-full | Medium | https://ui.shadcn.com/docs/components/button |
| 9 | Use size variants consistently | Apply size prop for consistent sizing across components | size="sm" size="lg" for sizing | Mix size classes inconsistently | <Button size="lg"> | <Button className="text-lg px-8 py-4"> | Medium | https://ui.shadcn.com/docs/components/button |
| 10 | Prefer compound components | Use provided sub-components for complex UI | Card + CardHeader + CardContent pattern | Single component with many props | <Card><CardHeader><CardTitle> | <Card title="x" content="y" footer="z"> | Medium | https://ui.shadcn.com/docs/components/card |

## Dialog

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 11 | Use Dialog for modal content | Dialog component for overlay modal windows | Dialog for confirmations forms details | Alert for modal content | <Dialog><DialogContent> | <Alert> styled as modal | High | https://ui.shadcn.com/docs/components/dialog |
| 12 | Handle dialog state properly | Use open and onOpenChange for controlled dialogs | Controlled state with useState | Uncontrolled with default open only | <Dialog open={open} onOpenChange={setOpen}> | <Dialog defaultOpen={true}> | Medium | https://ui.shadcn.com/docs/components/dialog |
| 13 | Include proper dialog structure | Use DialogHeader DialogTitle DialogDescription | Complete semantic structure | Missing title or description | <DialogHeader><DialogTitle><DialogDescription> | <DialogContent><p>Content</p></DialogContent> | High | https://ui.shadcn.com/docs/components/dialog |

## Sheet

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 14 | Use Sheet for side panels | Sheet component for slide-out panels and drawers | Sheet for navigation filters settings | Dialog for side content | <Sheet side="right"> | <Dialog> with slide animation | Medium | https://ui.shadcn.com/docs/components/sheet |
| 15 | Specify sheet side | Set side prop for sheet slide direction | Explicit side="left" or side="right" | Default side without consideration | <Sheet><SheetContent side="left"> | <Sheet><SheetContent> | Low | https://ui.shadcn.com/docs/components/sheet |

## Form

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 16 | Use Form with react-hook-form | Integrate Form component with react-hook-form for validation | useForm + Form + FormField pattern | Custom form handling without Form | <Form {...form}><FormField control={form.control}> | <form onSubmit={handleSubmit}> | High | https://ui.shadcn.com/docs/components/form |
| 17 | Use FormField for inputs | Wrap inputs in FormField for proper labeling and errors | FormField + FormItem + FormLabel + FormControl | Input without FormField wrapper | <FormField><FormItem><FormLabel><FormControl><Input> | <Input onChange={...}> | High | https://ui.shadcn.com/docs/components/form |
| 18 | Display form messages | Use FormMessage for validation error display | FormMessage after FormControl | Custom error text without FormMessage | <FormControl><Input/></FormControl><FormMessage/> | <Input/>{error && <span>{error}</span>} | Medium | https://ui.shadcn.com/docs/components/form |
| 19 | Use Zod for validation | Define form schema with Zod for type-safe validation | zodResolver with form schema | Manual validation logic | zodResolver(formSchema) | validate: (values) => { if (!values.email) } | Medium | https://ui.shadcn.com/docs/components/form |

## Select

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 20 | Use Select for dropdowns | Select component for option selection | Select for choosing from list | Native select element | <Select><SelectTrigger><SelectContent> | <select><option> | Medium | https://ui.shadcn.com/docs/components/select |
| 21 | Structure Select properly | Include Trigger Value Content and Items | Complete Select structure | Missing SelectValue or SelectContent | <SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem> | <Select><option> | High | https://ui.shadcn.com/docs/components/select |

## Command

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 22 | Use Command for search | Command component for searchable lists and palettes | Command for command palette search | Input with custom dropdown | <Command><CommandInput><CommandList> | <Input><div className="dropdown"> | Medium | https://ui.shadcn.com/docs/components/command |
| 23 | Group command items | Use CommandGroup for categorized items | CommandGroup with heading for sections | Flat list without grouping | <CommandGroup heading="Suggestions"><CommandItem> | <CommandItem> without groups | Low | https://ui.shadcn.com/docs/components/command |

## Table

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 24 | Use Table for data display | Table component for structured data | Table for tabular data display | Div grid for table-like layouts | <Table><TableHeader><TableBody><TableRow> | <div className="grid"> | Medium | https://ui.shadcn.com/docs/components/table |
| 25 | Include proper table structure | Use TableHeader TableBody TableRow TableCell | Semantic table structure | Missing thead or tbody | <TableHeader><TableRow><TableHead> | <Table><TableRow> without header | High | https://ui.shadcn.com/docs/components/table |

## DataTable

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 26 | Use DataTable for complex tables | Combine Table with TanStack Table for features | DataTable pattern for sorting filtering pagination | Custom table implementation | useReactTable + Table components | Custom sort filter pagination logic | Medium | https://ui.shadcn.com/docs/components/data-table |

## Tabs

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 27 | Use Tabs for content switching | Tabs component for tabbed interfaces | Tabs for related content sections | Custom tab implementation | <Tabs><TabsList><TabsTrigger><TabsContent> | <div onClick={() => setTab(...)} | Medium | https://ui.shadcn.com/docs/components/tabs |
| 28 | Set default tab value | Specify defaultValue for initial tab | defaultValue on Tabs component | No default leaving first tab | <Tabs defaultValue="account"> | <Tabs> without defaultValue | Low | https://ui.shadcn.com/docs/components/tabs |

## Accordion

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 29 | Use Accordion for collapsible | Accordion for expandable content sections | Accordion for FAQ settings panels | Custom collapse implementation | <Accordion><AccordionItem><AccordionTrigger> | <div onClick={() => setOpen(!open)}> | Medium | https://ui.shadcn.com/docs/components/accordion |
| 30 | Choose accordion type | Use type="single" or type="multiple" appropriately | type="single" for one open type="multiple" for many | Default type without consideration | <Accordion type="single" collapsible> | <Accordion> without type | Low | https://ui.shadcn.com/docs/components/accordion |

## Toast

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 31 | Use Sonner for toasts | Sonner integration for toast notifications | toast() from sonner for notifications | Custom toast implementation | toast("Event created") | setShowToast(true) | Medium | https://ui.shadcn.com/docs/components/sonner |
| 32 | Add Toaster to layout | Include Toaster component in root layout | <Toaster /> in app layout | Toaster in individual pages | app/layout.tsx: <Toaster /> | page.tsx: <Toaster /> | High | https://ui.shadcn.com/docs/components/sonner |
| 33 | Use toast variants | Apply toast.success toast.error for context | Semantic toast methods | Generic toast for all messages | toast.success("Saved!") toast.error("Failed") | toast("Saved!") toast("Failed") | Medium | https://ui.shadcn.com/docs/components/sonner |

## Popover

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 34 | Use Popover for floating content | Popover for dropdown menus and floating panels | Popover for contextual actions | Absolute positioned divs | <Popover><PopoverTrigger><PopoverContent> | <div className="relative"><div className="absolute"> | Medium | https://ui.shadcn.com/docs/components/popover |
| 35 | Handle popover alignment | Use align and side props for positioning | Explicit alignment configuration | Default alignment for all | <PopoverContent align="start" side="bottom"> | <PopoverContent> | Low | https://ui.shadcn.com/docs/components/popover |

## DropdownMenu

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 36 | Use DropdownMenu for actions | DropdownMenu for action lists and context menus | DropdownMenu for user menu actions | Popover for action lists | <DropdownMenu><DropdownMenuTrigger><DropdownMenuContent> | <Popover> for menu actions | Medium | https://ui.shadcn.com/docs/components/dropdown-menu |
| 37 | Group menu items | Use DropdownMenuGroup and DropdownMenuSeparator | Organized menu with separators | Flat list of items | <DropdownMenuGroup><DropdownMenuItem><DropdownMenuSeparator> | <DropdownMenuItem> without organization | Low | https://ui.shadcn.com/docs/components/dropdown-menu |

## Tooltip

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 38 | Use Tooltip for hints | Tooltip for icon buttons and truncated text | Tooltip for additional context | Title attribute for tooltips | <Tooltip><TooltipTrigger><TooltipContent> | <button title="Delete"> | Medium | https://ui.shadcn.com/docs/components/tooltip |
| 39 | Add TooltipProvider | Wrap app or section in TooltipProvider | TooltipProvider at app level | TooltipProvider per tooltip | <TooltipProvider><App/></TooltipProvider> | <Tooltip><TooltipProvider> | High | https://ui.shadcn.com/docs/components/tooltip |

## Skeleton

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 40 | Use Skeleton for loading | Skeleton component for loading placeholders | Skeleton matching content layout | Spinner for content loading | <Skeleton className="h-4 w-[200px]"/> | <Spinner/> for card loading | Medium | https://ui.shadcn.com/docs/components/skeleton |
| 41 | Match skeleton dimensions | Size skeleton to match loaded content | Skeleton same size as expected content | Generic skeleton size | <Skeleton className="h-12 w-12 rounded-full"/> | <Skeleton/> without sizing | Medium | https://ui.shadcn.com/docs/components/skeleton |

## AlertDialog

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 42 | Use AlertDialog for confirms | AlertDialog for destructive action confirmation | AlertDialog for delete confirmations | Dialog for confirmations | <AlertDialog><AlertDialogTrigger><AlertDialogContent> | <Dialog> for delete confirmation | High | https://ui.shadcn.com/docs/components/alert-dialog |
| 43 | Include action buttons | Use AlertDialogAction and AlertDialogCancel | Standard confirm/cancel pattern | Custom buttons in AlertDialog | <AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction> | <Button>Cancel</Button><Button>Confirm</Button> | Medium | https://ui.shadcn.com/docs/components/alert-dialog |

## Sidebar

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 44 | Use Sidebar for navigation | Sidebar component for app navigation | Sidebar for main app navigation | Custom sidebar implementation | <SidebarProvider><Sidebar><SidebarContent> | <div className="w-64 fixed"> | Medium | https://ui.shadcn.com/docs/components/sidebar |
| 45 | Wrap in SidebarProvider | Use SidebarProvider for sidebar state management | SidebarProvider at layout level | Sidebar without provider | <SidebarProvider><Sidebar></SidebarProvider> | <Sidebar> without provider | High | https://ui.shadcn.com/docs/components/sidebar |
| 46 | Use SidebarTrigger | Include SidebarTrigger for mobile toggle | SidebarTrigger for responsive toggle | Custom toggle button | <SidebarTrigger/> | <Button onClick={() => toggleSidebar()}> | Medium | https://ui.shadcn.com/docs/components/sidebar |

## Chart

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 47 | Use Chart for data viz | Chart component with Recharts integration | Chart component for dashboards | Direct Recharts without wrapper | <ChartContainer config={chartConfig}> | <ResponsiveContainer><BarChart> | Medium | https://ui.shadcn.com/docs/components/chart |
| 48 | Define chart config | Create chartConfig for consistent theming | chartConfig with color definitions | Inline colors in charts | { desktop: { label: "Desktop", color: "#2563eb" } } | <Bar fill="#2563eb"/> | Medium | https://ui.shadcn.com/docs/components/chart |
| 49 | Use ChartTooltip | Apply ChartTooltip for interactive charts | ChartTooltip with ChartTooltipContent | Recharts Tooltip directly | <ChartTooltip content={<ChartTooltipContent/>}/> | <Tooltip/> from recharts | Low | https://ui.shadcn.com/docs/components/chart |

## Blocks

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 50 | Use blocks for scaffolding | Start from shadcn blocks for common layouts | npx shadcn@latest add dashboard-01 | Build dashboard from scratch | npx shadcn@latest add login-01 | Custom login page from scratch | Medium | https://ui.shadcn.com/blocks |
| 51 | Customize block components | Modify copied block code to fit needs | Edit block files after installation | Use blocks without modification | Customize dashboard-01 layout | Use dashboard-01 as-is | Low | https://ui.shadcn.com/blocks |

## A11y

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 52 | Use semantic components | Shadcn components have built-in ARIA | Rely on component accessibility | Override ARIA attributes | <Button> has button role | <div role="button"> | High | https://ui.shadcn.com/docs/components/button |
| 53 | Maintain focus management | Dialog Sheet handle focus automatically | Let components manage focus | Custom focus handling | <Dialog> traps focus | document.querySelector().focus() | High | https://ui.shadcn.com/docs/components/dialog |
| 54 | Provide labels | Use FormLabel and aria-label appropriately | FormLabel for form inputs | Placeholder as only label | <FormLabel>Email</FormLabel><Input/> | <Input placeholder="Email"/> | High | https://ui.shadcn.com/docs/components/form |

## Performance

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 55 | Import components individually | Import only needed components | Named imports from component files | Import all from index | import { Button } from "@/components/ui/button" | import { Button Card Dialog } from "@/components/ui" | Medium |  |
| 56 | Lazy load dialogs | Dynamic import for heavy dialog content | React.lazy for dialog content | Import all dialogs upfront | const HeavyContent = lazy(() => import('./Heavy')) | import HeavyContent from './Heavy' | Medium |  |

## Customization

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 57 | Extend variants with cva | Add new variants using class-variance-authority | Extend buttonVariants for new styles | Inline classes for variants | variants: { size: { xl: "h-14 px-8" } } | className="h-14 px-8" | Medium | https://ui.shadcn.com/docs/components/button |
| 58 | Create custom components | Build new components following shadcn patterns | Use cn() and cva for custom components | Different patterns for custom | const Custom = ({ className }) => <div className={cn("base" className)}> | const Custom = ({ style }) => <div style={style}> | Medium |  |

## Patterns

| No | Guideline | Description | Do | Don't | Code Good | Code Bad | Severity | Docs URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 59 | Use asChild for composition | asChild prop for component composition | Slot pattern with asChild | Wrapper divs for composition | <Button asChild><Link href="/"> | <Button><Link href="/"></Link></Button> | Medium | https://ui.shadcn.com/docs/components/button |
| 60 | Combine with React Hook Form | Form + useForm for complete forms | RHF Controller with shadcn inputs | Custom form state management | <FormField control={form.control} name="email"> | <Input value={email} onChange={(e) => setEmail(e.target.value)} | High | https://ui.shadcn.com/docs/components/form |

# Phase 5: Manual Search Bar Implementation

**Date**: 2025-11-13
**Goal**: Make the search bar in the side panel functional so users can search their Logseq graph directly
**Current Version**: 0.0.40
**Target Version**: 0.0.41

---

## Problem Statement

The side panel currently displays a "Search in Logseq..." search bar that is non-functional. Users can only search by:
1. Performing web searches on Google/Bing/etc (automatic)
2. Clicking the floating button to see those results

**User Need**: Ability to manually enter search queries directly in the side panel, independent of web search terms.

---

## Current Architecture

### How Search Works Now

**Data Flow:**
1. User searches on Google → `searchingEngines.ts` extracts query
2. `content/index.tsx` calls `mount()` with query
3. Content script sends message via port: `connect.postMessage({ type: 'query', query: 'taiwan' })`
4. Background script (`background/index.ts`) receives message (line 32)
5. Background calls `logseqService.search(msg.query)` (line 39)
6. Results returned via `port.postMessage(searchRes)` (line 41)
7. `LogseqSidekickComponent` receives results via `connect.onMessage` (line 97)
8. Results passed to `SidePanel` component as props

### Components Involved

**SidePanel.tsx** (lines 28-32):
```typescript
const handleSearchSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  // TODO: Implement search functionality
  console.log('Search query:', searchQuery);
};
```
- Has search input and form
- Has TODO for implementation
- Currently just logs to console

**LogseqSidekickComponent** (lines 10-168):
- Has `connect` port object (line 11)
- Listens for messages from background (line 96-111)
- Passes results to `SidePanel` as props (line 157-164)
- **Does NOT currently pass `connect` to SidePanel**

**background/index.ts** (lines 29-77):
- Listens for `{ type: 'query' }` messages
- Performs search via `logseqService.search()`
- Returns results via port

---

## Solution Design

### Approach: Reuse Existing Infrastructure

**Key Insight**: The manual search should use the exact same message-passing mechanism as automatic search. This requires minimal code changes.

### Required Changes

#### 1. Pass `connect` Port to SidePanel

**File**: `src/pages/content/LogseqSidekick.tsx`
**Location**: Line 157-164 (SidePanel component instantiation)

**Change**:
```typescript
// BEFORE
<SidePanel
  isOpen={isPanelOpen}
  onClose={() => setIsPanelOpen(false)}
  graph={graph}
  pages={pages}
  blocks={blocks}
/>

// AFTER
<SidePanel
  isOpen={isPanelOpen}
  onClose={() => setIsPanelOpen(false)}
  graph={graph}
  pages={pages}
  blocks={blocks}
  connect={connect}  // NEW: Pass port for manual search
/>
```

#### 2. Update SidePanel Props Type

**File**: `src/components/SidePanel.tsx`
**Location**: Line 7-13 (type definition)

**Change**:
```typescript
// BEFORE
type SidePanelProps = {
  isOpen: boolean;
  onClose: () => void;
  graph: string;
  pages: any[];
  blocks: any[];
};

// AFTER
type SidePanelProps = {
  isOpen: boolean;
  onClose: () => void;
  graph: string;
  pages: any[];
  blocks: any[];
  connect: Browser.Runtime.Port;  // NEW: Port for sending search messages
};
```

#### 3. Implement Search Submission

**File**: `src/components/SidePanel.tsx`
**Location**: Line 15-32 (component function and handleSearchSubmit)

**Change**:
```typescript
// BEFORE
const SidePanel = ({
  isOpen,
  onClose,
  graph,
  pages,
  blocks,
}: SidePanelProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const goOptionPage = () => {
    Browser.runtime.sendMessage({ type: 'open-options' });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Search query:', searchQuery);
  };

// AFTER
const SidePanel = ({
  isOpen,
  onClose,
  graph,
  pages,
  blocks,
  connect,  // NEW: Destructure connect from props
}: SidePanelProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const goOptionPage = () => {
    Browser.runtime.sendMessage({ type: 'open-options' });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // NEW: Send search query to background
    if (searchQuery.trim()) {
      console.log('[Logseq DB Sidekick] Manual search query:', searchQuery);
      connect.postMessage({ type: 'query', query: searchQuery.trim() });
    }
  };
```

---

## Expected Behavior After Implementation

1. **User opens side panel** (clicks floating button)
2. **User types query** in "Search in Logseq..." field (e.g., "taiwan business")
3. **User presses Enter** (or clicks search icon if we add it)
4. **Search executes** via existing background script
5. **Results update** in the panel automatically (same React state mechanism)
6. **Panel shows new results** without closing

### Edge Cases Handled

- **Empty search**: `trim()` prevents empty searches
- **Whitespace-only**: `trim()` handles this
- **Special characters**: Passed through as-is (background/datalog handles)
- **Case sensitivity**: Same behavior as web search (case-insensitive)

---

## Testing Plan

### Manual Testing Steps

1. **Build extension**: `VERSION=0.0.41 pnpm run build`
2. **Reload extension** in Chrome
3. **Navigate to Google** and search for "taiwan"
4. **Click floating button** → Should see 22 results
5. **Type "bank"** in search bar
6. **Press Enter**
7. **Verify**: Results update to show only bank-related pages

### Test Cases

| Test | Expected Result |
|------|----------------|
| Search "taiwan" | Shows 22 pages |
| Search "bank" | Shows bank-related pages |
| Search "nonexistent123xyz" | Shows 0 results (empty state) |
| Search with spaces " test " | Trims and searches "test" |
| Search empty string | Does nothing (no search triggered) |
| Press Enter multiple times | Searches each time, results update |

---

## Files Modified Summary

1. **src/pages/content/LogseqSidekick.tsx**
   - Add `connect={connect}` prop to SidePanel (1 line change)

2. **src/components/SidePanel.tsx**
   - Add `connect: Browser.Runtime.Port` to type definition (1 line)
   - Add `connect` to destructured props (1 line)
   - Implement `handleSearchSubmit` with `connect.postMessage()` (5 lines)

**Total**: 3 files, ~8 lines of code

---

## Future Enhancements (Not in This Phase)

- **Search history**: Store recent searches
- **Search suggestions**: Autocomplete from page names
- **Clear button**: X icon to clear search field
- **Loading indicator**: Show spinner while searching
- **Search icon button**: Clickable icon alternative to Enter key

---

## Version Update

- **Current**: 0.0.40
- **Next**: 0.0.41
- **Changelog**: "feat: Add manual search functionality to side panel search bar"

---

## Documentation Updates After Implementation

After successful testing, update:
1. `docs/TODO.md` - Add Phase 5 completion notes
2. `README.md` - Mention manual search feature
3. Create `docs/CHANGELOG_v0.0.41.md` - Document changes

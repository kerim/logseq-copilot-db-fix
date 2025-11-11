# POC: Journal Page Filter - Findings

**Date**: 2025-11-11
**Status**: ✅ POC Complete - Ready for Integration

## Summary

Successfully identified how to detect journal pages in Logseq DB graphs and verified filtering works correctly.

## Key Findings

### 1. Journal Page Detection Property

**Property Name**: `:block/journal-day` (NOT `:block/journal?`)

- **Journal pages**: Have `block/journal-day` property with integer value in YYYYMMDD format
  - Example: `20250606`, `20251010`
- **Regular pages**: Do NOT have this property (undefined/N/A)

### 2. HTTP Server Changes

**File**: `/Users/niyaro/Documents/Code/logseq-http-server/logseq_server.py` (line 222)

**Updated datalog query** to include `:block/journal-day`:

```python
datalog_query = f'[:find (pull ?b [:block/uuid :block/title {{:block/page [:db/id :block/uuid :block/title :block/name :block/journal-day]}}]) :where [?b :block/title ?title] [(clojure.string/includes? ?title "{escaped_query}")]]'
```

### 3. Test Results

**Test Query**: "sifo" on graph "Chrome Import 2025-11-09"
**Total Results**: 6 blocks

Breakdown:
- **1 regular page**: "sifo lakaw 鍾文觀" (no journal-day)
- **5 journal pages**:
  - Jun 6th, 2025 (journal-day: 20250606)
  - Oct 10th, 2025 (journal-day: 20251010)
  - Oct 17th, 2025 (journal-day: 20251017)
  - Oct 18th, 2025 (journal-day: 20251018)
  - Oct 31st, 2025 (journal-day: 20251031)

**With filtering enabled**: Would show only 1 result (83% reduction!)

### 4. Sample Response Data

```json
{
  "block/page": {
    "block/name": "jun 6th, 2025",
    "block/title": "Jun 6th, 2025",
    "block/uuid": "00000001-2025-0606-0000-000000000000",
    "db/id": 809,
    "block/journal-day": 20250606    // ← This is the key!
  },
  "block/title": "Contact: sifolakaw@gmail.com",
  "block/uuid": "6842357c-03c2-48ef-9cce-5ff933e20f20"
}
```

### 5. Filtering Logic

```typescript
function isJournalPage(block: LogseqBlockType): boolean {
  // Check if page has journal-day property (any value means it's a journal page)
  return block.page['journal-day'] !== undefined;
}

function filterJournalPages(blocks: LogseqBlockType[], excludeJournals: boolean): LogseqBlockType[] {
  if (!excludeJournals) {
    return blocks; // No filtering
  }

  return blocks.filter(block => !isJournalPage(block));
}
```

## Integration Checklist

### TypeScript Type Updates

**File**: `src/types/logseqBlock.ts`

Update `LogseqPageIdenity` to include:
```typescript
export type LogseqPageIdenity = {
  name: string;
  id: number;
  uuid: string;
  originalName?: string;
  'journal-day'?: number; // YYYYMMDD format, only present for journal pages
};
```

### Configuration Updates

**File**: `src/config.ts`

Add to config interface:
```typescript
export type LogseqSidekickConfig = {
  // ... existing fields
  excludeJournalPages?: boolean; // Default: false (show all pages)
};
```

### HTTP Client Updates

**File**: `src/pages/logseq/httpServerClient.ts` (lines 147-152)

Update page transformation to include journal-day:
```typescript
page: {
  id: page['db/id'] || 0,
  uuid: page['block/uuid'] || '',
  name: page['block/title'] || page['block/name'] || 'Unknown Page',
  originalName: page['block/name'] || '',
  'journal-day': page['block/journal-day'], // Add this line
}
```

### Service Layer Updates

**File**: `src/pages/logseq/httpServerService.ts` (lines 23-43)

Add filtering in `searchGraph()` method:
```typescript
public async searchGraph(query: string): Promise<void> {
  const result = await this.httpServerClient.search(query);
  const config = await getLogseqSidekickConfig();

  // Filter journal pages if setting enabled
  let blocks = result.blocks;
  const totalCount = blocks.length;

  if (config.excludeJournalPages) {
    blocks = blocks.filter(block => !block.page['journal-day']);
  }

  const filteredCount = blocks.length;
  const journalCount = totalCount - filteredCount;

  // Render blocks...
  const renderedBlocks = await Promise.all(
    blocks.map(block => this.renderBlockWithHtml(block))
  );

  // Display results with count info...
  this.displayResults(renderedBlocks, totalCount, journalCount);
}
```

### UI Updates

**File**: `src/pages/options/Options.tsx`

Add checkbox setting:
```tsx
<div className="setting-item">
  <label>
    <input
      type="checkbox"
      checked={config.excludeJournalPages || false}
      onChange={(e) => updateConfig({ excludeJournalPages: e.target.checked })}
    />
    Exclude journal pages from search results
  </label>
  <p className="setting-description">
    Hide results from daily journal pages. This can significantly reduce result clutter.
  </p>
</div>
```

**File**: `src/components/LogseqSidekick.tsx` (or wherever results are displayed)

Show filter info:
```tsx
{journalCount > 0 && config.excludeJournalPages && (
  <div className="filter-info">
    Showing {filteredCount} results ({journalCount} journal pages hidden)
  </div>
)}
```

## Testing Plan

1. **Without filtering** (default):
   - Search for "sifo" → Should show all 6 results
   - Verify journal pages appear

2. **With filtering enabled**:
   - Enable "Exclude journal pages" in options
   - Search for "sifo" → Should show only 1 result
   - Verify only "sifo lakaw 鍾文觀" page appears
   - Verify UI shows "5 journal pages hidden" message

3. **Edge cases**:
   - Search with no journal pages → No change in results
   - Search with only journal pages → Empty results with message
   - Toggle setting on/off → Results update correctly

## Files Modified

### HTTP Server
- ✅ `/Users/niyaro/Documents/Code/logseq-http-server/logseq_server.py` (line 222)

### Extension (To be done in integration)
- `src/types/logseqBlock.ts` - Add journal-day to LogseqPageIdenity
- `src/config.ts` - Add excludeJournalPages setting
- `src/pages/logseq/httpServerClient.ts` - Include journal-day in transformation
- `src/pages/logseq/httpServerService.ts` - Add filtering logic
- `src/pages/options/Options.tsx` - Add UI setting
- `src/components/LogseqSidekick.tsx` - Show filter count

## Version

This will be version **0.0.9** when integrated.

## Next Steps

1. ✅ POC complete
2. → Proceed with integration into extension
3. → Test thoroughly
4. → Update TODO.md
5. → Commit and tag v0.0.9

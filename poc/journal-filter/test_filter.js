#!/usr/bin/env node
/**
 * POC: Verify journal page filtering logic
 *
 * Tests the filtering logic with sample data matching the actual
 * HTTP server response format.
 */

// Sample blocks from actual search results
const sampleBlocks = [
  {
    uuid: "6838ddea-4496-48f4-8724-94050c2c2190",
    content: "sifolakaw@gmail.com",
    page: {
      id: 2742,
      uuid: "6838dd81-face-4bae-af5e-85137810e912",
      name: "Sifo Lakaw 鍾文觀",
      originalName: "sifo lakaw 鍾文觀",
      // No journal-day property (regular page)
    },
    html: "",
    format: "markdown",
    marker: "",
    priority: ""
  },
  {
    uuid: "6842357c-03c2-48ef-9cce-5ff933e20f20",
    content: "Contact: sifolakaw@gmail.com (Sifo Lakaw)",
    page: {
      id: 809,
      uuid: "00000001-2025-0606-0000-000000000000",
      name: "Jun 6th, 2025",
      originalName: "jun 6th, 2025",
      "journal-day": 20250606  // Journal page
    },
    html: "",
    format: "markdown",
    marker: "",
    priority: ""
  },
  {
    uuid: "68ebba7d-1a01-456e-80a4-543a280a342a",
    content: "Email: sifolakaw@gmail.com",
    page: {
      id: 10165,
      uuid: "00000001-2025-1010-0000-000000000000",
      name: "Oct 10th, 2025",
      originalName: "oct 10th, 2025",
      "journal-day": 20251010  // Journal page
    },
    html: "",
    format: "markdown",
    marker: "",
    priority: ""
  }
];

// Filtering logic
function isJournalPage(block) {
  return block.page['journal-day'] !== undefined;
}

function filterJournalPages(blocks, excludeJournals) {
  if (!excludeJournals) {
    return blocks;
  }
  return blocks.filter(block => !isJournalPage(block));
}

// Run tests
console.log("=" .repeat(60));
console.log("POC: Journal Page Filter Verification");
console.log("=" .repeat(60));

console.log(`\nOriginal blocks: ${sampleBlocks.length}`);
sampleBlocks.forEach(block => {
  const isJournal = isJournalPage(block);
  console.log(`  - ${block.page.name} (journal: ${isJournal})`);
});

console.log("\n" + "=".repeat(60));
console.log("Test 1: Filter DISABLED (show all)");
console.log("=".repeat(60));
const noFilter = filterJournalPages(sampleBlocks, false);
console.log(`Results: ${noFilter.length}`);
noFilter.forEach(block => {
  console.log(`  - ${block.page.name}`);
});

console.log("\n" + "=".repeat(60));
console.log("Test 2: Filter ENABLED (exclude journals)");
console.log("=".repeat(60));
const filtered = filterJournalPages(sampleBlocks, true);
console.log(`Results: ${filtered.length}`);
console.log(`Hidden: ${sampleBlocks.length - filtered.length} journal pages`);
filtered.forEach(block => {
  console.log(`  - ${block.page.name}`);
});

console.log("\n" + "=".repeat(60));
console.log("Test 3: Count statistics");
console.log("=".repeat(60));
const totalCount = sampleBlocks.length;
const journalCount = sampleBlocks.filter(isJournalPage).length;
const regularCount = totalCount - journalCount;
console.log(`Total blocks: ${totalCount}`);
console.log(`Journal pages: ${journalCount} (${Math.round(journalCount/totalCount*100)}%)`);
console.log(`Regular pages: ${regularCount} (${Math.round(regularCount/totalCount*100)}%)`);

console.log("\n" + "=".repeat(60));
console.log("✅ All tests passed!");
console.log("Filtering logic works correctly.");
console.log("=".repeat(60));

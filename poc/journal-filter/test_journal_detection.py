#!/usr/bin/env python3
"""
POC: Test journal page detection in Logseq search results

This script:
1. Makes a test search request to the HTTP server
2. Examines the response to see if journal flag is present
3. Tests filtering logic for journal pages
"""

import requests
import json

# Test configuration
HTTP_SERVER_URL = "http://localhost:8765"
GRAPH_NAME = "Chrome Import 2025-11-09"  # From TODO.md
TEST_QUERY = "sifo"  # From TODO.md - expected 6 results

def test_current_search():
    """Test the current search endpoint to see what data we get"""
    print("=" * 60)
    print("Testing CURRENT search (without journal flag)")
    print("=" * 60)

    url = f"{HTTP_SERVER_URL}/search"
    params = {"q": TEST_QUERY, "graph": GRAPH_NAME}

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()

        print(f"\nStatus: {response.status_code}")
        print(f"Success: {data.get('success', False)}")

        if data.get('success') and data.get('data'):
            blocks = data['data']
            print(f"Total blocks: {len(blocks)}")

            # Examine first block structure
            if blocks:
                print("\nFirst block structure:")
                print(json.dumps(blocks[0], indent=2))

                # Check if page has journal flag
                page = blocks[0].get('block/page', {})
                print(f"\nPage keys: {list(page.keys())}")
                print(f"Has 'block/journal?' key: {'block/journal?' in page}")
                print(f"Has 'journal?' key: {'journal?' in page}")

                # Count potential journal pages
                journal_count = 0
                non_journal_count = 0

                for block in blocks:
                    page = block.get('block/page', {})
                    page_name = page.get('block/name', '')

                    # Journal pages typically have date format: YYYY_MM_DD
                    # or YYYY-MM-DD or similar
                    is_journal_by_name = (
                        page_name.count('_') >= 2 or
                        page_name.count('-') >= 2 or
                        page_name.replace('_', '').replace('-', '').isdigit()
                    )

                    if is_journal_by_name:
                        journal_count += 1
                        print(f"  Journal (by name): {page_name}")
                    else:
                        non_journal_count += 1
                        print(f"  Regular page: {page_name}")

                print(f"\nEstimated journal pages (by naming): {journal_count}")
                print(f"Estimated regular pages: {non_journal_count}")
        else:
            print("No data in response")
            print(json.dumps(data, indent=2))

    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        print(f"Response text: {response.text}")

def test_filter_logic():
    """Test the filtering logic for journal pages"""
    print("\n" + "=" * 60)
    print("Testing FILTER LOGIC")
    print("=" * 60)

    # Sample blocks (mocked)
    sample_blocks = [
        {
            'block/uuid': 'uuid-1',
            'block/title': 'Regular page block',
            'block/page': {
                'db/id': 1,
                'block/uuid': 'page-uuid-1',
                'block/name': 'my-regular-page',
                'block/title': 'My Regular Page',
                'block/journal?': False
            }
        },
        {
            'block/uuid': 'uuid-2',
            'block/title': 'Journal page block',
            'block/page': {
                'db/id': 2,
                'block/uuid': 'page-uuid-2',
                'block/name': '2025_11_10',
                'block/title': 'Nov 10th, 2025',
                'block/journal?': True
            }
        },
        {
            'block/uuid': 'uuid-3',
            'block/title': 'Another regular block',
            'block/page': {
                'db/id': 1,
                'block/uuid': 'page-uuid-1',
                'block/name': 'my-regular-page',
                'block/title': 'My Regular Page',
                'block/journal?': False
            }
        }
    ]

    def filter_journals(blocks, exclude_journals=True):
        """Filter out journal pages if exclude_journals is True"""
        if not exclude_journals:
            return blocks

        filtered = []
        for block in blocks:
            page = block.get('block/page', {})
            is_journal = page.get('block/journal?', False) or page.get('journal?', False)

            if not is_journal:
                filtered.append(block)

        return filtered

    print(f"\nOriginal blocks: {len(sample_blocks)}")

    # Test with filtering enabled
    filtered = filter_journals(sample_blocks, exclude_journals=True)
    print(f"After filtering (exclude journals): {len(filtered)}")
    for block in filtered:
        page_name = block['block/page']['block/name']
        print(f"  - {page_name}")

    # Test with filtering disabled
    not_filtered = filter_journals(sample_blocks, exclude_journals=False)
    print(f"\nWithout filtering (include journals): {len(not_filtered)}")
    for block in not_filtered:
        page_name = block['block/page']['block/name']
        is_journal = block['block/page'].get('block/journal?', False)
        print(f"  - {page_name} (journal: {is_journal})")

if __name__ == "__main__":
    print("POC: Journal Page Detection Test")
    print("=" * 60)
    print(f"Server: {HTTP_SERVER_URL}")
    print(f"Graph: {GRAPH_NAME}")
    print(f"Query: {TEST_QUERY}")
    print()

    # Test 1: Check current server response
    test_current_search()

    # Test 2: Test filtering logic
    test_filter_logic()

    print("\n" + "=" * 60)
    print("NEXT STEPS:")
    print("=" * 60)
    print("1. Check if 'block/journal?' appears in the response above")
    print("2. If NO: Update logseq_server.py datalog query to include :block/journal?")
    print("3. Test again to verify journal flag is present")
    print("4. Integrate filtering logic into extension")

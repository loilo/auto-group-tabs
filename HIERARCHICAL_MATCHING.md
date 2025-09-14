# Hierarchical URL Matching in Auto-Group Tabs

This document explains the new hierarchical URL matching functionality that allows you to create sophisticated tab grouping rules with priority-based matching.

## Overview

Auto-Group Tabs now supports hierarchical URL matching where you can create general rules and more specific sub-rules. The extension automatically prioritizes more specific patterns over general ones, and allows you to override this behavior with custom priorities.

## Key Features

### 1. **Priority-Based Matching**
- Each group can have a priority value (0-100)
- Higher priority numbers take precedence over lower ones
- Default priority is 0 for backward compatibility

### 2. **Automatic Specificity Calculation**
- The system automatically calculates how specific a URL pattern is
- More specific patterns (with paths) get higher scores than general domain patterns
- Exact URLs get the highest specificity scores

### 3. **Enhanced Pattern Suggestions**
- When adding patterns, the extension now suggests hierarchical options
- For `https://github.com/user/repo/issues`, it suggests:
  - `github.com/user/repo/issues/*` (most specific)
  - `github.com/user/repo/*` (repository level)
  - `github.com/user/*` (user level)
  - `github.com` (domain level)

### 4. **Case-Insensitive Matching**
- All URL pattern matching is case-insensitive
- `github.com/AdarBahar/*` will match:
  - `https://github.com/adarbahar/repo`
  - `https://GITHUB.COM/ADARBAHAR/repo`
  - `https://GitHub.Com/AdarBahar/repo`
  - Any other case variation

### 5. **Smart Wildcard Matching** 🆕
- Base domains automatically include subdomains (no need for `*.` prefix)
- `haaretz.co.il` automatically matches:
  - `https://haaretz.co.il/` (base domain)
  - `https://www.haaretz.co.il/` (www subdomain)
  - `https://m.haaretz.co.il/` (mobile subdomain)
- Specific subdomains remain exact:
  - `api.github.com` only matches `api.github.com` (not `github.com`)
- Explicit wildcards (`*.domain.com`) require subdomains (don't match base domain)

## Example: GitHub Workflow

### Step 1: Create Rules in Order of Specificity

**Most General First:**
- Group: "GitHub General"
- Pattern: `github.com`
- Color: Blue
- Priority: 0 (default)

**More Specific Second:**
- Group: "My GitHub"
- Pattern: `github.com/adarbahar/*` (matches any case: AdarBahar, ADARBAHAR, etc.)
- Color: Green
- Priority: 10

**Most Specific Last:**
- Group: "Auto-Group-Tabs Project"
- Pattern: `github.com/adarbahar/auto-group-tabs/*`
- Color: Red
- Priority: 20

### Step 2: How Matching Works

For URL: `https://github.com/adarbahar/auto-group-tabs/issues`

1. **All matching patterns are found:**
   - `github.com` (matches)
   - `github.com/adarbahar/*` (matches)
   - `github.com/adarbahar/auto-group-tabs/*` (matches)

2. **Scores are calculated:**
   - `github.com`: specificity=15 + priority=0×10 = 15
   - `github.com/adarbahar/*`: specificity=18 + priority=10×10 = 118
   - `github.com/adarbahar/auto-group-tabs/*`: specificity=21 + priority=20×10 = 221

3. **Highest score wins:** "Auto-Group-Tabs Project" (score: 221)

## Advanced Configuration

### Strict Mode
- **Strict ON**: Tabs cannot leave this group (even for higher priority matches)
- **Strict OFF**: Tabs can move to more specific groups
- **Recommendation**: Use strict mode only for your most specific rules

### Merge Mode
- **Merge ON**: All tabs matching this rule go to the same window
- **Merge OFF**: Tabs stay in their current window
- **Recommendation**: Be consistent with merge settings within related rules

### Priority Override Example

Sometimes you want a general rule to take precedence over specific ones:

**High Priority General Rule:**
- Group: "GitHub Work"
- Pattern: `github.com`
- Priority: 50
- Result: All GitHub tabs go here, regardless of specificity

**Low Priority Specific Rule:**
- Group: "Personal Project"
- Pattern: `github.com/adarbahar/personal-project/*`
- Priority: 0
- Result: This won't match because the general rule has higher priority

## Pattern Specificity Scoring

The system calculates specificity based on:

1. **Base score**: 1 point for any pattern
2. **Host specificity**:
   - Wildcard host (`*`): +1 point
   - Subdomain wildcard (`*.example.com`): +5 points + domain levels
   - Exact host (`example.com`): +10 points + domain levels
3. **Path specificity**:
   - Root wildcard (`/*`): +2 points
   - Path segments: +3 points per segment
   - Exact path (no wildcards): +5 bonus points
4. **Protocol specificity**:
   - Specific protocol (`https://`): +2 points
   - Any protocol: +0 points

## Testing Your Rules

### Debug Console
1. Open `chrome://extensions/`
2. Find "Auto-Group Tabs"
3. Click "Inspect views: background page"
4. Watch for debug messages showing which rules match and their scores

### Example Debug Output
```
Tab 'Auto-Group-Tabs Issues' (123) matches pattern 'github.com' from group 'GitHub General' (priority: 0)
Tab 'Auto-Group-Tabs Issues' (123) matches pattern 'github.com/adarbahar/*' from group 'My GitHub' (priority: 10)
Tab 'Auto-Group-Tabs Issues' (123) matches pattern 'github.com/adarbahar/auto-group-tabs/*' from group 'Auto-Group-Tabs Project' (priority: 20)
Tab 'Auto-Group-Tabs Issues' (123) had 3 matches, selected 'Auto-Group-Tabs Project' based on priority
```

## Migration from Previous Versions

- Existing groups automatically get priority=0
- First-match behavior is replaced with best-match behavior
- No configuration changes needed for basic setups
- Enhanced pattern suggestions appear when editing groups

## Troubleshooting Common Issues

### Issue 1: "haaretz.co.il doesn't match www.haaretz.co.il" ✅ SOLVED

**Problem**: Exact domain patterns didn't match www subdomains
**Solution**: Smart wildcards now handle this automatically!

```
✅ Now works: haaretz.co.il
✅ Also works: *.haaretz.co.il (if you want explicit wildcard)
```

The pattern `haaretz.co.il` now automatically matches:
- `https://haaretz.co.il/` (base domain)
- `https://www.haaretz.co.il/` (www subdomain)
- `https://m.haaretz.co.il/` (mobile subdomain)

**No action needed** - existing patterns now work better!

### Issue 2: "Higher priority group not taking effect"

**Problem**: Priority changes don't trigger tab reassignment
**Solution**: This was a bug that has been fixed. Priority changes now trigger regrouping.

**Steps to verify it's working:**
1. Create a general group: `github.com/*` (priority: 0)
2. Create a specific group: `github.com/adarbahar/*` (priority: 20)
3. Open GitHub tabs - they should go to the higher priority group
4. Check browser console for debug messages

### Issue 3: "Tabs stay in old group despite new higher priority rule"

**Problem**: Existing tabs don't move to new higher priority groups
**Solution**: The extension now automatically reassigns tabs when:
- New groups are added
- Priority values change
- Pattern changes occur

**Debug steps:**
1. Open `chrome://extensions/`
2. Find "Auto-Group Tabs" → "Inspect views: background page"
3. Watch for messages like:
   ```
   Tab 'My Repo' matches pattern 'github.com/adarbahar/*' from group 'My Code' (priority: 20)
   Tab 'My Repo' had 2 matches, selected 'My Code' based on priority
   ```

## Best Practices

1. **Start Simple**: Begin with domain-level rules, add specificity as needed
2. **Use Wildcard Patterns**: For domains, use `*.domain.com` to handle www variations
3. **Test Incrementally**: Create one rule at a time and verify behavior
4. **Use Consistent Priorities**: Space out priority values (0, 10, 20, 30...)
5. **Monitor Debug Console**: Watch for unexpected matches during setup
6. **Document Your Rules**: Keep track of what each priority level represents

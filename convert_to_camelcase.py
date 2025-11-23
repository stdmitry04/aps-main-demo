#!/usr/bin/env python3
"""
Script to convert snake_case to camelCase in TypeScript/JavaScript files.

This script intelligently converts object property names from snake_case to camelCase
while preserving:
- Constant names (UPPER_SNAKE_CASE)
- String literal values
- Comments
- Import/export statements (mostly)
- Type names
- Environment variables
"""

import re
import os
import sys
from pathlib import Path
from typing import List, Tuple

# Patterns that should NOT be converted
EXCLUDE_PATTERNS = [
    r'process\.env\.',  # Environment variables
    r'NODE_ENV',
    r'API_URL',
    r'NEXT_PUBLIC_',
    r'export const [A-Z_]+\s*=',  # Exported constants
    r'const [A-Z_]+\s*=',  # Const declarations with UPPER_CASE names
    r'let [A-Z_]+\s*=',
    r'var [A-Z_]+\s*=',
    r'interface [A-Z]',  # Interface/Type names
    r'type [A-Z]',
    r'class [A-Z]',
    r'enum [A-Z]',
]

# Specific keys that should remain snake_case (e.g., localStorage keys as string values)
PRESERVE_STRING_VALUES = [
    'onboarding_form_data',
    'onboarding_last_section',
    'section_completed',
    'form_submitted',
]


def snake_to_camel(name: str) -> str:
    """Convert snake_case to camelCase."""
    components = name.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])


def is_constant_name(name: str) -> bool:
    """Check if a name is a constant (UPPER_SNAKE_CASE)."""
    return name.isupper() and '_' in name


def should_skip_line(line: str) -> bool:
    """Check if line should be skipped from conversion."""
    # Skip comments
    stripped = line.strip()
    if stripped.startswith('//') or stripped.startswith('*') or stripped.startswith('/*'):
        return True

    # Skip lines with exclude patterns
    for pattern in EXCLUDE_PATTERNS:
        if re.search(pattern, line):
            return True

    return False


def convert_object_properties(content: str) -> str:
    """Convert object property definitions from snake_case to camelCase."""
    lines = content.split('\n')
    result_lines = []

    for line in lines:
        if should_skip_line(line):
            result_lines.append(line)
            continue

        # Pattern 1: Object property with value (key: value or key = value)
        # Match:  property_name: value,  or  property_name = value,
        def replace_property(match):
            indent = match.group(1)
            key = match.group(2)
            separator = match.group(3)
            rest = match.group(4)

            # Don't convert if it's a constant
            if is_constant_name(key):
                return match.group(0)

            # Convert to camelCase
            camel_key = snake_to_camel(key)
            return f"{indent}{camel_key}{separator}{rest}"

        # Match object properties: "    property_name: value" or "    property_name = value"
        line = re.sub(
            r'^(\s+)([a-z][a-z0-9_]+)([:=])(\s)',
            replace_property,
            line
        )

        # Pattern 2: Object literal in code {property_name: value}
        def replace_inline_property(match):
            before = match.group(1)
            key = match.group(2)
            separator = match.group(3)

            # Don't convert if it's a constant or a string value
            if is_constant_name(key) or key in PRESERVE_STRING_VALUES:
                return match.group(0)

            camel_key = snake_to_camel(key)
            return f"{before}{camel_key}{separator}"

        # Match inline object properties: { property_name: or , property_name:
        line = re.sub(
            r'([{,]\s*)([a-z][a-z0-9_]+)(\s*:)',
            replace_inline_property,
            line
        )

        # Pattern 3: Destructuring or parameters
        # Match function parameters like (data: { property_name: type })
        def replace_param_property(match):
            before = match.group(1)
            key = match.group(2)
            after = match.group(3)

            if is_constant_name(key):
                return match.group(0)

            camel_key = snake_to_camel(key)
            return f"{before}{camel_key}{after}"

        # Be careful with this pattern - only in type contexts
        if ': {' in line or 'interface' in line or 'type' in line:
            line = re.sub(
                r'(\s+)([a-z][a-z0-9_]+)(\??\s*:)',
                replace_param_property,
                line
            )

        result_lines.append(line)

    return '\n'.join(result_lines)


def convert_property_access(content: str) -> str:
    """Convert property access from snake_case to camelCase."""
    lines = content.split('\n')
    result_lines = []

    for line in lines:
        if should_skip_line(line):
            result_lines.append(line)
            continue

        # Pattern: object.property_name or object?.property_name
        def replace_access(match):
            obj = match.group(1)
            separator = match.group(2)
            prop = match.group(3)

            # Don't convert constants or env vars
            if is_constant_name(prop) or prop.startswith('NEXT_PUBLIC_'):
                return match.group(0)

            camel_prop = snake_to_camel(prop)
            return f"{obj}{separator}{camel_prop}"

        # Match: something.property_name or something?.property_name
        line = re.sub(
            r'(\w+)(\.|\?\.)([a-z][a-z0-9_]+)\b',
            replace_access,
            line
        )

        result_lines.append(line)

    return '\n'.join(result_lines)


def process_file(file_path: Path) -> Tuple[bool, str]:
    """
    Process a single file and convert snake_case to camelCase.
    Returns (changed, error_message).
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            original_content = f.read()

        # Apply conversions
        modified_content = convert_object_properties(original_content)
        modified_content = convert_property_access(modified_content)

        # Check if anything changed
        if original_content == modified_content:
            return False, ""

        # Write back
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(modified_content)

        return True, ""

    except Exception as e:
        return False, str(e)


def find_typescript_files(root_dir: Path, exclude_dirs: List[str] | None = None) -> List[Path]:
    """Find all TypeScript/JavaScript files in the directory."""
    if exclude_dirs is None:
        exclude_dirs = ['node_modules', '.next', 'dist', 'build', '.git']

    files = []
    for ext in ['*.ts', '*.tsx', '*.js', '*.jsx']:
        for file_path in root_dir.rglob(ext):
            # Skip excluded directories
            if any(excluded in file_path.parts for excluded in exclude_dirs):
                continue
            # Skip type definition files (already converted)
            if '/types/' in str(file_path) and not str(file_path).endswith('.d.ts'):
                continue
            files.append(file_path)

    return files


def main():
    """Main function."""
    # Get the script directory
    script_dir = Path(__file__).parent
    frontend_dir = script_dir / 'frontend'

    if not frontend_dir.exists():
        print(f"Error: Frontend directory not found at {frontend_dir}")
        sys.exit(1)

    print(f"🔍 Searching for TypeScript/JavaScript files in {frontend_dir}...")

    # Find all relevant files (excluding types directory since already converted)
    files = find_typescript_files(frontend_dir, exclude_dirs=[
                                  'node_modules', '.next', 'dist', 'build', '.git', 'types'])

    print(f"📝 Found {len(files)} files to process")

    if not files:
        print("No files found to process.")
        return

    # Ask for confirmation
    response = input(
        f"\n⚠️  This will modify {len(files)} files. Continue? (y/N): ")
    if response.lower() != 'y':
        print("Aborted.")
        return

    # Process files
    changed_count = 0
    error_count = 0

    print("\n🔄 Processing files...")
    for file_path in files:
        changed, error = process_file(file_path)

        if error:
            print(f"❌ Error processing {file_path}: {error}")
            error_count += 1
        elif changed:
            print(f"✅ Modified: {file_path.relative_to(frontend_dir)}")
            changed_count += 1

    print(f"\n✨ Done!")
    print(f"   Modified: {changed_count} files")
    print(f"   Unchanged: {len(files) - changed_count - error_count} files")
    if error_count > 0:
        print(f"   Errors: {error_count} files")

    print("\n⚠️  Important: Please review the changes and run your tests!")
    print("   Some edge cases may need manual adjustment.")


if __name__ == '__main__':
    main()

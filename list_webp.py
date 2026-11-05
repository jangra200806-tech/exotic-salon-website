#!/usr/bin/env python3
import os

images_dir = os.path.join('.', 'images')
webp_files = [f for f in os.listdir(images_dir) if f.lower().endswith('.webp')]
print(f"WebP files ({len(webp_files)}):")
for f in sorted(webp_files)[:30]:
    print(f"  {f}")
if len(webp_files) > 30:
    print(f"  ... and {len(webp_files) - 30} more")
PYEOF
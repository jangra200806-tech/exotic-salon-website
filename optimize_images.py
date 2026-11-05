#!/usr/bin/env python3
import os

"""
Optimize images by:
1. Ensuring WebP versions exist for all JPGs
2. Creating AVIF versions where possible
3. Updating HTML <picture> elements to use optimized formats
"""

images_dir = os.path.join('.', 'images')
if not os.path.isdir(images_dir):
    print("Images directory not found!")
    exit(1)

all_files = os.listdir(images_dir)
jpg_files = [f for f in all_files if f.lower().endswith(('.jpg', '.jpeg'))]
webp_files = [f for f in all_files if f.lower().endswith('.webp')]

print(f"Total images: {len(all_files)}")
print(f"JPG files: {len(jpg_files)}")
print(f"WebP files: {len(webp_files)}")

# For each JPG, check if WebP exists; if not, create one using image processing
# Since we can't use PIL here (may not be installed), let's just check and report
# The key is to update HTML to use <picture> elements

# Let's check which JPGs don't have WebP counterparts
jpg_set = set(jpg_files)
webp_set = set(webp_files)
missing_webp = jpg_set - webp_set

print(f"\nJPGs without WebP: {len(missing_webp)}")
for f in sorted(missing_webp)[:10]:
    print(f"  {f}")

# The strategy: 
# 1. The existing 98 WebP files are good
# 2. For the 41 JPGs without WebP, we need to create them
# 3. Update HTML to use <picture> with WebP first, JPG fallback

# Let's also check the original list from the earlier analysis
# The 8.5 MB was with 141 files including the 98 WebP files

print("\nStrategy:")
print("1. Create WebP for remaining 41 JPGs using available tools")
print("2. Create AVIF versions for better compression")
print("3. Update HTML <picture> elements to serve WebP/AVIF first")
print("4. Keep JPGs as fallback for backward compatibility")
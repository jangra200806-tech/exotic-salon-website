#!/usr/bin/env python3
import os

images_dir = os.path.join('.', 'images')
if os.path.isdir(images_dir):
    all_files = os.listdir(images_dir)
    jpg_files = [f for f in all_files if f.lower().endswith(('.jpg', '.jpeg'))]
    png_files = [f for f in all_files if f.lower().endswith('.png')]
    webp_files = [f for f in all_files if f.lower().endswith('.webp')]
    avif_files = [f for f in all_files if f.lower().endswith('.avif')]
    
    print(f"JPG/JPEG files: {len(jpg_files)}")
    for f in sorted(jpg_files)[:20]:
        path = os.path.join(images_dir, f)
        size = os.path.getsize(path)
        print(f"  {f} - {size / 1024:.1f} KB")
    if len(jpg_files) > 20:
        print(f"  ... and {len(jpg_files) - 20} more JPG files")
    
    print(f"\nPNG files: {len(png_files)}")
    for f in sorted(png_files)[:10]:
        path = os.path.join(images_dir, f)
        size = os.path.getsize(path)
        print(f"  {f} - {size / 1024:.1f} KB")
    
    print(f"\nWebP files: {len(webp_files)}")
    print(f"AVIF files: {len(avif_files)}")
    
    total_size = sum(os.path.getsize(os.path.join(images_dir, f)) for f in all_files if os.path.isfile(os.path.join(images_dir, f)))
    print(f"\nTotal images: {len(all_files)}")
    print(f"Total size: {total_size / 1024 / 1024:.1f} MB")
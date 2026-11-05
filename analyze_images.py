import os

# Check the directory structure for images and assets
print("=== IMAGE FILES ===")
img_dir = os.path.join('.', 'images')
if os.path.exists(img_dir):
    files = os.listdir(img_dir)
    webp_files = [f for f in files if f.endswith('.webp')]
    jpg_files = [f for f in files if f.endswith('.jpg')]
    print(f"Total images: {len(files)}")
    print(f"WebP files: {len(webp_files)}")
    print(f"JPG files: {len(jpg_files)}")
    # Show some sample files
    print(f"\nSample WebP: {webp_files[:5]}")
    print(f"Sample JPG: {jpg_files[:5]}")

print("\n=== Check for data/info.js ===")
info_path = os.path.join('.', 'data', 'info.js')
if os.path.exists(info_path):
    size = os.path.getsize(info_path)
    print(f"info.js size: {size} bytes")
else:
    print("info.js not found")

print("\n=== Check vercel.json ===")
vercel_path = os.path.join('.', 'vercel.json')
if os.path.exists(vercel_path):
    with open(vercel_path, 'r') as f:
        print(f.read())
else:
    print("vercel.json not found")
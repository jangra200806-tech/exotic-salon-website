with open('index.html', 'r') as f:
    c = f.read()
# Check structure
print('Total length:', len(c))
print('Has <head>:', '<head>' in c)
print('Has <body>:', '<body>' in c)
print('hero-slider:', 'hero-slider' in c)
print('hero-main-text:', 'hero-main-text' in c)
print('lazy loading count:', c.count('loading="lazy"'))
print('fetchpriority count:', c.count('fetchpriority'))
print('img tags count:', c.count('<img'))
print('srcset count:', c.count('srcset'))
print('sizes count:', c.count('sizes'))
# Find all image src patterns
import re
imgs = re.findall(r'src="([^"]+)"', c)
print(f"\nSample imgs (first 10): {imgs[:10]}")
# Check for data-src or other patterns
imgs2 = re.findall(r'data-src="([^"]+)"', c)
print(f"Sample data-src (first 5): {imgs2[:5]}")
PYEOF
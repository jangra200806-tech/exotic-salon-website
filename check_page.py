with open('index.html', 'r') as f:
    c = f.read()
print('Has head:', '<head>' in c)
print('Has title:', '<title>' in c)
print('Has viewport:', 'viewport' in c.lower())
print('Has hero-slider:', 'hero-slider' in c)
print('Has preload:', 'preload' in c.lower())
print('Has fetchpriority:', 'fetchpriority' in c.lower())
print('Has lazy loading:', 'loading="lazy"' in c)
with open('data/info.js', 'r') as f:
    c = f.read()
start = c.find('heroSlides:')
if start != -1:
    print(c[start:start+1000])
from PIL import Image
import vtracer

img_path = r'C:\Users\ameyp\.gemini\antigravity-ide\brain\a4fe12a3-ec75-425a-9590-6884774d8efd\media__1785396380306.png'
img = Image.open(img_path).convert('L')
w, h = img.size

# Crop watermark at the bottom (keep top 84%)
img_cropped = img.crop((0, 0, w, int(h * 0.84)))

# Threshold: turn black pixels into 0 (black) and rest into 255 (white)
bw = img_cropped.point(lambda p: 0 if p < 140 else 255)
bw_path = r'd:\Projects\MAISIP\frontend\public\temp_bw.png'
bw.save(bw_path)

svg_path = r'd:\Projects\MAISIP\frontend\public\tree-exact.svg'
vtracer.convert_image_to_svg_py(
    bw_path, 
    svg_path, 
    colormode='binary', 
    mode='spline'
)

with open(svg_path, 'r', encoding='utf-8') as f:
    svg_text = f.read()

import xml.etree.ElementTree as ET
ET.register_namespace('', "http://www.w3.org/2000/svg")
tree = ET.fromstring(svg_text)

# Find paths that are not the outer white background rect
paths = tree.findall('{http://www.w3.org/2000/svg}path')

# In binary mode vtracer produces paths with fill color. The black shape path will have dark fill.
new_paths = []
for p in paths:
    fill = p.attrib.get('fill', '').upper()
    d = p.attrib.get('d', '')
    if fill == '#FFFFFF' or fill == '#FCFCFC' or fill == '#FAFAFA' or fill == '#F9F9F9' or fill == '#F8F8F8' or fill == '#F3F3F3' or fill == '#E7E7E7':
        continue
    # Keep black/dark paths and change fill to currentColor
    p.set('fill', 'currentColor')
    new_paths.append(p)

# Create a clean minimal SVG
root = ET.Element('svg', {
    'viewBox': f"0 0 {w} {int(h*0.84)}",
    'xmlns': "http://www.w3.org/2000/svg",
    'width': "22",
    'height': "22",
    'fill': "none"
})

for p in new_paths:
    root.append(p)

clean_svg_str = ET.tostring(root, encoding='unicode')

with open(svg_path, 'w', encoding='utf-8') as f:
    f.write(clean_svg_str)

print('VECTORIZATION CLEANED & DONE!')

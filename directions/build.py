#!/usr/bin/env python3
"""Build the two distributable copies of the guide from the source page.

  directions/parliament-shuttle-guide.html   source: links the .jpg files
    -> dist/KLSentral-T851-Parliament-Guide.html  one self-contained file,
                                             embedded, opens from anywhere
    -> dist/artifact-body.html               same page without the <html>
                                             wrapper, for publishing

Photos are downscaled and re-encoded so the single file stays light enough
to open over mobile data.
"""
import base64, io, pathlib, re
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent
DIST = ROOT.parent / 'dist'
MAX_WIDTH = 1280
QUALITY = 78

src = (ROOT / 'parliament-shuttle-guide.html').read_text(encoding='utf-8')


def encode(name):
    image = Image.open(ROOT / name)
    if image.width > MAX_WIDTH:
        height = round(image.height * MAX_WIDTH / image.width)
        image = image.resize((MAX_WIDTH, height), Image.LANCZOS)
    buffer = io.BytesIO()
    image.convert('RGB').save(buffer, 'JPEG', quality=QUALITY, optimize=True, progressive=True)
    return base64.b64encode(buffer.getvalue()).decode()


def inline(page):
    return re.subn(
        r'src="([^"]+\.jpg)"',
        lambda m: 'src="data:image/jpeg;base64,%s"' % encode(m.group(1)),
        page,
    )


DIST.mkdir(exist_ok=True)

standalone, count = inline(src)
(DIST / 'KLSentral-T851-Parliament-Guide.html').write_text(standalone, encoding='utf-8')

head = re.sub(r'<meta[^>]*>\s*', '', standalone.split('<head>', 1)[1].split('</head>', 1)[0])
body = standalone.split('<body>', 1)[1].split('</body>', 1)[0]
(DIST / 'artifact-body.html').write_text(head.strip() + '\n' + body.strip() + '\n', encoding='utf-8')

for out in ('KLSentral-T851-Parliament-Guide.html', 'artifact-body.html'):
    print(f'{out}: {(DIST / out).stat().st_size / 1e6:.2f} MB ({count} photos embedded)')

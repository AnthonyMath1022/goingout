# Builds the artifact version of the guide: strips the standalone HTML wrapper
# and inlines each step photo as a data: URI (the artifact sandbox does not
# fetch sibling image files).
import base64, pathlib, re

SRC = pathlib.Path('/home/user/goingout/directions/klia-ekspres-guide.html')
OUT = pathlib.Path('/tmp/claude-0/-home-user-goingout/8ebe2766-8374-51f6-8a54-82711b8ab439/scratchpad/klia-guide.html')

src = SRC.read_text(encoding='utf-8')
head = re.sub(r'<meta[^>]*>\s*', '', src.split('<head>', 1)[1].split('</head>', 1)[0])
body = src.split('<body>', 1)[1].split('</body>', 1)[0]
page = head.strip() + '\n' + body.strip() + '\n'

def inline(match):
    name = match.group(1)
    data = (SRC.parent / name).read_bytes()
    return 'src="data:image/jpeg;base64,%s"' % base64.b64encode(data).decode()

page, n = re.subn(r'src="([^"]+\.jpg)"', inline, page)
OUT.write_text(page, encoding='utf-8')
print(f'inlined {n} images -> {OUT} ({OUT.stat().st_size/1e6:.2f} MB)')

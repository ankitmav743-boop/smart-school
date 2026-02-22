import os

with open('server/index.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('\\`', '`').replace('\\$', '$')

with open('server/index.js', 'w', encoding='utf-8') as f:
    f.write(content)

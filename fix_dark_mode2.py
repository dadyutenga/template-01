import re

with open('src/pages/Index/Index.tsx', 'r') as f:
    content = f.read()

replacements = {
    'bg-gradient-to-b from-slate-50 to-white': 'bg-gradient-to-b from-muted/30 to-background dark:from-muted/10 dark:to-background',
    'border-[2.5px] border-white': 'border-[2.5px] border-background',
    'from-slate-50 to-slate-100/50': 'from-muted/30 to-muted/10',
    'bg-white/80': 'bg-background/80',
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('src/pages/Index/Index.tsx', 'w') as f:
    f.write(content)

print("Replacement 2 complete.")

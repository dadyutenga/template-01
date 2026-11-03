import re

with open('src/pages/Index/Index.tsx', 'r') as f:
    content = f.read()

# Main container
content = content.replace('bg-white text-[#111c2a]', 'bg-background text-foreground')

# Colors
replacements = {
    'bg-white': 'bg-card',
    'bg-slate-50': 'bg-muted/30',
    'bg-slate-100': 'bg-muted',
    'bg-slate-200': 'bg-border/60',
    'border-slate-200': 'border-border',
    'border-slate-300': 'border-border/80 hover:border-border',
    'text-slate-400': 'text-muted-foreground/70',
    'text-slate-500': 'text-muted-foreground',
    'text-slate-600': 'text-muted-foreground',
    'text-slate-900': 'text-foreground',
    'hover:bg-slate-50': 'hover:bg-muted/50',
    'hover:border-slate-300': 'hover:border-border',
    'bg-slate-800': 'bg-foreground/10',
    'text-slate-800': 'text-foreground',
}

for old, new in replacements.items():
    content = content.replace(old, new)

# Fix some specific issues that might arise from naive replacement
content = content.replace('bg-card text-foreground', 'bg-background text-foreground')
content = content.replace('bg-muted/30 border-y', 'bg-muted/20 border-y') # sections

with open('src/pages/Index/Index.tsx', 'w') as f:
    f.write(content)

print("Replacement complete.")

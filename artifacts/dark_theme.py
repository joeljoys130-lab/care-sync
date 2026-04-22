import os
import glob

# Paths to search
frontend_dir = r"c:\Users\kavis\Desktop\care-sync-fix-senior-dev-audit\frontend\src"

# Files to update
files = glob.glob(os.path.join(frontend_dir, '**', '*.jsx'), recursive=True)

replacements = {
    "bg-slate-50": "bg-[#1c283d]/50",
    "bg-white": "bg-[#131d30]/60",
    "text-slate-800": "text-white",
    "text-slate-700": "text-slate-200",
    "text-slate-600": "text-slate-400",
    "text-slate-500": "text-slate-400",
    "border-slate-100": "border-white/5",
    "border-slate-200": "border-white/5",
    "border-gray-100": "border-white/5",
    "border-gray-200": "border-white/5",
    "shadow-sm": "shadow-2xl",
    "shadow-md": "shadow-2xl",
}

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file_path}")

print("Done.")

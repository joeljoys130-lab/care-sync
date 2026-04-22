import os
import glob

frontend_dir = r"c:\Users\kavis\Desktop\care-sync-fix-senior-dev-audit\frontend\src"
files = glob.glob(os.path.join(frontend_dir, '**', '*.jsx'), recursive=True)

replacements = {
    "bg-[#0a0f1a]": "bg-sky-50 dark:bg-[#0a0f1a]",
    "bg-[#131d30]/60": "bg-white dark:bg-[#131d30]/60",
    "bg-[#1c283d]/50": "bg-white dark:bg-[#1c283d]/50",
    "bg-[#1c283d]": "bg-sky-100 dark:bg-[#1c283d]",
    "text-white": "text-slate-800 dark:text-white",
    "text-slate-200": "text-slate-700 dark:text-slate-200",
    "text-slate-400": "text-slate-500 dark:text-slate-400",
    "border-white/5": "border-slate-200 dark:border-white/5",
    "border-white/10": "border-slate-300 dark:border-white/10",
    "shadow-2xl": "shadow-lg dark:shadow-2xl",
}

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    # Revert text-white for primary blue gradient buttons
    content = content.replace("text-slate-800 dark:text-white font-semibold rounded-2xl shadow-lg dark:shadow-2xl", "text-white font-semibold rounded-2xl shadow-lg dark:shadow-2xl")
    content = content.replace("text-slate-800 dark:text-white font-semibold", "text-white font-semibold")
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file_path}")

print("Done.")

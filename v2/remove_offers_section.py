
filePath = r'c:\Users\twani\Code\karwei\v2\src\routes\profile\+page.svelte'
with open(filePath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 1-indexed lines 888 to 996 correspond to 0-indexed 887 to 995
start_idx = 887
end_idx = 996 # Python slice end is exclusive, so this goes up to 995

print(f"Line {start_idx+1}: {lines[start_idx].rstrip()}")
print(f"Line {end_idx}: {lines[end_idx-1].rstrip()}")

# Perform deletion
new_content = lines[:start_idx] + lines[end_idx:]

with open(filePath, 'w', encoding='utf-8') as f:
    f.writelines(new_content)

print("Successfully removed lines.")


filePath = r'c:\Users\twani\Code\karwei\v2\src\routes\profile\+page.svelte'
with open(filePath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 1-indexed lines 473 to 658 correspond to 0-indexed 472 to 657
start_idx = 472
end_idx = 658 # Python slice end is exclusive, so this goes up to 657

print(f"Line {start_idx+1}: {lines[start_idx].rstrip()}")
print(f"Line {end_idx}: {lines[end_idx-1].rstrip()}")

# Perform deletion
new_content = lines[:start_idx] + lines[end_idx:]

with open(filePath, 'w', encoding='utf-8') as f:
    f.writelines(new_content)

print("Successfully removed lines.")

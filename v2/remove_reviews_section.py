
filePath = r'c:\Users\twani\Code\karwei\v2\src\routes\profile\+page.svelte'
with open(filePath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 1-indexed lines 785 to 880 correspond to 0-indexed 784 to 879
start_idx = 784
end_idx = 880 # Python slice end is exclusive, so this goes up to 879

print(f"Line {start_idx+1}: {lines[start_idx].rstrip()}")
print(f"Line {end_idx}: {lines[end_idx-1].rstrip()}")

# Perform deletion
new_content = lines[:start_idx] + lines[end_idx:]

with open(filePath, 'w', encoding='utf-8') as f:
    f.writelines(new_content)

print("Successfully removed lines.")

export const categoryIcons: Record<string, string> = {
    "Electronics": "⚡",
    "Woodwork": "🪚",
    "Textile": "🧵",
    "Metalwork": "🏗️",
    "Appliances": "🧺",
    "Plumbing": "🚰",
    "Electrical": "💡",
    "Bicycle Repair": "🚲",
    "Automotive": "🚗",
    "Jewelry": "💍",
    "Leather": "👢",
    "Musical Instruments": "🎸",
    "Ceramics & Glass": "🏺",
    "Gardening Tools": "🌿",
    "General Handyman": "🛠️"
};

export function getCategoryIcon(name: string): string {
    return categoryIcons[name] || "🔧";
}

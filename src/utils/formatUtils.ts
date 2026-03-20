export const normalizeCategory = (name: string): string => {
    let normalized = name.trim();
    // Fix typos
    if (normalized.toLowerCase() === 'fragnance') return 'Fragrance';
    if (normalized.toLowerCase() === 'abaya') return 'Abayas';
    
    // Capitalize each word
    return normalized.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

export const decodeHtml = (html: string): string => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
};

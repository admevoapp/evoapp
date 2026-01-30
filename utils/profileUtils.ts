
export const profileColorMap: { [key: string]: string } = {
    '🔴': 'bg-red-500',
    '🟡': 'bg-yellow-400',
    '🟢': 'bg-green-500',
    '🔵': 'bg-blue-500',
};

export const getProfileColors = (profile?: string): string[] => {
    if (!profile) return [];
    // Match red, yellow, green, blue circle emojis
    const emojis = profile.match(/[\u{1F534}\u{1F7E1}\u{1F7E2}\u{1F535}]/gu) || [];
    return emojis.map(emoji => profileColorMap[emoji]).filter(Boolean);
};

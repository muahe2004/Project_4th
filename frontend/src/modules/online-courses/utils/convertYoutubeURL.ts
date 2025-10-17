export function convertYouTubeURL(url: string) {
    try {
        const videoIdMatch = url.match(/[?&]v=([^&#]+)/);
        if (!videoIdMatch) return null; 
        const videoId = videoIdMatch[1];
        return `https://www.youtube.com/embed/${videoId}`;
    } catch (e) {
        return null;
    }
};
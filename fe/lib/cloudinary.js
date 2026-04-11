export const getOptimizedUrl = (url, options = {}) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    
    // Guard: If URL already contains transformations (anything not starting with 'v' after /upload/)
    if (/\/upload\/[^v][^\/]+\//.test(url)) return url;
    
    const { width = 800, quality = 'auto', format = 'auto' } = options;
    
    const transforms = [];
    if (width) transforms.push(`w_${width}`);
    if (quality) transforms.push(`q_${quality}`);
    if (format) transforms.push(`f_${format}`);
    
    const transformString = transforms.join(',');
    
    return url.replace('/upload/', `/upload/${transformString}/`);
};

export const getBlurUrl = (url) => {
    if (!url || !url.includes('cloudinary.com')) return undefined;
    if (url.includes('e_blur:')) return url; // Already has blur or similar
    return url.replace('/upload/', '/upload/w_20,q_auto:low,f_auto,e_blur:1000/');
};

const EXT = /\.(pdf|docx?)$/i;
export function displayNameFromFilename(filename) {
    const base = filename.replace(EXT, '').trim() || filename;
    return base.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim() || 'Candidate';
}
export function makeCandidateId(filename, index) {
    const base = filename
        .replace(EXT, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 40);
    return `c_${index}_${base || 'resume'}`;
}

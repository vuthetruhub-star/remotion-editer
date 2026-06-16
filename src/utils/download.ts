export const download = (url: string, filename: string): Promise<void> => {
  // Strip any .mp4 suffix the caller may have included to avoid double extension.
  const base = filename.replace(/\.mp4$/i, "");
  return fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error(`Failed to fetch file (${response.status})`);
      return response.blob();
    })
    .then((blob) => {
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.setAttribute("download", `${base}.mp4`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    });
};

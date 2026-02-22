export async function shareContent(title, text, url) {
  if (typeof navigator === 'undefined') return false;
  const data = { title, text };
  if (url) data.url = url;
  try {
    if (navigator.share) {
      await navigator.share(data);
      return true;
    }
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
}

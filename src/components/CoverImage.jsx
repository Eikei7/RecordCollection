import React, { useState } from 'react';

export default function CoverImage({ src, mbid, alt = 'cover', className, noCoverClassName = 'no-cover' }) {
  const [hasError, setHasError] = useState(false);
  const imageSrc = src?.includes('archive.org/')
    ? `https://coverartarchive.org/release-group/${mbid}/front-250`
    : src;

  if (!imageSrc || hasError) {
    return <div className={`${noCoverClassName}${className ? ` ${className}` : ''}`}>No Cover</div>;
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}

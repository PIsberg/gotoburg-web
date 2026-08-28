import React from 'react';
import { ImageCredit as Credit } from '../types';

/**
 * Attribution line under an image.
 *
 * CC BY and CC BY-SA require the author, the licence and a link back to the
 * source wherever the work is published. The article page previously used the
 * headline as its figcaption, which said nothing and satisfied nothing.
 */
const ImageCredit: React.FC<{ credit?: Credit; caption?: string; className?: string }> = ({
    credit,
    caption,
    className = '',
}) => {
    if (!credit && !caption) return null;
    return (
        <figcaption className={`text-xs mt-2 ${className}`}>
            {/* What is actually in the frame, when that is not the subject of
                the article. Set in darker type than the attribution because it
                is editorial content rather than a licence obligation. */}
            {caption && <span className="block text-gray-600 mb-0.5">{caption}</span>}
            {credit && (
              <span className="block text-gray-400">
            Foto:{' '}
            <a
                href={credit.sourceUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="hover:text-gray-600 underline decoration-gray-300 underline-offset-2"
            >
                {credit.author}
            </a>
            {' / Wikimedia Commons, '}
            {/* Public domain files have no licence URL; an empty href would
                render as a link back to the current page. */}
            {credit.licenceUrl ? (
                <a
                    href={credit.licenceUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow license"
                    className="hover:text-gray-600 underline decoration-gray-300 underline-offset-2"
                >
                    {credit.licence}
                </a>
            ) : (
                <span>{credit.licence}</span>
            )}
              </span>
            )}
        </figcaption>
    );
};

export default ImageCredit;

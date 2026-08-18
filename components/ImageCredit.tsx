import React from 'react';
import { ImageCredit as Credit } from '../types';

/**
 * Attribution line under an image.
 *
 * CC BY and CC BY-SA require the author, the licence and a link back to the
 * source wherever the work is published. The article page previously used the
 * headline as its figcaption, which said nothing and satisfied nothing.
 */
const ImageCredit: React.FC<{ credit?: Credit; className?: string }> = ({ credit, className = '' }) => {
    if (!credit) return null;
    return (
        <figcaption className={`text-xs text-gray-400 mt-2 ${className}`}>
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
        </figcaption>
    );
};

export default ImageCredit;

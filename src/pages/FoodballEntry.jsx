import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import HeicImage from '../components/HeicImage';
import CommentSection from '../components/CommentSection';
import { getEntry, getSortedEntriesMetadata } from '../entries';
import '../styles/foodball.css';

function FoodballEntry({user}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allEntries, setAllEntries] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState('');
  
  useEffect(() => {
    const loadEntries = async () => {
      try {
        setLoading(true);
        setEntry(null);
        
        // Load all entries to determine navigation
        const entries = await getSortedEntriesMetadata('date-high', false);
        setAllEntries(entries);
        
        // Find current entry index
        const entryId = parseInt(id);
        const index = entries.findIndex(e => e.id === entryId);
        
        if (index === -1) {
          navigate('/foodball');
          return;
        }
        
        setCurrentIndex(index);
        
        // Load the actual entry
        const loadedEntry = await getEntry(id);
        
        if (!loadedEntry) {
          navigate('/foodball');
          return;
        }
        
        // Check if entry is published
        if (loadedEntry.published === false) {
          navigate('/foodball');
          return;
        }
        
        setEntry(loadedEntry);
        
        // Reset flipping state after a short delay
        if (isFlipping) {
          setTimeout(() => setIsFlipping(false), 100);
        }
      } catch (err) {
        console.error('Error loading entry:', err);
        setError('Failed to load entry');
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, [id, navigate, isFlipping]);

  const navigateToEntry = useCallback((newIndex) => {
    if (newIndex < 0 || newIndex >= allEntries.length || isFlipping) return;
    
    // Determine flip direction
    const isNext = newIndex > currentIndex;
    setFlipDirection(isNext ? 'flipping-next' : 'flipping');
    
    setIsFlipping(true);
    const newEntryId = allEntries[newIndex].id;
    
    // Navigate after animation completes (1.2s)
    setTimeout(() => {
      navigate(`/foodball/${newEntryId}`, { replace: false });
    }, 1200);
  }, [allEntries, isFlipping, navigate, currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isFlipping || loading || !entry) return;
      
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        navigateToEntry(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < allEntries.length - 1) {
        navigateToEntry(currentIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, allEntries, isFlipping, loading, entry, navigateToEntry]);

  // Touch/swipe navigation for mobile
  useEffect(() => {
    if (!entry || isFlipping || loading) return;

    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    };

    const handleSwipe = () => {
      const swipeThreshold = 50; // Minimum distance for swipe
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0 && currentIndex < allEntries.length - 1) {
          // Swipe left - next page
          navigateToEntry(currentIndex + 1);
        } else if (diff < 0 && currentIndex > 0) {
          // Swipe right - previous page
          navigateToEntry(currentIndex - 1);
        }
      }
    };

    const entryElement = document.querySelector('.entry-detail');
    if (entryElement) {
      entryElement.addEventListener('touchstart', handleTouchStart, { passive: true });
      entryElement.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      if (entryElement) {
        entryElement.removeEventListener('touchstart', handleTouchStart);
        entryElement.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [entry, isFlipping, loading, currentIndex, allEntries, navigateToEntry]);

  // Determine flip direction based on navigation
  useEffect(() => {
    if (!isFlipping) {
      setFlipDirection('');
    }
  }, [isFlipping]);

  const previousEntry = currentIndex > 0 ? allEntries[currentIndex - 1] : null;
  const nextEntry = currentIndex < allEntries.length - 1 ? allEntries[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="foodball-entry">
        <div className="entry-navigation">
          <Link to="/foodball" className="back-link">
            ← Back to Journal
          </Link>
        </div>
        <div className="loading">Loading entry...</div>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="foodball-entry">
        <div className="entry-navigation">
          <Link to="/foodball" className="back-link">
            ← Back to Journal
          </Link>
        </div>
        <div className="error">
          {error || 'Entry not found'}
        </div>
      </div>
    );
  }

  // Process content to convert custom image syntax to HTML
  const processContent = (content) => {
    // Convert ![alt](image.jpg "caption") to entry-image-box HTML
    return content.replace(
      /!\[([^\]]*)\]\(([^)]+)\s+"([^"]+)"\)/g,
      '<div class="entry-image-box"><img src="$2" alt="$1" class="entry-image" /><div class="entry-image-caption">$3</div></div>'
    );
  };

  // Custom components for ReactMarkdown
  const components = {
    // Only apply custom img component to markdown images, not HTML images
    img: ({ src, alt, className }) => {
      // If this is part of our entry-image-box structure, don't wrap it
      if (className && className.includes('entry-image')) {
        return (
          <HeicImage 
            src={src} 
            alt={alt}
            className={className}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        );
      }
      // For regular markdown images, wrap in container
      return (
        <span className="entry-image-container">
          <HeicImage 
            src={src} 
            alt={alt}
            className="entry-image"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </span>
      );
    },
    video: ({ children, ...props }) => (
      <video {...props}>
        {children}
      </video>
    ),
    source: ({ ...props }) => (
      <source {...props} />
    ),
    iframe: ({ src, width, height, frameborder, allowfullscreen, title, ...props }) => (
      <iframe 
        src={src} 
        width={width} 
        height={height} 
        frameBorder={frameborder} 
        allowFullScreen={allowfullscreen}
        title={title || "Embedded content"}
        {...props}
      />
    )
  };

  return (
    <div className={`foodball-entry ${flipDirection}`}>
      <div className="entry-navigation">
        <Link to="/foodball" className="back-link">
          ← Back to Journal
        </Link>
        <div className="page-navigation">
          {previousEntry && (
            <button 
              onClick={() => navigateToEntry(currentIndex - 1)}
              className="page-nav-button prev-button"
              disabled={isFlipping}
            >
              ← Previous
            </button>
          )}
          <span className="page-counter">
            {currentIndex + 1} / {allEntries.length}
          </span>
          {nextEntry && (
            <button 
              onClick={() => navigateToEntry(currentIndex + 1)}
              className="page-nav-button next-button"
              disabled={isFlipping}
            >
              Next →
            </button>
          )}
        </div>
      </div>

      <div className="entry-detail">
        <div className="entry-header">
          <h1>{entry.title}</h1>
          <span className="entry-date">{entry.date}</span>
        </div>
        {entry.image && (
          <div className="entry-image-container">
            <HeicImage 
              src={entry.image} 
              alt={entry.title}
              className="entry-image"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="entry-content">
          <ReactMarkdown 
            components={components} 
            remarkPlugins={[]} 
            rehypePlugins={[rehypeRaw]}
          >
            {processContent(entry.content)}
          </ReactMarkdown>
        </div>
      </div>

      {/* Comment Section */}
      <CommentSection entryId={entry.id} user={user} />
    </div>
  );
}

export default FoodballEntry; 
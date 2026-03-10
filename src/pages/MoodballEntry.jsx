import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import HeicImage from '../components/HeicImage';
import CommentSection from '../components/CommentSection';
import { getEntry, getSortedEntriesMetadata } from '../moodball_entries';
import '../styles/foodball.css';

function MoodballEntry({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allEntries, setAllEntries] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    const loadEntries = async () => {
      try {
        setLoading(true);
        setEntry(null);

        const entries = await getSortedEntriesMetadata('date-high', false);
        setAllEntries(entries);

        const entryId = parseInt(id);
        const index = entries.findIndex(e => e.id === entryId);

        if (index === -1) {
          navigate('/moodball');
          return;
        }

        setCurrentIndex(index);

        const loadedEntry = await getEntry(id);

        if (!loadedEntry) {
          navigate('/moodball');
          return;
        }

        if (loadedEntry.published === false) {
          navigate('/moodball');
          return;
        }

        setEntry(loadedEntry);
      } catch (err) {
        console.error('Error loading entry:', err);
        setError('Failed to load entry');
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, [id, navigate]);

  const navigateToEntry = useCallback((newIndex) => {
    if (newIndex < 0 || newIndex >= allEntries.length) return;
    const newEntryId = allEntries[newIndex].id;
    navigate(`/moodball/${newEntryId}`, { replace: false });
  }, [allEntries, navigate]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (loading || !entry) return;
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        navigateToEntry(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < allEntries.length - 1) {
        navigateToEntry(currentIndex + 1);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, allEntries, loading, entry, navigateToEntry]);

  const previousEntry = currentIndex > 0 ? allEntries[currentIndex - 1] : null;
  const nextEntry = currentIndex < allEntries.length - 1 ? allEntries[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="foodball-entry">
        <div className="entry-navigation">
          <Link to="/moodball" className="back-link">
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
          <Link to="/moodball" className="back-link">
            ← Back to Journal
          </Link>
        </div>
        <div className="error">
          {error || 'Entry not found'}
        </div>
      </div>
    );
  }

  const processContent = (content) => {
    return content.replace(
      /!\[([^\]]*)\]\(([^)]+)\s+"([^"]+)"\)/g,
      '<div class="entry-image-box"><img src="$2" alt="$1" class="entry-image" loading="lazy" /><div class="entry-image-caption">$3</div></div>'
    );
  };

  const components = {
    img: ({ src, alt, className }) => {
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
    video: ({ children, ...props }) => <video {...props}>{children}</video>,
    source: ({ ...props }) => <source {...props} />,
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
    <div className="foodball-entry">
      <div className="entry-navigation">
        <Link to="/moodball" className="back-link">
          ← Back to Journal
        </Link>
        <div className="page-navigation">
          {previousEntry && (
            <button
              onClick={() => navigateToEntry(currentIndex - 1)}
              className="page-nav-button prev-button"
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

      <CommentSection entryId={entry.id} user={user} game="moodball" />
    </div>
  );
}

export default MoodballEntry;

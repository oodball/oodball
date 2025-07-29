import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import HeicImage from '../components/HeicImage';
import CommentSection from '../components/CommentSection';
import { allEntries } from '../entries';
import '../styles/foodball.css';

function FoodballEntry({user}) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Find the entry by ID
  const entry = allEntries.find(e => e.id === parseInt(id));

  if (!entry) {
    navigate('/foodball');
    return null;
  }

  // Custom components for ReactMarkdown
  const components = {
    img: ({ src, alt }) => (
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
    ),
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
    <div className="foodball-entry">
      <div className="entry-navigation">
        <Link to="/foodball" className="back-link">
          ← Back to Journal
        </Link>
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
            {entry.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Comment Section */}
      <CommentSection entryId={entry.id} user={user} />
    </div>
  );
}

export default FoodballEntry; 
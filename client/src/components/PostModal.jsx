import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  BarChart2,
  AlignLeft,
  Plus,
  X,
  Smile,
} from 'lucide-react';
import { useToast } from '../hooks/useToast.js';
import { useOnClickOutside } from '../hooks/useOnClickOutside.js';
import CustomEmojiPicker from './CustomEmojiPicker.jsx';

// Combined and expanded list from Home.jsx and existing modal
const CATEGORIES = [
  'Relationships',
  'Funny',
  'School',
  'Confessions',
  'Advice',
  'Random',
  'Gaming',
  'Music',
  'Tech',
  'Politics',
  'Sports',
  'Art',
  'Books',
  'Campus Life',
  'Mental Health',
  'Movies',
  'Food',
  'Travel',
  'Work',
  'Pets',
];
const MAX_CHAR_LIMIT = 500;

const PostModal = ({ isOpen, onClose, onAddPost }) => {
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [customTag, setCustomTag] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  // Poll State
  const [postType, setPostType] = useState('text'); // 'text' | 'poll'
  const [pollOptions, setPollOptions] = useState(['', '']);

  const addToast = useToast();
  const categoryRef = useRef(null);
  const emojiRef = useRef(null);

  useOnClickOutside(categoryRef, () => setIsCategoryOpen(false));
  useOnClickOutside(emojiRef, () => setShowEmoji(false));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) {
      if (!content.trim()) addToast('Post content is required.', 'error');
      return;
    }

    // Tag logic: Prefer custom tag if present, else category, else 'General'
    let finalTag = customTag.trim()
      ? customTag.trim()
      : selectedCategory
        ? selectedCategory
        : 'General';
    // Ensure hashtag
    if (!finalTag.startsWith('#'))
      finalTag = `#${finalTag.replace(/\s+/g, '')}`;

    if (postType === 'poll') {
      const validOptions = pollOptions.filter((o) => o.trim() !== '');
      if (validOptions.length < 2) {
        addToast('Polls must have at least 2 options.', 'error');
        return;
      }
    }

    setIsSubmitting(true);
    const tags = [finalTag];

    // Prepare Poll Options
    const finalPollOptions =
      postType === 'poll'
        ? pollOptions.filter((o) => o.trim() !== '').map((text) => ({ text }))
        : [];

    const { success, error } = await onAddPost(
      content,
      tags,
      postType,
      finalPollOptions,
    );
    if (success) {
      setContent('');
      setSelectedCategory(null);
      setCustomTag('');
      setPollOptions(['', '']);
      setPostType('text');
      addToast('Posted anonymously!', 'success');
      onClose();
    } else {
      addToast(error || 'Failed to post.', 'error');
    }
    setIsSubmitting(false);
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setCustomTag(''); // Clear custom if selecting predefined
    setIsCategoryOpen(false);
  };

  const handleAddOption = () => {
    if (pollOptions.length < 4) setPollOptions([...pollOptions, '']);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleRemoveOption = (index) => {
    if (pollOptions.length > 2) {
      const newOptions = pollOptions.filter((_, i) => i !== index);
      setPollOptions(newOptions);
    }
  };

  const onEmojiClick = (emoji) => {
    setContent((prev) => prev + emoji);
    setShowEmoji(false);
  };

  const charCount = content.length;
  const isLowWidth = window.innerWidth < 412;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className='modal-overlay'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}>
          <motion.div
            className='modal-content'
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}>
            <form className='modal-form' onSubmit={handleSubmit}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}>
                <h2 className='modal-title' style={{ margin: 0 }}>
                  Create Post
                </h2>
                <div
                  style={{
                    display: 'flex',
                    background: 'var(--input-bg)',
                    borderRadius: '8px',
                    padding: 2,
                  }}>
                  <button
                    type='button'
                    onClick={() => setPostType('text')}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '6px',
                      background:
                        postType === 'text'
                          ? 'var(--glass-highlight)'
                          : 'transparent',
                      color:
                        postType === 'text'
                          ? 'var(--text-main)'
                          : 'var(--text-muted)',
                    }}>
                    <AlignLeft size={18} />
                  </button>
                  <button
                    type='button'
                    onClick={() => setPostType('poll')}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '6px',
                      background:
                        postType === 'poll'
                          ? 'var(--glass-highlight)'
                          : 'transparent',
                      color:
                        postType === 'poll'
                          ? 'var(--text-main)'
                          : 'var(--text-muted)',
                    }}>
                    <BarChart2 size={18} />
                  </button>
                </div>
              </div>

              <div className='textarea-wrapper' ref={emojiRef}>
                <textarea
                  className='styled-textarea'
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    postType === 'poll'
                      ? 'Ask a question...'
                      : 'Share your secrets, thoughts, or stories here...'
                  }
                  style={{ height: postType === 'poll' ? '80px' : '150px' }}
                />
                <button
                  type='button'
                  onClick={() => setShowEmoji(!showEmoji)}
                  style={{
                    position: 'absolute',
                    bottom: '13px',
                    left: '10px',
                    color: 'var(--text-muted)',
                  }}>
                  <Smile size={20} />
                </button>
                <div
                  className={`char-counter ${charCount > MAX_CHAR_LIMIT ? 'error' : ''}`}>
                  {charCount}/{MAX_CHAR_LIMIT}
                </div>

                {showEmoji && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '40px',
                      left: isLowWidth ? '-33px' : '0',
                      zIndex: 50,
                    }}>
                    <CustomEmojiPicker onEmojiClick={onEmojiClick} />
                  </div>
                )}
              </div>

              {postType === 'poll' && (
                <div style={{ marginBottom: '1rem' }}>
                  {pollOptions.map((opt, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginBottom: '0.5rem',
                      }}>
                      <input
                        className='comment-input'
                        style={{
                          borderRadius: '12px',
                          padding: '0.6rem 0.85rem',
                        }}
                        placeholder={`Option ${idx + 1}`}
                        value={opt}
                        onChange={(e) =>
                          handleOptionChange(idx, e.target.value)
                        }
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type='button'
                          onClick={() => handleRemoveOption(idx)}
                          style={{ color: 'var(--text-muted)' }}>
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  {pollOptions.length < 4 && (
                    <button
                      type='button'
                      onClick={handleAddOption}
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}>
                      <Plus size={16} /> Add Option
                    </button>
                  )}
                </div>
              )}

              <div
                className='category-select-wrapper'
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexDirection: 'column',
                }}>
                <div className='category-dropdown-container' ref={categoryRef}>
                  <button
                    type='button'
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className={`category-button ${isCategoryOpen ? 'is-open' : ''} ${selectedCategory ? 'has-selection' : ''}`}>
                    <span>
                      {selectedCategory
                        ? `Tag: #${selectedCategory}`
                        : 'Select a Tag (Optional)'}
                    </span>
                    <ChevronDown size={20} />
                  </button>
                  <AnimatePresence>
                    {isCategoryOpen && (
                      <motion.ul
                        className='category-dropdown'
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}>
                        {CATEGORIES.map((cat) => (
                          <li
                            key={cat}
                            className='category-item'
                            onClick={() => handleSelectCategory(cat)}>
                            #{cat}
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginTop: '0.5rem',
                  }}>
                  <span
                    style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    OR
                  </span>
                  <input
                    className='comment-input'
                    style={{ borderRadius: '12px', padding: '0.6rem 0.85rem' }}
                    placeholder='Custom tag (e.g. #FinalsWeek)'
                    value={customTag}
                    onChange={(e) => {
                      setCustomTag(e.target.value);
                      setSelectedCategory(null);
                    }}
                  />
                </div>
              </div>

              <div className='modal-actions'>
                <button
                  type='button'
                  className='cancel-button'
                  onClick={onClose}>
                  Cancel
                </button>
                <button
                  type='submit'
                  className='submit-button'
                  disabled={
                    !content.trim() ||
                    isSubmitting ||
                    content.length > MAX_CHAR_LIMIT
                  }>
                  {isSubmitting ? 'Posting...' : 'Post Anonymously'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PostModal;

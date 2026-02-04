import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, BarChart2, AlignLeft, Plus, X } from 'lucide-react';
import { useToast } from '../hooks/useToast.js';
import { useOnClickOutside } from '../hooks/useOnClickOutside.js';

const CATEGORIES = [
  'Relationships',
  'Campus Life',
  'Mental Health',
  'Funny',
  'Random',
];
const MAX_CHAR_LIMIT = 280;

const PostModal = ({ isOpen, onClose, onAddPost }) => {
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Poll State
  const [postType, setPostType] = useState('text'); // 'text' | 'poll'
  const [pollOptions, setPollOptions] = useState(['', '']);

  const addToast = useToast();
  const categoryRef = useRef(null);

  useOnClickOutside(categoryRef, () => setIsCategoryOpen(false));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !selectedCategory || isSubmitting) {
      if (!selectedCategory) addToast('Please select a category.', 'error');
      return;
    }

    if (postType === 'poll') {
      const validOptions = pollOptions.filter((o) => o.trim() !== '');
      if (validOptions.length < 2) {
        addToast('Polls must have at least 2 options.', 'error');
        return;
      }
    }

    setIsSubmitting(true);
    const tags = [`#${selectedCategory.replace(/\s+/g, '')}`];

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

  const charCount = content.length;

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

              <div className='textarea-wrapper'>
                <textarea
                  className='styled-textarea'
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    postType === 'poll'
                      ? 'Ask a question...'
                      : 'Share your secrets, thoughts, or stories here...'
                  }
                  style={{ height: postType === 'poll' ? '80px' : '120px' }}
                />
                <div
                  className={`char-counter ${charCount > MAX_CHAR_LIMIT ? 'error' : ''}`}>
                  {charCount}/{MAX_CHAR_LIMIT}
                </div>
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

              <div className='category-select-wrapper'>
                <div className='category-dropdown-container' ref={categoryRef}>
                  <button
                    type='button'
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className={`category-button ${isCategoryOpen ? 'is-open' : ''} ${selectedCategory ? 'has-selection' : ''}`}>
                    <span>
                      {selectedCategory
                        ? `Category: ${selectedCategory}`
                        : 'Select a Category'}
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
                            {cat}
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
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
                    !selectedCategory ||
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
